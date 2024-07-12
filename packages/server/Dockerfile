# Arcwell Server
# Dockerfile

FROM node:20

WORKDIR /home/node/app

COPY . .

RUN npm install

EXPOSE 3333
EXPOSE 5173

CMD ["npm", "run", "dev"]
