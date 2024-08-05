# Arcwell Admin
# Dockerfile

FROM node:20-bookworm-slim

LABEL project="arcwell-sandbox"
LABEL version="0.1"
LABEL author.dev="Tim Getz <tgetz@arcwebtech.com>"
LABEL author.co="Arcweb Technologies"

# RUN apt-get update -qq \
#     && apt-get install -qq vim \
#     && apt-get clean -qq \
#     && rm -rf /var/lib/lists/*

## Capture where chromium was installed for karma-chrome-launcher:
#ENV CHROME_BIN /usr/bin/chromium
#
## Puppeteer should skip installing Chrome:
#ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Provide path to node-sass binary to avoid regular rebuild:
# ENV SASS_BINARY_NAME=linux-x64-67

# Set node environment, development or production
# Default to production; override this in compose for development to build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Default port 4200 for AngularJS application:
ARG PORT=4200
ENV PORT $PORT
EXPOSE $PORT

# Prevent Angular from collecting analytics:
ENV NG_CLI_ANALYTICS ci

# Install specific major version of the angular cli
RUN npm install -g @angular/cli@18

# Unprivileged node user
USER node

# Create a node applications root
WORKDIR /home/node/app

# Copy in package defs first and install dependencies:
COPY --chown=node:node package.json package-lock.json* ./
RUN npm install && npm cache clean --force

#COPY ng .

#RUN mkdir scripts
#COPY scripts/* scripts/
#COPY npm-packages/* npm-packages/
#COPY npm-packages/fontawesome/* npm-packages/fontawesome/

# Make scripts executable
#RUN chmod +x ./ng
#RUN chmod +x ./scripts/install.sh
#RUN chmod +x ./scripts/entrypoint.sh
#RUN chmod +x ./scripts/entrypoint.ci.sh
#RUN chmod +x ./scripts/tests-headless.sh
#RUN chmod +x ./scripts/tests-start.sh

# RUN echo "node version $(node -v); npm version $(npm -v)"

# RUN npm install -g @angular/cli@18
# RUN ng version

# Add source code last (it changes the most), as node user:
WORKDIR /home/node/app
COPY --chown=node:node . .

# RUN npm install --no-fund
RUN npm install --no-fund

#ARG CI_VERSION=1.0.LOCAL_DEV
#RUN mkdir /etc/lvfiles
#
## Create a version file for the version endpoint
#RUN echo "{\"version\":\"${CI_VERSION}\"}" > /etc/lvfiles/version.json
#RUN cat /etc/lvfiles/version.json

#CMD "./scripts/entrypoint.sh"

CMD ["npm", "run", "dev"]
