# Harper Application Template

Test your application works by querying the `/Greeting` endpoint:

```sh
curl http://localhost:9926/Greeting
```

Should result in:

```json
{"greeting":"Hello, world!"}
```

Or navigate to [http://localhost:9926](http://localhost:9926) in a browser and view the functional web application.

For more information about getting started with HarperDB and building applications, see our [getting started guide](https://docs.harperdb.io/docs/getting-started).

For more information on Harper Components, see the [Components documentation](https://docs.harperdb.io/docs/developers/components).

This template includes a [default configuration](./config.yaml), which specifies how files are handled in your application.

The [schema.graphql](./schema.graphql) is the table schema definition. This is the main starting point for defining your database schema, specifying which tables you want and what attributes/fields they should have.

The [resources.js](./resources.js) provides a template for defining JavaScript resource classes, for customized application logic in your endpoints.
