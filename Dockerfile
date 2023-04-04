FROM node:16-alpine

WORKDIR /home/node/code

RUN apk --no-cache add --virtual .builds-deps build-base python3

COPY package.json package-lock.json ./

RUN npm i

COPY . .

RUN npm run build
