# Arcwell Server
# Dockerfile

FROM node:20-bookworm-slim

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
RUN npm ci && npm cache clean --force

# Check every 30s to ensure this service returns HTTP 200
HEALTHCHECK --interval=60s CMD node healthcheck.js

# Add source code last (it changes the most), as node user:
WORKDIR /home/node/app
COPY --chown=node:node . .

# CMD ["sleep", "3600"]
CMD ["npm", "run", "dev"]

