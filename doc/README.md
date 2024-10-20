<img src="./logo.png" width="250"/>

Arcwell Open Source Clinical Research Platform

## Architecture Overview
Arcwell is built in a model following a Client-Server approach where:

* The **Arcwell Server** is an instance that contains business logic, data modeling, and interoperability configuration with other systems

* The server may also host the **Arcwell Admin**, an interface for configuration, data visualization, and access to data and setup.

* Clients are built as custom applications leveraging an **Arcwell Client SDK** –  libraries which facilitate connecting to and interacting with Arcwell Servers. UI applications can choose to leverage components from an **Arcwell Component Library** (Coming Soon).

* An **Embedded EHR** contains a FHIR-compliant electronic health record system for caching and synchronizing cache, local record, and integration with health systems (Coming Soon).

![Arcwell high-level architecture concept](./arch_hl_2024.png)

## Building an App

A representative end-user application or an **"Arcwell Application"** 
can be built as a separate entity that communicates with the server,
dispays its results in the Admin, and later on leverages the Client libraries to expand in capability.

We have provided [examples within this repository](/examples) of
applications built this way.


## Technologies

Arcwell is proudly built with components and dependencies that are
sturdy, trustworthy, and well-represent the Open Source Software
community.

- [AdonisJS](https://github.com/adonisjs/core) server framework
- [Angular](https://angular.dev/) frontend framework
- [PostgreSQL](https://www.postgresql.org/) database

