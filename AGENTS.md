============================================================
HARPER KNOWLEDGE CONTEXT (LONG FORM, TECHNICAL)
============================================================

This context provides technical reference patterns for building Harper
applications and components. All generated code MUST be consistent with
these patterns and the conventions in the HarperFast GitHub organization
(especially the "harper" and "application-template" repos).

The model should treat this as authoritative guidance.

============================================================
1. HARPER ARCHITECTURE OVERVIEW
   ============================================================

Harper is an all-in-one backend runtime that merges:

- Database engine
- In-memory cache
- Application logic (resources, components, plugins)
- Messaging and WebSocket handling

All of this runs inside a single Node.js process, reducing network hops
and serialization overhead.

Key ideas:

- Components: Versioned, pluggable units (applications or extensions).
- Applications: Top-level components that expose functionality (web app,
  API, etc.). They usually have a config.yaml and their own schema and
  resources.
- Extensions: Components used by applications to add capabilities
  (GraphQL schema loading, JS resources, static file serving, etc.).
- Operations API: A JSON-over-HTTP API used to perform database and
  administrative operations (SQL, insert, update, delete, add_component,
  etc.).

Harper apps are usually developed and run via:

- A component directory with config.yaml, schema.graphql, resources.js,
  and optional web assets and dependencies.
- Running Harper in a mode that loads your component and exposes REST,
  GraphQL, and other endpoints based on your configuration.

============================================================
2. COMPONENTS, APPLICATIONS, AND EXTENSIONS
   ============================================================

Harper uses a component system with two main flavors:

- Applications:
	- Top-level components that implement a concrete app or service.
	- Typically include:
		- config.yaml
		- schema.graphql
		- resources.js
		- web/ (optional)
		- package.json
	- During load, Harper reads config.yaml to determine which built-in
	  components and extensions to activate (rest, graphqlSchema, jsResource,
	  static, etc.).

- Extensions:
	- Components that provide reusable capabilities to other components.
	- Two important classes:
		- Resource extensions: Process files and produce resources/endpoints.
		  Example: jsResource.
		- Protocol extensions: Provide protocol-level behavior that can
		  expose resource extensions (HTTP, WebSocket, etc.).
	- Built-in examples:
		- graphqlSchema (resource extension; loads schema.graphql files
		  into the database schema).
		- jsResource (resource extension; loads JavaScript modules as
		  Resource classes/endpoints).
		- static (resource extension; serves static files from a directory).
		- rest (protocol-level component; exposes REST endpoints for
		  exported resources).

Applications depend on extensions via config.yaml; extensions may also
depend on other extensions.

============================================================
3. CONFIG.YAML – COMPONENT CONFIGURATION
   ============================================================

Each Harper component is configured via a config.yaml file in its root
directory. For an application, config.yaml is the primary place where:

- Built-in components and extensions are enabled.
- Options for those components are provided.
- Optional install hooks and component-level settings are defined.
- This is not a JSON object; it is a YAML file with proper syntax.

Core ideas:

- Config is a YAML object where top-level keys correspond to components
  by name (rest, graphqlSchema, jsResource, static, loadEnv, roles,
  and any explicitly included plugins).
- Values can be:
	- A boolean (true/false) to enable/disable a component with defaults.
	- An object containing options, including "files" for file globs,
	  and other component-specific settings.

Canonical minimal Harper application config:

rest: true

graphqlSchema:
  files: "schema.graphql"

jsResource:
  files: "resources.js"

static:
  files: "web/*"

Additional common options:

- loadEnv:
	- files: ".env"
	  This loads environment variables from specified files before the
	  application starts.

- rest:
	- lastModified: true|false
	- webSocket: true|false
	  These control REST-specific features like Last-Modified headers and
	  WebSocket support.

- roles:
	- files: "roles.yaml"
	  For configuring role-based access control for tables and resources.

- dataLoader:
	- files: "data.json"
      For preloading data into the database.

- Plugins or custom extensions can be added under their own keys:
  myPlugin:
    package: "@harperdb/my-plugin"
    files: "foo.js"
    timeout: 45000

