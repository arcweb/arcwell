## Containerless Development

ℹ️ **Using containers is not a requirement to develop Arcwell.**

If you wish to use containers in your development workflow, the 
Quickstart section of [the README](../README.md) outlines that bootstrapping procedure.

If you wish to run the Arcwell Server and Admin products directly on your
host machine (without Docker), and you have your TypeScript/JavaScript
development environment prepared, follow these steps to get up and
running:

### 1. Expand local dev environment files

This process is the same; follow [the quickstart instructions](../README.md)

You will want to create a database within your local PostgreSQL server and 
update the hydrated `packages/server/.env.development` file to point to that
database. You may need to change as follows:

```sh
# Database Connection:
DB_HOST=localhost
DB_PORT=5432
DB_USER=your-db-user-name
DB_PASSWORD=your-db-user-password
DB_DATABASE=your-db-name
```

### 2. Install dependencies

Arcwell's repository is configured with NPM workspaces, meaning a top-level
installation should reconcile the installation of dependencies for all
sub-packages, as well:

```sh
npm install
```

### 3. Seed Database

We have provided some initial seed data to pre-populate your local dev instance
with useful data and users. Run this command from within the server package:

```sh
node ace migration:refresh --seed
```

Read [the quickstart instructions](../README.md) for more information on
the data contained in this set of seeds, including default user accounts.


### 3. Run Server and Admin

Now that you've installed your dependencies and seeded your local database, you
can start the Server and Admin applications on your machine with commands
specified in the respective `package.json` definitions:

```sh
# Start Server for local dev:
cd packages/server
npm run dev

# Start Admin for local dev:
cd packages/admin
npm run dev
```

After this, check that the server is up at http://localhost:3333 and the admin
at http://localhost:4200. 

The [README](../README.md) includes details on how to begin exploring your
local dev Arcwell instance.

