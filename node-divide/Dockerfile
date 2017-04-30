FROM node:alpine

ENV AWS_XRAY_DAEMON_ADDRESS=172.19.20.1:2000

RUN mkdir -p /usr/src/app

# use changes to package.json to force Docker not to use the cache
# when we change our application's nodejs dependencies:
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN cp -a /tmp/node_modules /usr/src/app

WORKDIR /usr/src/app  
COPY . /usr/src/app

EXPOSE 8084  
RUN npm install  
CMD ["npm", "start"] 