Application-specific install behavior:

- Harper can run an install command for an application when loading it,
  based on "install" in config.yaml or harperdb-config.yaml (depending
  on setup).
- Typical structure:
  install:
  command: "npm install"
  timeout: 600000

Important constraints:

- config.yaml for a component is not merged with a global default config
  if present; it fully defines the component configuration.
- Generated config.yaml must be syntactically valid YAML with consistent
  indentation and quoting.

============================================================
4. BUILT-IN COMPONENTS AND EXTENSIONS
   ============================================================

Harper ships with several built-in components/extensions commonly used
by applications.

4.1 rest component

- Enables automatic REST endpoints for exported resources.
- Typical usage:

  rest: true

- Additional options:

  rest:
  lastModified: true
  webSocket: false

- When enabled, each exported Resource class becomes accessible via
  REST endpoints with patterns based on the class name and package
  structure.

4.2 graphqlSchema extension

- Loads GraphQL schema files and uses them to define databases, tables,
  attributes, relationships, and computed fields.

  graphqlSchema:
  files: "schema.graphql"

- The "files" option is usually a glob. Multiple schema files can be
  used (e.g. "schema/*.graphql").
- The extension parses Harper-specific annotations on types and fields,
  then creates/updates tables and attributes accordingly.

4.3 jsResource extension

- Loads JavaScript files as Harper resources.

  jsResource:
  files: "resources.js"

- Each exported class or function in these files can become a resource
  exposed via REST (and other protocols).
- If a class extends a table class (from databases.<db>.<TableName>),
  it becomes the handler for table-level REST operations with custom
  behavior.
- If a class extends Resource, it becomes a custom resource not directly
  bound to a table.

4.4 static component

- Serves static files from a directory as an HTTP site.

  static:
  files: "web/*"

- Typically used by applications with a web/ directory containing
  index.html (and potentially a full frontend build, such as React).

4.5 loadEnv component

- Loads environment variables from one or more files before initialization.

  loadEnv:
  files: ".env"

- Typically used to provide HARPER_URL, HARPER_USERNAME, HARPER_PASSWORD,
  and other secrets or configuration values.

4.6 roles component

- Configures table and resource roles/permissions via a roles definition
  file.

  roles:
  files: "roles.yaml"

============================================================
5. GRAPHQL SCHEMA AND DATABASE MODELING
   ============================================================

Harper uses GraphQL schema files to define table structures and their
relationships. These schemas are read by the graphqlSchema extension.

Key annotations on types:

- @table(database: "name")
	- Marks a type as a table, belonging to a particular database.
- @export
	- Marks a table as exported, making it available to extensions such
	  as rest and jsResource.
- @primaryKey
	- Marks a field as the primary key (hash) for the table.
- @indexed
	- Marks a field as indexed for faster querying.
- @computed(version: N)
	- Marks a field as a computed attribute whose logic is implemented
	  in JavaScript via setComputedAttribute.
- @relationship(from: fieldName)
- @relationship(to: fieldName)
	- Define relationships between tables based on ID arrays or foreign
	  key attributes.

Canonical example pattern:

type Owner @table() @export {
id: ID @primaryKey
name: String! @indexed
dogIds: [ID] @indexed

ownerDogCount: Int @computed(version: 1)
dogs: [Dog] @relationship(from: dogIds)
}

type Dog @table() @export {
id: ID @primaryKey
name: String! @indexed
breed: String! @indexed

owner: [Owner] @relationship(to: dogIds)
}

Important rules:

- GraphQL types must be syntactically valid (schema must parse).
- Non-null required fields should be marked with "!" when appropriate.
- Relationship fields should use names that match the relationship type
  and be consistent with the underlying schema logic.
- @computed fields must be backed by a JS implementation using
  setComputedAttribute on the corresponding table class.

============================================================
6. RESOURCES, TABLE CLASSES, AND CUSTOM LOGIC
   ============================================================

Harper exposes resources via JavaScript classes/functions loaded by
jsResource.

6.1 Table classes

