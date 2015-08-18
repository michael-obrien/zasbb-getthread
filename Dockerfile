FROM node:0.10
MAINTAINER Zas

RUN mkdir /src
ADD ./ /src

WORKDIR /src
RUN npm install

RUN npm build

EXPOSE 10103

ENTRYPOINT ["npm", "start"]
