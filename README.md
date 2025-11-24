# Your New Harper Fabric App

This repository is a template for building applications with [Harper](https://www.harper.fast/). This template includes:
+ 2 tables: Owner, Dog
+ 1 computed field: owner_dog_count
+ 1 relationship: Owners → Dogs
+ 1 custom resource: /OwnerHasBreed

This template is designed to help you quickly learn Harper’s application model and best practices.

**Explore the project:**
- `config.yaml`: Main application configuration (routes, settings, etc.)
- `schema.graphql`: Defines tables, fields, relationships, and computed attributes.
- `resources.js`: Implements custom resource classes and endpoint logic.
- `web/`: Contains the frontend web application (HTML, JS, CSS).

For more information about getting started with HarperDB and building applications, see our [getting started guide](https://docs.harperdb.io/docs).

## Installation

To get started, make sure you have [installed Harper](https://docs.harperdb.io/docs/deployments/install-harper), which can be done quickly:

```sh
npm install -g harperdb
```

## Development

Then you can start your app:
```sh
npm run dev
```

Harper will start at:

```
http://localhost:9926/
```

All tables and resources in this project are automatically available when the app starts. Visit http://localhost:9926/ in your browser to explore the web application and interact with the REST API endpoints.

## Project Structure

```graphql
.
├── config.yaml         # App configuration
├── schema.graphql      # Table definitions, computed fields, relationships
├── resources.js        # Custom logic for tables + resources
├── web/                # Client-side web app
│   ├── index.html
│   ├── index.js
│   └── styles.css
└── README.md
```

## Database Schema

All tables are defined in schema.graphql. This template includes two tables: Owner and Dog. Harper automatically exposes REST endpoints for both tables:

```python-repl
GET    /Dog
POST   /Dog
PUT    /Dog
PATCH  /Dog
DELETE /Dog
GET    /Owner
... etc.
```

## Example Workflow

### 1. Create Dog

```sh
curl -X POST http://localhost:9926/Dog \
  -H "Content-Type: application/json" \
  -d '{
    "id": "123",
    "name": "Willow",
    "breed": "Great Pyrenees"
  }'
```

### 2. Create Owner

```sh
curl -X POST http://localhost:9926/Owner \
  -H "Content-Type: application/json" \
  -d '{
    "id": "456",
    "name": "Bailey",
    "dogIds": ["123"]
  }'
```

### 3. Use the Custom Resource

```sh
curl "http://localhost:9926/OwnerHasBreed?ownerName=Bailey&breed=Great%20Pyrenees"
```

Response:
```json
{
  "statusCode": 200,
  "ownerName": "Bailey",
  "breed": "Great Pyrenees",
  "hasBreed": true
}
```


## Deployment

When you are ready, head to [https://fabric.harper.fast/](https://fabric.harper.fast/), log in to your account, and create a cluster.

Set up your .env file with your secure cluster credentials. Don't commit this file to source control!

```sh
npm run login
```

Then you can deploy your app to your cluster:

```sh
npm run deploy
```
