# Project Support Scripts

Place in this directory scripts useful for supporting local development
or indirect project assets.

Examples include:
* Database initializers
* Non-standard dependent containers configuration
* Custom Dockerfile for third-party sources

Document support assets, below.

## Support Assets

| Path | Product | Notes |
|------|---------|-------|
| postgres | [PostgreSQL database][psql] | Initializer scripts, configuration |
| redis    | [Redis cache][redis] | Configuration for Redis in local dev |
| medplum  | [Medplum FHIR service][medplum] | Custom Docker configuration for local dev |



[psql]: https://www.postgresql.org/
[redis]: https://redis.io/
[medplum]: https://www.medplum.com/
