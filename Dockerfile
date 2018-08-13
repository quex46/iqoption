FROM node:10.8.0-slim

WORKDIR /app

COPY package.json ./

RUN npm i --quiet --prod

COPY . ./

EXPOSE 5501 5601 5701

ENTRYPOINT ["node", "entrypoint.js"]
