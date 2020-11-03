FROM node:14
WORKDIR /usr/src/dwcag/

COPY package*.json ./
RUN npm ci --only=production
COPY . .

EXPOSE 4000
CMD [ "node", "./packages/api/server.js" ]