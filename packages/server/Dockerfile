# Arcwell Server
# Dockerfile

FROM node:20-bookworm-slim AS base

# Set node environment, development or production
# Default to production; override this in compose for development to build and run
ARG NODE_ENV=production
ENV NODE_ENV $NODE_ENV

# Default port 3333 for AdonisJS core, add including Vite 5173
ARG PORT=3333
ENV PORT $PORT
EXPOSE $PORT 5173

#######################################
# All deps stage
FROM base AS deps
USER node
WORKDIR /home/node/app


COPY --chown=node:node package.json package-lock.json* ./
RUN npm install --no-fund

#######################################
# Development
FROM base AS develop
USER node
WORKDIR /home/node/app

# Install development tools (curl, etc.)
USER root
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

USER node

# Copy deps
COPY --from=deps /home/node/app/node_modules /home/node/app/node_modules

# Add source code last (it changes the most), as node user:
COPY --chown=node:node . .

# Check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=60s CMD node healthcheck.js

# In development build, always npm install prior to app start
CMD npm install --no-fund; npm run dev

#######################################
# Production only deps stage
FROM base AS production-deps
USER node
WORKDIR /home/node/app

COPY --chown=node:node package.json package-lock.json* ./
RUN npm install --no-fund --omit=dev

#######################################
# Build stage
FROM base AS build
USER node
WORKDIR /home/node/app

COPY --from=deps --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
COPY --chown=node:node . .
RUN npm run build

#######################################
# Production
FROM base AS production
USER node
WORKDIR /home/node/app

COPY --from=production-deps --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
COPY --from=build --chown=node:node /home/node/app/build /home/node/app

# In production build, simply start server
CMD ["npm", "run", "start"]
