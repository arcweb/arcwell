# Arcwell Digital Medicine Platform - Survey App Example

## Overview
The Survey Example App for Arcwell allows users to complete various types of questionnaires and surveys designed for digital health assessments. This app integrates with the Arcwell Server to manage data submissions and with the Arcwell Admin dashboard to display the results in a clear and accessible format.

---

## Quickstart

### Prerequisites

To run the Arcwell platform and the example app, ensure you have the following installed:

- [Docker Desktop](https://www.docker.com/products/docker-desktop) for running the containers.
- [Node.js](https://nodejs.org/en) for running the Health Questionnaire Example App.

---

### 1. Setting up the Arcwell Platform

First, ensure that the Arcwell Server and Arcwell Admin are configured and ready to run.

#### Start the Docker Containers

Navigate to the project root and start the Docker containers, which will run the server, admin, and PostgreSQL services:

```bash
docker compose up --build
```

After building you can use
```bash
docker compose up
```

Stop Containers
```bash
docker compose down
```

---

### 2. Run Migrations and Seeds

Prepare the local development database by running the necessary migrations and seeding data for the example app.

To seed data for the Survey App, use the following command:

Refresh the DB and run migrations 
```bash
docker compose exec server node ace migration:refresh
```

Run migrations only
```bash 
docker compose exec server node ace migration:run
```

---

### 3. Running the Health Questionnaire Example App
Once the Arcwell services are up and running, in a separate terminal, navigate to the Health Questionnaire Example App located at examples/survey-app. From there, start the example app by running:

```bash
npm run start
```

Seed the database with survey fact types and a survey user. The seed script will use development seeded user and password to authenticate it's calls, so you must seed the arcwell db first. Script will prompt for user information to seed an additional user for testing forgot password functionality etc.
```bash
npm run seed
```
  
Update these values to change the url for seeding or user being authenticated for the calls.
```bash
// Change these values to match your environment
const backendUrl = 'http://localhost:3333/api/v1';
const authUserEmail = 'dev-admin@example.com';
const authUserPassword = 'password';
```

The example app will communicate with the running Arcwell server to handle questionnaire submissions and data retrieval.

### 4. Visit Server and Admin
After setting up the environment, you can interact with the server and admin UI:

Arcwell Server: Visit http://localhost:3333 and check the health endpoint at http://localhost:3333/health.

Arcwell Admin: Visit the admin dashboard at http://localhost:4200.

### 5. Example Seeded Users
Once the database is seeded, you can use the following credentials to log in to the Arcwell Admin:

Email: patient@example.com  
Password:	password

### 6. Access Example Application

URL: http://localhost:4000
Login: Use the credentials provided above.


## Mobile Testing

### Prerequisites

To run the Survey App in a mobile emulator you will need the following installed for the platform you wish to test:

- [XCode](https://apps.apple.com/us/app/xcode/id497799835) for ios emulation.
- [Android Studio](https://developer.android.com/studio) for android emulation.
- Ionic Cli `npm install -g @ionic/cli`
- Capacitor Cli - `npm install -g @capacitor/cli`  


### Setup 
1. Build from root of survey-app, optionally pass in environmeny configuration.
```bash
$ ionic build 
$ ionic build --configuration=staging

```

2. Add the platform you wish to emulate
```bash
$ npx cap add ios
$ npx cap add android
```

3. Sync
```bash
$ npx cap sync
```

4. Launch platform emulator
```bash
$ npx cap open ios
$ npx cap open android
```

### Custom Configuration

The example app uses a .env file for handling custom env vars. Please reference .env.example for adjustable env variables. Adjust the environment api url for your needs or capacitor app id, app name.

1. Replace localhost with your local computer ip if you wish to have the emulated application communicate with your local database.

```env
http://{your-ip}:3333
```


---

(C) 2024 Copyright Arcweb Technologies, LLC

Notes:
This documentation includes instructions for starting the Arcwell services and running the Health Questionnaire Example App.
Ensure that Docker is running before starting the services and that Node.js is installed for running the example app.