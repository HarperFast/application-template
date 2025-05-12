# HarperDB Data Loader

This directory contains data files that are automatically loaded into your HarperDB database tables when your application starts. The Data Loader component reads YAML or JSON files and populates your database tables with the specified data.

## How It Works

1. Data files must be placed in this directory with `.yaml`, `.yml`, or `.json` extensions
2. Data files are processed when HarperDB starts
3. Records are loaded based on timestamp comparison:
   - New records are added
   - Existing records are updated if the new data has a newer `__updatedtime__`
   - Existing records are kept if they have a newer `__updatedtime__` than the data file

## File Format

### YAML Example

```yaml
# Format: { database, table, records[] }
database: dev
table: products
records:
  - id: 1
    name: "Laptop"
    price: 999.99
    __createdtime__: 1682752800000
    __updatedtime__: 1682752800000
  - id: 2
    name: "Smartphone"
    price: 699.99
    __createdtime__: 1682752801000
    __updatedtime__: 1682752801000
```

### JSON Example

```json
{
  "database": "dev",
  "table": "products",
  "records": [
    {
      "id": 1,
      "name": "Laptop",
      "price": 999.99,
      "__createdtime__": 1682752800000,
      "__updatedtime__": 1682752800000
    },
    {
      "id": 2,
      "name": "Smartphone",
      "price": 699.99,
      "__createdtime__": 1682752801000,
      "__updatedtime__": 1682752801000
    }
  ]
}
```

## Important Notes

- Tables are automatically created if they don't exist
- Primary keys are preserved from your data
- Use `__updatedtime__` and `__createdtime__` timestamps to control updates
  - Records with newer `__updatedtime__` values will overwrite older ones
  - Records with older `__updatedtime__` values will be skipped (not overwritten)
  - If no timestamp is provided, the current time is used as `__updatedtime__`
- One table per file: Each file should have one database/table combination
- You can have multiple data files, and they'll all be processed
- The `database` field is optional; if not provided, the default database is used