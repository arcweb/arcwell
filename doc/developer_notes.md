# Arcwell Server Developer Notes

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

POST and PATCH will require a request body with a name field e.g. { "name": "New Role Name"}

PATCH is the standard when updating a server asset.

name must be at least 3 characters long (uses the vine.js validation)

I'm still working on reesponses, but a successful message will look something like this:

````json
{
    "status": "success",
    "data": {
        "id": "db5ce10a-dcfb-491a-bc64-6fbc0b5289a5",
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

## Developer Notes

The tagging structure in use is a JSONB column on the DB, due to the way KNEX works, string and string array data will need to be stringify'd before it is passed into the DB.

```
knex
  .table('users')
  .where({ id: 1 })
  .update({ json_data: JSON.stringify(mightBeAnArray) });
```

for more info on this [KNEX Doc](https://knexjs.org/guide/schema-builder.html#jsonb)


## API (Just putting this here for now.)

Example of fact insert

`/facts/insert`

```json
{
    "observedAt": "2025-11-13T23:11:00.000-05:00",
    "typeKey": "blood-pressure",
    "personId": "09f246a3-ea09-472e-9a15-b6bb6d43541c",
    "dimensions": [
        {
            "key": "systolic",
            "value": "121"
        },
        {
            "key": "diastolic",
            "value": "80"
        },
        {
            "key": "hr",
            "value": "72"
        }
    ]
}
```
