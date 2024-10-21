# Arcwell Admin
# Dockerfile

FROM node:20-bookworm-slim AS base

LABEL project="Arcwell Admin"
LABEL version="0.1"
LABEL author.co="Arcweb Technologies, LLC <https://arcweb.co>"

# RUN apt-get update -qq \
#     && apt-get install -qq vim \
#     && apt-get clean -qq \
#     && rm -rf /var/lib/lists/*

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
RUN npm install --no-fund && npm cache clean --force

# Add source code last (it changes the most), as node user:
COPY --chown=node:node . .


#
# Development
#
FROM base as develop

# Install Chromium for Karma tests and other dependencies
USER root
RUN apt-get update && apt-get install -y \
    chromium \
    curl \
    libnss3 \
    libxss1 \
    fonts-liberation \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set the CHROME_BIN environment variable for Karma
ENV CHROME_BIN=/usr/bin/chromium

# Set Puppeteer to skip downloading Chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true

# Switch back to unprivileged user
USER node

# In development build, always npm install prior to app start
CMD npm install --no-fund; npm run dev


#
# Production
#
FROM base as production

# In production build, just start server
CMD ["npm", "run", "start"]

