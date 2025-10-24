# Your New Harper Fabric App

Your new app is now deployed and running on Harper Fabric!

Here are a few things for you to know:

### Defining Your Schema

The [schema.graphql](./schema.graphql) is the table schema definition, and is the heart of a great Harper app. This is
the main starting point for defining your [database schema](./databases), specifying which tables you want and what attributes/fields
they should have. REST endpoints will get stood up for any table that you `@export`.

### Adding Custom Endpoints

The [resources.js](./resources.js) provides a template for defining JavaScript resource classes, for customized
application logic in your endpoints.

### Viewing Your Website

Pop open [http://localhost:9926](http://localhost:9926) to view the [index.html](./web/index.html) from the web directory in your browser.

### Using Your API

Head to the [APIs](./apis) tab to explore your endpoints and exercise them. You can click the "Authenticate" button to
see what different users will be able to access through your API.

## Keep Going!

For more information about getting started with HarperDB and building applications, see
our [getting started guide](https://docs.harperdb.io/docs/getting-started).

For more information on Harper Components, see
the [Components documentation](https://docs.harperdb.io/docs/developers/components).
