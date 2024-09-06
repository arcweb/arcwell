<img src="doc/logo.png" width="250"/>

Arcwell Digital Medicine Platform

## Overview

Arcwell is an extensible platform for modeling solutions in digital medicine
including clinical pathways, captured data including patient observations,
and powering the delivery and management of clinical trials, surveys,
assessments, questionnaires, clinical decision support systems, and more.

Arcwell itself is composed of:

- **Arcwell Server** – REST and GraphQL APIs for app integration
- **Arcwell Admin** – An administrative dashboard allowing for management and configuration
- **Arcwell Client Libraries** – SDKs for developers to leverage when integrating Arcwell in their applications
- **Embedded EHR** – FHIR-compliant electronic health record system for cache, local record, and integration with health systems

This repository includes the code for _Arcwell Server_ and _Arcwell Admin_.

## Quickstart

### 0. Prerequisites

Arcwell is written primarily in TypeScript. In order to _contribute_ to the
software, it is recommended you install local software to support development
in the JavaScript/TypeScript stack and supporting plugins in your IDE of
choice.

Arcwell is also written with support for Docker containers. In order to simply
_run_ the software, you must install Docker-compatible containerization
software. We recommend you install
[Docker Desktop](https://www.docker.com/products/docker-desktop/)
and have adapted our instructions and guides based on it.

### 1. Expand local dev environment files

Out-of-the-box, the **Server** and **Admin** applications both require
a `.env.development` file be in place with common configuration. You can
hyrdate an example from `.env.example` in each directory by running a
top-level bootstrap script:

```
./scripts/bootstrap.sh
```
☝️ This script convention in Arcweb projects searches sub-packages for their 
own `scripts/bootstrap.sh` and runs each. The scripts are non-destructive and
can be run multiple times in most cases.

You can confirm that the configuration is now set by checking for two env
files with starter config:
* /packages/server/.env.development
* /packages/admin/.env.development

You can also double-check that things are good by confirming the Docker
Compose configuration is now working. If this command displays configuration
and exits successfully, you are good to go:

```
docker compose config
```

### 2. Start up services in Docker

Once you've verified that the configuration is in place, you can start the
Docker service containers. The first time through, you'll want to ensure the
new Arcwell containers get built:

```
docker compose up --build
```

On subsequent runs, you can just bring them up:

```
docker compose up
```

### 3. Run Migrations and Seeds

Prepping your local development database with schema structure and required
seed data is an important step. Run this command from your project root:

```
docker compose exec server node ace migration:refresh --seed
```
☝️ Note: The `docker compose exec` invocation is used to run commands against
a running container. This command, for example, is equivalent to running the
command `node ace migration:refresh --seed` on the server application itself.

### 4. Visit Server and Admin in browser

Arcwell Server:
* Confirm the Arcwell Server is up by visiting http://localhost:3333
* Check the healthcheck endpoint at http://localhost:3333/health

Arcwell Admin:
* Browse to the root of the admin at http://localhost:4200
* Login with seeded dev credentials (see below)

Environment seed data will create user credentials for you:

| Email                        | Password       | Role |
|------------------------------|----------------|------|
| dev-admin@email.com          | Password12345! | Super Admin |
| dev-limited-admin@email.com  | Password12345! | Limited Admin  |
| dev-guest@email.com          | Password12345! | Guest |


## Docker Services

In local development, a handful of services are orchestrated for you
within Docker and a relationship is configured in the `/compose.yml`
[Compose](https://docs.docker.com/compose/) File. These services are:

* **Arcwell Server** as server, defined in `packages/server/Dockerfile`
* **Arcwell Admin** as admin, defined in `packages/admin/Dockerfile`
* **PostgreSQL Database** as db, pulled from [postgres:16-bookworm](https://hub.docker.com/_/postgres/)
* **Redis Cache** as redis, pulled from [redis:7-bookworm](https://hub.docker.com/_/redis)

Arcwell software is designed to also be run on your local host
machine (i.e., without Docker).

In general, you can startup the local environment by up'ing the services:

```
docker compose up
```

You can run one-off commands against a service using `docker compose exec` 
and referencing the service by name with the command following. For example:

```
# Run whoami within the "server" service; if it is already running:
docker compose exec server whoami
```

You can leverage this to grab a shell session within any of your running
services for running a battery of commands. For example:

```
# Start a bash shell on the server:
docker compose exec server bash
```

## Deployment & Hosting

_Guidance and documentation coming soon._

## Additional Documentation

Documentation [expands within](./doc).

[Apache 2.0 License](./LICENSE)  
(C) 2024 Copyright Arcweb Technologies, LLC
