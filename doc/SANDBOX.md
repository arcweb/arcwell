
## Description

### Arcwell Sandbox - Proof of concept for AdonisJS

#### DEV NOTES:
* node_modules directory in the api container didn't refresh at one point, i had to delete the image layer and rebuild (worked other times, so just a warning if a library isn't identified)
  * Can also go inside the container and run npm install, possibly


## Installation

AdonisJS created with 
```shell
npm init adonisjs@latest api -- --db=postgres --kit=api --auth-guard=access_tokens
```

* NOTE: Remember to change HOST from localhost to 0.0.0.0 for docker to work

* Create a `.env.api` file with:

    ```dotenv
    TZ=UTC
    PORT=3333
    HOST=0.0.0.0
    LOG_LEVEL=debug
    APP_KEY=VblmhJpGElfVYw7W8lNoyW8MAfCp61v4
    NODE_ENV=development
    DB_HOST=db
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=example
    DB_DATABASE=arcwell_sandbox
    ```

* Create a `.env.db` file with:

    ``` dotenv
    POSTGRES_USER=postgres
    POSTGRES_PASSWORD=example
    POSTGRES_DB=arcwell_sandbox
    ```


* Then `docker compose up --build`


* Go to `localhost:3333`




