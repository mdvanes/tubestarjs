FROM node:18-alpine
# FROM node:18-bullseye-slim

WORKDIR /home/node/code

ENV LANG C.UTF-8

RUN apk --no-cache add --virtual .builds-deps build-base python3

# RUN apt-get update; \
#     apt-get install -y --no-install-recommends \
#     ca-certificates \
#     netbase \
#     tzdata \
#     python3 python3-pip build-essential

COPY package.json package-lock.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["npm", "run", "serve"]