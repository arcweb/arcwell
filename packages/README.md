# Arcwell Sub-packages

Sub-packages and workspaces under the Arcwell umbrella are organized here.


## Included Packages

| Path | Package |
|------|---------|
| server | Arcwell server application, hosting API, root configuration |
| admin  | Arcwell administrative dashboard |


# Server

## Developer  Initial Set up

### Run the following after building and launching the server container

```shell
docker compose exec server node ace migration:run

docker compose exec server node ace db:seed
```

There are basic CRUD endpoints for /roles

```shell
METHOD ROUTE ............................................................................................................ HANDLER MIDDLEWARE
POST   /auth (auth.store) ............................................................................... SessionController.store
GET    /roles (roles.index) ............................................................................... RolesController.index
POST   /roles (roles.store) ............................................................................... RolesController.store
GET    /roles/:id (roles.show) ............................................................................. RolesController.show
PUT    /roles/:id (roles.update) ......................................................................... RolesController.update
PATCH  /roles/:id (roles.update) ......................................................................... RolesController.update
DELETE /roles/:id (roles.destroy) ....................................................................... RolesController.destroy
```

WARNING: Ignore the /auth endpoint. This is a work in progress login method.  It does successfully validate a users email/password.

POST and PUT will require a request body with a name field e.g. { "name": "New Role Name"}

name must be at least 3 characters long (uses the vine.js validation)

I'm still working on reesponses, but a successful message will look something like this:

````json
{
    "status": "success",
    "data": {
        "id": 4,
        "name": "Mini Guest3",
        "createdAt": "2024-07-17T19:42:26.931+00:00",
        "updatedAt": "2024-07-17T19:42:26.931+00:00"
    }
}
````

Error messages are also a work in progress.  You should receive an status = error, but the message array isn't standardized yet.

```json
{
    "status": "error",
    "message": {
        "status": 422,
        "code": "E_VALIDATION_ERROR",
        "messages": [
            {
                "message": "The name field must have at least 3 characters",
                "rule": "minLength",
                "field": "name",
                "meta": {
                    "min": 3
                }
            }
        ]
    }
}
```

