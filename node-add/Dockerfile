FROM node:alpine

ENV AWS_XRAY_DAEMON_ADDRESS=172.19.20.1:2000

RUN mkdir -p /usr/src/app

ADD package.json /tmp/package.json
ADD package-lock.json /tmp/package-lock.json
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules /usr/src/app

WORKDIR /usr/src/app  
COPY . /usr/src/app

EXPOSE 8081  
RUN npm install  
CMD ["npm", "start"] 