- Generated from GraphQL schema types marked with @table.
- Available under the "databases" import:

  import { tables } from "harperdb";

  const OwnerTable = tables.Owner;

- Methods typically include:
	- create(record, context)
	- put(record, context)
	- delete(identifier, context)
	- search(query, context)
	- get(identifier, context)

- Table classes support:

  OwnerTable.setComputedAttribute("fieldName", (record) => value);

  This is used to implement computed fields defined with @computed
  in schema.graphql.

6.2 Extending table classes as resources

- To add custom REST behavior for a table, create a class that extends
  the table class:

  import { tables } from "harperdb";

  const OwnerTable = tables.Owner;

  export class Owner extends OwnerTable {
  static loadAsInstance = false;

  async post(target, data) {
  // Custom validation and creation logic.
  }

  async get(target) {
  // Custom read logic.
  }

  async put(target, data) {
  // Custom update logic.
  }

  async delete(target) {
  // Custom delete logic.
  }
  }

- The class name often matches the table name for clarity, but it can
  differ as long as config and exports are consistent.
- loadAsInstance = false means Harper can use the class directly without
  constructing a long-lived instance per request.

6.3 Resource base class

- For resources not tied directly to a single table, extend the Resource
  base class:

  import { Resource, tables } from "harperdb";

  export class OwnerHasBreed extends Resource {
  static loadAsInstance = false;

  async get(target) {
  const ownerName = target.get("ownerName");
  const breed = target.get("breed");
  // Query owners and related dogs, return result.
  }
  }

- Resource instances receive a "target" object representing the request
  context (URL params, query params, headers, etc.), plus optional data
  for POST/PUT.

6.4 Common patterns in resources.js

- Input validation:
	- Check required fields, collect missing names, return
	  { statusCode: 400, message: "..." } on error.
- Logging:
	- Use logging.info / logger.warn / logger.error to log messages.
- Error handling:
	- Error should be thrown/propagated. Do not catch errors unless there is an appropriate way to tolerate them. Error objects should be assigned a `statusCode` property, if there is an appropriate corresponding HTTP status code.
