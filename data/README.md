# HarperDB Data Loader

This directory contains YAML or JSON files that are automatically loaded into your HarperDB database tables when your application starts.

## How It Works

1. Place data files in this directory with `.yaml`, `.yml`, or `.json` extensions
2. Files are processed when HarperDB starts
3. Records are inserted/updated based on file modification time:
   - New records are always added
   - Existing records are only updated if the file's modification time is newer than the record's stored timestamp
   - Records with timestamps newer than the file's modification time are preserved unchanged

## File Format

Data files must contain `table` and `records` fields. The `database` field is optional.

### JSON Example

```jsonc
{
  "database": "dev",       // Optional - uses default database if omitted
  "table": "Product",      // Required - name of the table
  "records": [             // Required - array of records
    {
      "id": "1",           // Primary key field
      "name": "Laptop",
      "price": 999.99
    }
  ]
}
```

### YAML Example

```yaml
database: dev              # Optional - uses default database if omitted
table: products            # Required - name of the table
records:                   # Required - array of records
  - id: 1                  # Primary key field
    name: "Laptop"
    price: 999.99
```

## Key Features

- **Automatic Table Creation**: Tables are created if they don't exist
- **Schema Inference**:
  - The system will automatically infer a schema from the first record when creating a new table
  - The `id` field is automatically detected as the primary key
  - It's preferred to define the schema explicitly in your application, but this provides a quick start
- **File Modification Time**:
  - The data loader uses the file's modification time (`mtime`) to determine if records should be updated
  - "Touching" a file (updating its modification time) will force a reload of its data
- **Multi-file Support**: You can have multiple data files for different tables
- **Complex Data Types**: Supports nested objects, arrays, and various data types
- **One Table Per File**: Each file should define one table

## Tips for Managing Data

- To force a reload of data, simply update the file's modification time:
  ```bash
  # Update the file's timestamp using touch
  touch data/products.json
  ```
- If you need to restore to previous data, you can replace the file and update its timestamp
- The system automatically handles the comparison between file modification time and record timestamps