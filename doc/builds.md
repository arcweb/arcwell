# Building Arcwell


Arcwell is designed to be run under multiple conditions such as development and
production. This is supported through the use of environment variables and 
builds optimized for a given environment. 

## Technologies & Frameworks

Both the Server and Admin products are written in 
[TypeScript](https://www.typescriptlang.org/) and run on the NodeJS platform.

* The server package uses the [Adonis JS framework](https://docs.adonisjs.com/guides/preface/introduction) 
* The admin package uses the [Angular framework](https://angular.dev/)

## Development vs Production

In development, the server package is run via an Adonis server which just in 
time transpiles TypScript code to Javascript code for execution. This supports 
aspects of development, but sacrifices some performance. To run Arcwell 
optimized for production, the server package is transpiled to Javascript en 
masse and deployed to the production environment. 

To build a production-ready server package, from the `packages/server` directory run:

```sh
npm run build
```

The Docker containers we've written are 
[multi-stage](https://docs.docker.com/build/building/multi-stage/), meaning
you can build a production-ready container by specificying a target of 
`production` when building the container, From `packages/server`, run:

```sh
docker build --target production -t arcwell-production .
```

## Environment Variables
When deploying with either one of these builds one would want to make sure to
set the running environment's variables to values appropriate for production.

See `packages/server/.env.example` for possible environment variables.


