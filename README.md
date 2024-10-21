<img src="doc/logo.png" width="250" alt="Arcwell Logo"/>

Arcwell Open Source Clinical Research Platform

## Overview

[Arcwell](https://arcwell.health/) is a free, open-source platform designed to
facilitate digital health innovations by streamlining the development of
clinical applications.

The platform is designed to be extensible, allowing non-technical admins to
define custom data types, express their formats for data capture, and model
their intended groupings and representations of people, resources, events,
and factual data. 

The development of this system builds upon over a decade of experience
collected by [Arcweb Technologies](https://arcwebtech.com/) team members in
building digital products focused on healthcare and adjacent industries.

Arcwell lowers the effort required to model digitial solutions to healthcare 
needs including clinical pathways, captured data including patient
observations, and powering the delivery and management of clinical trials,
surveys, assessments, questionnaires, clinical decision support systems, and
more.

<img src="doc/arcwell-card.png" alt="Introducing Arcwell, an Open Source Clinical Research Platform"/>

## Features

Architecturally, Arcwell is composed of:

- **Arcwell Server** – REST APIs and data models for app integration
- **Arcwell Admin** – An administrative dashboard for management and configuration
- **Example Applications** – Exhibitions of how to integrate with Arcwell

The Arcweb team, as stewards of Arcwell, have outlined a roadmap that will
soon expand this core offering to include:

- **Client Libraries** – SDKs in multiple languages for developers to leverage when integrating Arcwell in their applications
- **Embedded EHR and FHIR Bridge** – FHIR-compliant electronic health record system for caching and synchronizing cache, local record, and integration with health systems
- **Feature Libraries** – A library of Arcwell types and models that users can easily install in their instances to implement common conditions and behaviors.
- **Component Libary** – Interface elements in common frontend frameworks to facilitate quick construction of Arcwell-backed application UIs
- **New Features** – Additional features that expand Arcwell's built-in capabilities, including native support for assigned tasks, surveys, server forms, mobile patient navigation tools, and implementation of healthcare standards including eCOA, ePRO, and others

This repository includes the code for _Arcwell Server_ and _Arcwell Admin_, both nested under the `/packages` path, and example uses of Arcwell under 
`/examples`

## Quickstart

### 0. Prerequisites

Arcwell is written primarily in [TypeScript](https://www.typescriptlang.org/). 
To modify and work with the software, it is recommended you install local
software to support development in the JavaScript/TypeScript stack and
supporting plugins in your IDE of choice.

Arcwell is also written with support for Docker containers. Getting a version
up and running within a container is relatively easy once you install
Docker-compatible containerization software. We recommend
[Docker Desktop](https://www.docker.com/products/docker-desktop/)
and have adapted our instructions and guides based on it.

Read the instructions below if you prefer to develop directly on your host
machine.

### 1. Expand local dev environment files

Out-of-the-box, the **Server** and **Admin** applications both require
a `.env.development` file be in place with common configuration. You can
hyrdate an example from `.env.example` in each directory by running a
top-level bootstrap script:

```sh
./scripts/bootstrap.sh
```
☝️ This script convention in Arcweb projects searches sub-packages for their 
own `scripts/bootstrap.sh` and runs each. The scripts are non-destructive and
can be run multiple times in most cases.

You can confirm that the configuration is now set by checking for two env
files with starter config:
* /packages/server/.env.development
* /packages/admin/.env.development

You may wish to tweak some of the settings in the
`packages/server/.env.development` file to meet your needs. We suggest you
consider adjustments to the following variables:

```sh
# Instance Configuration:
ARCWELL_INSTANCE_NAME="Development Arcwell Server"
ARCWELL_INSTANCE_ID=arcweb-dev
```

The `ARCWELL_INSTANCE_NAME` variable is a human-readable name for your server,
which will appear in configuration and the Admin UI. The `ARCWELL-INSTANCE-ID`
variable is a shortstring by which the server is referred.

Once you have configured to your liking, you can double-check that things are
good by confirming the Docker Compose configuration is now working. If this
command displays configuration and exits successfully, you are good to go:

```sh
docker compose config
```


### 2. Start up services in Docker

Once you've verified that the configuration is in place, you can start the
Docker service containers. The first time through, you'll want to ensure the
new Arcwell containers get built:

```sh
docker compose up --build
```

On subsequent runs, you can just bring them up:

```sh
docker compose up
```

### 3. Run Migrations and Seeds

Prepping your local development database with schema structure and required
seed data is an important step. Run this command from your project root:

```sh
docker compose exec server node ace migration:refresh --seed
```
☝️ Note: The `docker compose exec` invocation is used to run commands against
a running container. This command, for example, is equivalent to running the
command `node ace migration:refresh --seed` within the server container itself.

### 4. Visit Server and Admin in browser

Arcwell Server:
* Confirm the Arcwell Server is up by visiting http://localhost:3333
* Check the healthcheck endpoint at http://localhost:3333/health
* View the local API server docs at http://localhost:3333/docs

Arcwell Admin:
* Browse to the admin root at http://localhost:4200
* Login with seeded dev credentials (see below)

Environment seed data will create user credentials for you:

| Email                         | Password      | Role          |
|-------------------------------|---------------|---------------|
| dev-admin@example.com         | password      | Super Admin   |
| dev-limited-admin@example.com | password      | Limited Admin |
| dev-guest@example.com         | password      | Guest         |


### 5. Explore!

Now, you can poke around the Admin experience or Server code and documentation.

<img src="doc/laptop-with-phone.png" alt="Arcwell Admin screen and mobile phone application example"/>

We have provided a Postman definition for use with the 
[Postman API Platform](https://www.postman.com/)
and compatible services. This can be useful for development to learn the
API contracts, formats, and endpoints:

- Use the included [Postman Environment](<doc/Arcwell Lib.postman_environment.json>) to setup your localhost-pointed Postman environment
- Pull the full [Postman API definition](doc/Arcwell.postman_collection.json) to experiment with the Server REST API locally


## Local Dev with or without Containers

In local development, a handful of services are orchestrated for you
within Docker and a relationship is configured in the `/compose.yml`
[Compose File](https://docs.docker.com/compose/). These services are:

* **Arcwell Server** as server, defined in `packages/server/Dockerfile`
* **Arcwell Admin** as admin, defined in `packages/admin/Dockerfile`
* **PostgreSQL Database** as db, pulled from [postgres:16-bookworm](https://hub.docker.com/_/postgres/)

ℹ️ **Using containers is not a requirement to develop Arcwell.**

If you wish to use containers in your development workflow, the 
[Quickstart section of this README](#quickstart) (above)
outlines that bootstrapping procedure.

If you wish to run the Arcwell Server and Admin products directly on your
host machine (without Docker), and you have your TypeScript/JavaScript
development environment prepared, these commands get you going:

### 1. Expand local dev environment files

This process is the same; follow [the quickstart instructions](#quickstart)

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

Read [the quickstart instructions](#quickstart) above for more information on the data contained in this set of seeds.


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

You can now check that the server is up at http://localhost:3333 and the admin
at http://localhost:4200. 

The [quickstart instructions](#quickstart) above include details on how to
begin exploring your local dev Arcwell instance.



## Deployment & Hosting

Arcwell's architecture makes hosting possible via a variety of approaches.

While it is possible to host on a single machine, containerized, or "on
metal," we have provided an example Terraform definition which you can use as
a starting point to adapt your own robust cloud-hosted setup in AWS,
leveraging RDS databases, ECS containers, and common networking security 
boundaries.

[Review the example Terraform environment](examples/infrastructure-terraform-aws)

We will provide more detailed documentation and guidance on complex hosting 
situations soon.


## More to Know

Learn more about Arcwell and where we're going with it at 
https://arcwell.health 

The latest news and information about Arcwell is often available on
[our Linktree](https://linktr.ee/ArcwebTech)

**How much does Arcwell cost?**
>Arcwell is completely free and built under the Apache 2.0 license, which means you can use, modify, and distribute the software freely, even in commercial applications.

**Who is Arcwell for?**
> Arcwell is for researchers, healthcare providers, digital health startups, and anyone looking to build or enhance clinical applications.

**Who is responsible for Arcwell?**
> Arcwell is developed by Arcweb Technologies, a digital product development company dedicated to advancing healthcare through technology.

**Why is it free?**
> Arcweb Technologies is on a mission to democratize health and
> wellness. That’s why we’ve built Arcwell to reduce barriers to 
> healthcare innovation, such as high development costs, complex 
> technical requirements, strict security compliance, and lengthy 
> timeframes for deployment. Some future modules may require paid 
> subscriptions.

**How do you make money?**
> Arcweb aims to generate revenue through partnerships, consulting, and
> support services related to the Arcwell platform. 
> [Reach out to us](https://arcwebtech.com) for more information.

**Can I use this in a product I hope to commercialize?**
> Absolutely! You can utilize Arcwell in commercial products, provided 
> you adhere to the licensing terms.

**Can I use this in my highly compliant environment?**
> Yes, Arcwell is designed to meet compliance requirements, making it 
> suitable for use in regulated environments. Note: certain compliance 
> environments may require our forthcoming Compliance module (a paid 
> product).

**What license is Arcwell distributed under?**
> Arcwell is distributed under the Apache 2.0 license, allowing you to
> freely use, modify, and distribute the software, even in commercial 
> applications, as long as you comply with the license terms. All 
> packages and dependencies used in Arcwell are open source. Check out 
> our Software Bill of Materials for more detailed information.

**Can I contribute to Arcwell?**
> We welcome community involvement through custom code, documentation, 
> and feature suggestions, but community-developed features cannot be 
> incorporated into the codebase just yet, as we are working on a 
> streamlined review process to ensure quality standards are maintained.


## Arcwell Team

Arcwell was built with ❤️ in and around the Philadelphia region by 
members of the Arcweb Technologies team.

<a href="https://github.com/timgetz"><img src="https://github.com/timgetz.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/mccolin"><img src="https://github.com/mccolin.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/mberlin-arcweb"><img src="https://github.com/mberlin-arcweb.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/tmolumby"><img src="https://github.com/tmolumby.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/gregvuzit"><img src="https://github.com/gregvuzit.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/alex-smith-arcweb"><img src="https://github.com/alex-smith-arcweb.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/hswope-arcweb"><img src="https://github.com/hswope-arcweb.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/maudiakent"><img src="https://github.com/maudiakent.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/lendamico"><img src="https://github.com/lendamico.png?size=50" style="border-radius:50%"/></a>
<a href="https://github.com/cera"><img src="https://github.com/cera.png?size=50" style="border-radius:50%"/></a>

---

Licensed under the [Apache 2.0 License](./LICENSE)  
Copyright 2024 [Arcweb Technologies](https://arcwebtech.com)

<img src="doc/arcweb-logo.png" height="75" alt="Arcweb Technologies"/>

