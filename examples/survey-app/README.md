Arcwell Digital Medicine Platform - Health Questionnaire Example
Overview
Arcwell is an extensible platform for digital medicine solutions, including clinical pathways, patient observations, and management of clinical trials, surveys, assessments, questionnaires, clinical decision support systems, and more.

This repository includes the code for:

Arcwell Server – REST and GraphQL APIs for app integration.
Arcwell Admin – An administrative dashboard for management and configuration.
Example App: Health Questionnaire
This example app demonstrates a health questionnaire functionality that interacts with the Arcwell platform, including both the server and admin.

Quickstart
0. Prerequisites
To run the Arcwell platform and the example app, ensure you have the following installed:

Docker Desktop for running the containers.
Node.js for running the Health Questionnaire Example App.
1. Setting up the Arcwell Platform
First, ensure that the Arcwell Server and Arcwell Admin are configured and ready to run.

Start the Docker Containers
Navigate to the project root and start the Docker containers, which will run the server, admin, PostgreSQL, and Redis services:

bash
Copy code
docker compose up --build
After the first build, you can simply start the services with:

bash
Copy code
docker compose up
2. Run Migrations and Seeds
Prepare the local development database by running the necessary migrations and seeding data for the example app.

To seed data for the Survey App, use the following command:

bash
Copy code
docker compose exec server node ace db:seed -f "./database/seeders/examples_survey_app_seeder.ts"
This command will run the seeds for the example-survey-app environment, ensuring that the roles, users, and other necessary data are populated in the database.

3. Running the Health Questionnaire Example App
Once the Arcwell services are up and running, navigate to the Health Questionnaire Example App located at examples/survey-app. From there, start the example app by running:

bash
Copy code
npm run start
The example app will communicate with the running Arcwell server to handle questionnaire submissions and data retrieval.

4. Visit Server and Admin
After setting up the environment, you can interact with the server and admin UI:

Arcwell Server: Visit http://localhost:3333 and check the health endpoint at http://localhost:3333/health.
Arcwell Admin: Visit the admin dashboard at http://localhost:4200.
5. Example Seeded Users
Once the database is seeded, you can use the following credentials to log in to the Arcwell Admin:

Email	Password	Role
dev-admin@example.com	password	Super Admin
dev-limited-admin@example.com	password	Limited Admin
dev-guest@example.com	password	Guest
Docker Services
The following services are included in the Docker setup:

Arcwell Server: Handles the backend API services (port 3333).
Arcwell Admin: The administrative dashboard (port 4200).
PostgreSQL Database: Database service.
Redis Cache: Redis instance for caching.
Common Docker Commands
Start Services:

bash
Copy code
docker compose up
Run Commands in a Service:
You can run specific commands in any running service with docker compose exec. For example, to open a shell in the server service:

bash
Copy code
docker compose exec server bash
Stop Services:
To stop all running services, use:

bash
Copy code
docker compose down
Development Workflow
1. Accessing the Admin Dashboard
You can manage the survey and other configurations via the Arcwell Admin dashboard:

URL: http://localhost:4200
Login: Use the credentials provided above.
2. Running Local Commands
You can run local commands directly on the server by opening a shell session using Docker:

bash
Copy code
docker compose exec server bash
Deployment & Hosting
Coming soon: deployment guidance and hosting recommendations.

Apache 2.0 License
(C) 2024 Copyright Arcweb Technologies, LLC

Notes:
This documentation includes instructions for starting the Arcwell services and running the Health Questionnaire Example App.
Ensure that Docker is running before starting the services and that Node.js is installed for running the example app.