FROM ubuntu:20.04 AS builder

ARG ENV="production"

# Create app directory
WORKDIR /var/www/app

ENV NODE_ENV="$ENV"
COPY package*.json ./

RUN apt-get update && apt-get install -y vim \
  curl
ENV TZ Africa/Johannesburg
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apt-get -y install unixodbc-dev
RUN apt-get -y install g++
RUN apt-get -y install nodejs npm
RUN npm install

COPY . .
COPY environments/${ENV}/.env environments/.env

FROM node:14
WORKDIR /usr/src/app
COPY --from=builder /var/www/app ./
ENV TZ="Africa/Johannesburg"
RUN apt-get update && apt-get install -y vim
EXPOSE 8080

CMD [ "node", "server.js" ]
