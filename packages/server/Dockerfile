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

# Unprivileged node user
USER node

# Create a node applications root
WORKDIR /home/node/app

# Copy in package defs first and install dependencies:
COPY --chown=node:node package.json package-lock.json* ./
RUN npm install --no-fund && npm cache clean --force

# Check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=60s CMD node healthcheck.js

# Add source code last (it changes the most), as node user:
COPY --chown=node:node . .


#
# Development
#
FROM base AS develop

# Install development tools (curl, etc.)
USER root
RUN apt-get update && \
    apt-get install -y curl && \
    rm -rf /var/lib/apt/lists/*

USER node
# In development build, always npm install prior to app start
CMD npm install --no-fund; npm run dev


#
# Production
#
FROM base AS production

# In production build, simply start server
# CMD ["npm", "run", "start"]

# tempory production command
CMD npm install --no-fund; npm run start
