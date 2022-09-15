FROM node:16

WORKDIR /web

COPY package.json ./

RUN npm install

COPY ./public ./public
COPY ./src ./src
COPY ./vue.config.js .
COPY ./jsconfig.json .
COPY ./babel.config.js .

EXPOSE 8080
CMD ["npm", "run", "serve"]

