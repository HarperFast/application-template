import { tables, Resource } from 'harperdb';

const OwnerTable = tables.Owner

// Computed field example
//
// This shows how to implement a JS-backed computed attribute for a table.
// In schema.graphql, Owner has:
//
//   owner_dog_count: Int @computed(version: 1)
//
// The JS implementation below runs whenever Owner records are read or written.
// Computed values are not stored; they are generated on demand by Harper.

OwnerTable.setComputedAttribute('owner_dog_count', (owner) => {
  if (!owner || !Array.isArray(owner.dogIds)) {
    return 0;
  }
  return owner.dogIds.length;
});

// Example: extending a table
//
// When you want custom behavior on a table-level REST endpoint, you extend
// the table class produced by Harper's table definition. This allows you to
// override GET, POST, PUT, DELETE, etc. while still inheriting all built-in
// behavior from Harper's table implementation.

export class OwnerResource extends OwnerTable {
  static loadAsInstance = false;

  async post(target, data) {
    const record = { ...data };
    // Validate all required fields
    const missingFields = [];
    if (!record.id) missingFields.push('id');
    if (!record.name) missingFields.push('name');
    if (!Array.isArray(record.dogIds)) missingFields.push('dogIds (must be array)');

    if (missingFields.length > 0) {
      return {
        status: 400,
        message: `Missing or invalid fields: ${missingFields.join(', ')}`,
      };
    }

    const created = await OwnerTable.create(record, this);
    return created;
  }
}


// Example: custom resource using relationships
//
// This resource is not tied to a specific table. It demonstrates how to:
//
//   1. Accept query parameters (?ownerName=...&breed=...)
//   2. Query a table using a relationship-aware select structure
//   3. Iterate through owners and their related dogs (Owner → Dogs relationship)
//   4. Return a boolean indicating whether the owner has any dog of the
//      specified breed

export class OwnerHasBreed extends Resource {
  static loadAsInstance = false;

  async get(target) {
      const { ownerName, breed } = target.get('ownerName') && target.get('breed')
        ? { ownerName: target.get('ownerName'), breed: target.get('breed') }
        : {};

      if (!ownerName || !breed) {
        console.warn('[OwnerHasBreed] Missing required query parameters:', { ownerName, breed });
        return {
          statusCode: 400,
          message: "Missing required query parameters: ownerName and breed",
        };
      }

      const query = {
        select: [
          "id",
          "name",
          "dogIds",
          {
            name: "dogs",
            select: ["id", "name", "breed"],
          },
        ],
        conditions: [{ attribute: "name", comparator: "eq", value: ownerName }],
        limit: 1,
      };

      let owner = null;
      for await (const o of OwnerTable.search(query)) {
        owner = o;
      }

      // No owner found → 404
      if (!owner) {
        console.warn('[OwnerHasBreed] No owner found for name:', ownerName);
        return {
          statusCode: 404,
          message: `No owner found with name "${ownerName}"`,
        };
      }

      const dogs = Array.isArray(owner.dogs) ? owner.dogs : [];
      const hasBreed = dogs.some((dog) => dog && dog.breed === breed);

      return {
        statusCode: 200,
        ownerName,
        breed,
        hasBreed,
      };
  }
}

