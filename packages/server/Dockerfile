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
# Development
FROM base AS develop
USER node
WORKDIR /home/node/app

# Check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=60s CMD node healthcheck.js

# Install development tools (curl, etc.)
USER root
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

# Add source code which includes pakcage.json:
USER node
COPY --chown=node:node . .
RUN npm install --no-fund

CMD npm run dev

#######################################
# Build stage
FROM base AS build
USER node
WORKDIR /home/node/app

# copy in source
COPY --chown=node:node . .

# install dependencies --include=dev required to install dev dependencies if NODE_ENV=production
RUN npm install --no-fund --include=dev

# run build
RUN npm run build


#######################################
# Production
FROM base AS production
USER node
WORKDIR /home/node/app


# copy in built app
COPY --from=build --chown=node:node /home/node/app/build /home/node/app

# install production dependencies --omit=dev is reduntant with NODE_ENV=PRODUCTION but keeping for clarity
COPY --chown=node:node package.json package-lock.json* ./
RUN npm install --no-fund --omit=dev


# In production build, simply start server
CMD ["npm", "run", "start"]
