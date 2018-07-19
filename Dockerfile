FROM ubuntu:latest

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y npm
RUN ln -s /usr/bin/nodejs /usr/bin/node

RUN npm install -g http-server

ADD index.html /usr/apps/hello-docker/index.html
WORKDIR /usr/apps/hello-docker/

CMD ["http-server", "-s"]
