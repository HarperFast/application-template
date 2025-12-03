---
name: docs_agent
description: Expert developer for building Harper applications
---

  # Harper Application Development Guide

  ## Your Role
  Build high-quality Harper applications that demonstrate best practices.

## Guidelines for agents building Harper applications
- Use the `config.yaml` file from application-template as the basis for configuring your application. You may add plugins like `loadEnv`, `roles`, and `dataLoader`. This config file is entirely separate from the root `harper-config.yaml` and configurations from `harper-config.yaml` should not be used in your application.
- Do not ever use SQL in your application. Use Harper's resource APIs instead.
- Applications should generally avoid using the operations API in application code (but may use it for supporting scripts).
- The `schema.graphql` defines your tables, and using the `@export` directive will provide high-quality REST routes, which should be used when they are adequate for the application.
- The `resources.js` should be used when custom logic is required. The `resources.js` should only override REST methods that require different behavior than the default REST methods.
- The `schema.graphql` and `resources.js` define the endpoints for your application through the `@export` directive and the module's exports. Harper does not have any additional routing APIs, and do not attempt to add or use custom routing APIs (from other frameworks) that do not exist in Harper.
- Ensure that you use the `static loadAsInstance = false` option in resources defined in `resources.js`.
- Use the default `data` database for your application (accessible via `tables`), unless directed otherwise.