- Database access:
	- Use the table classes directly (e.g.

============================================================
7. HARPERDB OPERATIONS API
   ============================================================

The Operations API is used to perform administrative
operations. It runs on a separate port (9925), and should only be used for administrative purposes, and generally should not be used by application code.
It uses JSON payloads that include an "operation" field
specifying what is being done.

Common operation shapes:

7.1 Read Logs

{
"operation": "read_logs",
"limit": "100",
"order": "desc"
}

7.5 Component management operations

- add_component:
	- Creates a new component project in the components root directory.
- set_component_file:
	- Writes a file into a component directory.
- deploy_component / reload:
	- Reloads components and applies changes.

When generating example admin logic, use valid operation shapes and
correct field names.

============================================================
8. APPLICATION TEMPLATE STRUCTURE
   ============================================================

Canonical Harper application structure (matching the application-template
and similar example repos):

- config.yaml
- schema.graphql
- resources.js
- web/
	- index.html (or a compiled SPA/SSR front-end)
- package.json (optional)
- .env (optional)
- Additional subdirectories (routes, lib, components, etc.) depending on
  framework integration (Next.js, Astro, etc.).

The model should:

- Always generate at least:
	- config.yaml
	- schema.graphql
	- resources.js
- Use web/ for frontend assets when the user requests a UI.
- Use consistent naming and patterns from these templates.

============================================================
9. APPLICATION LIFECYCLE AND DEPENDENCIES
   ============================================================

High-level lifecycle when Harper loads an application component:

1. Discover component directories.
2. For each application:
	- Read config.yaml.
	- Install dependencies if needed (e.g. running "npm install" based
	  on install configuration).
	- Load built-in components and extensions configured in config.yaml.
	- Process schema.graphql files via graphqlSchema.
	- Process resources.js via jsResource, creating Resource classes.
	- Initialize rest, static, and any plugins (e.g. Next.js) with
	  the configured options.
3. Start serving HTTP requests for REST/GraphQL/static/other endpoints.

Implications for generated code:

- config.yaml must correctly reference files that exist in the files
  array.
- schema.graphql must be syntactically valid and consistent with any
  resources referencing those tables.
- resources.js must import from "harperdb" consistently and avoid
  referencing non-existent databases/tables.
- If you generate Node dependencies, you must create a package.json
  and ensure config.yaml or documentation explains how dependencies are
  installed.

============================================================
10. LOGGING, ERROR HANDLING, AND CONVENTIONS
	============================================================

Logging:

- Prefer simple, structured logs via console.log / console.warn /
  console.error.
- Include prefixes identifying the resource or component:

  console.warn("[OwnerHasBreed] Missing required query parameters", { ownerName, breed });

Error responses:

- For user input errors, use statusCode 400 (Bad Request).
- For missing resources, use statusCode 404.
- For unexpected server errors, use statusCode 500.

Conventions:

- Keep resources small and focused.
- Avoid deeply nested complexity when simple helper functions will do.
- Use async/await consistently for I/O (search, create, etc.).
- Use descriptive names for resources and tables that match the domain.

============================================================
11. PERFORMANCE AND CACHING CONSIDERATIONS
	============================================================

Key performance considerations in Harper:

- In-process database and cache reduce latency; excessive network calls
  to external systems should be minimized.
- Prefer Harper-native querying (search operations on table classes,
  SQL via the Operations API) over ad-hoc in-memory filtering of large
  datasets.
- Use relationships and computed attributes to move work closer to the
  data model when appropriate.
- For high-traffic read-heavy workloads, consider:
	- Using Harper's in-process caching features or patterns from cache-
	  oriented components (e.g. full-page caching).
	- Designing schema and indexes to support the most common queries.

When generating code:

- Avoid unnecessary round trips to Harper for data that can be fetched
  in a single query.
- Use LIMIT and filters in search queries to avoid scanning entire
  tables.
- Keep resource handlers efficient and avoid blocking operations on the
  event loop.

============================================================
12. FRONTEND INTEGRATION (STATIC, NEXT.JS, ETC.)
	============================================================

Harper supports several patterns for serving frontends:

- Pure static frontend:
	- Build a static React/Vue/etc. app into web/.
	- Use the static component to serve assets.
	- Frontend talks to Harper via REST/GraphQL endpoints.

- Next.js integration:
	- Dedicated Harper component acts as the Next.js host.
	- config.yaml uses framework-specific options (not reproduced here).
	- Harper acts as data source and HTTP host for the Next.js app.

- Simple HTML/JS:
	- A minimal web/index.html with inline JS that calls Harper REST
	  endpoints is also valid and often sufficient for small apps.

Guidelines for generated code:

- When the user asks for a UI, generate at least web/index.html that:
	- Explains what the app does.
	- Demonstrates one or more API calls to your resources.
- Keep frontends minimal unless the user explicitly requests a complex
  framework.

[ADVANCED HARPER RESOURCE / BUSINESS LOGIC PATTERNS]

Goal: Resources are the primary place for complex domain logic.
They are NOT just thin CRUD wrappers. You are encouraged to:

- Orchestrate multiple tables in one request.
- Implement multi-step workflows (validate → read → compute → write).
- Use transactions / compensation-style logic where appropriate.
- Enforce domain invariants (e.g. "an order cannot be paid if stock is insufficient").
- Call the Harper Operations API when table methods alone are not enough.
- Normalize and map errors to consistent HTTP status codes.

1) COMMON BUILDING BLOCKS INSIDE RESOURCES

Inside any Resource or table extension, you can:

- Access tables via \`databases.<db>.<TableName>\`.
- Use typical methods:
	- \`Table.create(record, context)\`
	- \`Table.update(record, context)\`
	- \`Table.delete(identifier, context)\`
	- \`Table.search(query, context)\`
	- \`Table.get(identifier, context)\`
- Use \`for await (... of Table.search(query))\` for streaming large results.

- ============================================================
END OF HARPER KNOWLEDGE CONTEXT
============================================================
