# AWS X-Ray Microservices Calculator

![Alt text](documentation/ServiceMap.png?raw=true "Amazon X-Ray Console Service Map")

## Architecture

![Alt text](documentation/XRayDockerArch.png?raw=true "AWS X-Ray Microservices Calculator")

Dockerised Microservices Calculator - demonstrating AWS X-Ray instrumentation and telemetry workflows.

## Background

This project implements a simple Node.js microservices based calculator for the purpose demonstrating Amazon's newly launched X-Ray service: `https://aws.amazon.com/xray/`

AWS X-Ray helps developers analyze and debug production, distributed applications, such as those built using a microservices architecture. With X-Ray, you can understand how your application and its underlying services are performing to identify and troubleshoot the root cause of performance issues and errors. X-Ray provides an end-to-end view of requests as they travel through your application, and shows a map of your application’s underlying components. You can use X-Ray to analyze both applications in development and in production, from simple three-tier applications to complex microservices applications consisting of thousands of services.

The Node.js microservices based calculator has been instrumented with the Node.js `aws-xray-sdk` - allowing it to propagate telemetry into the Amazon X-Ray cloud hosted service.

The sample project has been designed to run locally on a workstation using Docker containers.

A `docker-compose.yml` file has been provided to orchestrate the provisioning of the entire microservices docker container architecture.

## Calculator

The dockerised microservices calculator has been designed to evaluate simple and complex mathematical expressions. The calculator is designed to evaluate any valid user provided expression using the **order of operations** (or **operator precedence**) rules.

### Sample Expressions

* `(5+3)/2`
* `((5+3)/2)^3`
* `3^2+((5*5-1)/2)`
* `3^3+((5*5)-1)/2`
* `(2*(9+22/5)-((9-1)/4)^2)`
* `(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2))`

### Usage

The calculator service is invoked from the command line using the `curl` utility:

* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=(5+3)/2" http://localhost:8080/api/calc"`
* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=((5+3)/2)^3" http://localhost:8080/api/calc"`
* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=3^2+((5*5-1)/2)" http://localhost:8080/api/calc"`
* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=3^3+((5*5)-1)/2" http://localhost:8080/api/calc"`
* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)" http://localhost:8080/api/calc"`
* `curl --data-urlencode "calcid=1234" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2))" http://localhost:8080/api/calc"`

Note: The optional `calcid` param will be promoted to an *Annotation* on the captured X-Ray trace. The X-Ray service will index the `calcid` - meaning you can filter on it. An example *Filter Expression* that leverages the `calcid` param follows:

`service("CALCULATOR") { fault = true } AND annotation.calcid = "1234"`

###AWS X-Ray Traces Grouped by Annotation

![Alt text](documentation/FilterExpression1.png?raw=true "AWS X-Ray Traces Grouped by Annotation")

###AWS X-Ray Trace Annotation Based Filter Expression

![Alt text](documentation/FilterExpression2.png?raw=true "AWS X-Ray Trace Annotation Based Filter Expression")

## Prerequisites

You will need to have a Docker runtime installed locally. This project uses both `docker` and `docker-compose` utilities. There are generally 2 approaches to installing a workstation Docker runtime:
* Download and install Docker Toolbox from: `https://www.docker.com/products/docker-toolbox`, or
* Install and configure Vagrant - then download and setup using CoreOS box located at: `https://github.com/coreos/coreos-vagrant`

This project has been successfully tested on:

1. Docker Community Edition 17.03.1-ce-mac5 running on macOS Sierra 10.12.4
* `docker --version` -> `Docker version 17.03.1-ce, build c6d412e`
* `docker-compose --version` -> `docker-compose version 1.11.2, build dfed245`

## Installation

1. Create a new IAM credential for the AWS X-Ray and SQS service accesses. Ensure that the credential has API programmatic access - this will provision an ACCESS_KEY and SECRET_ACCESS_KEY - we will add these into the `.env` configuration file (step 4 below).
2. Attach the following 2 IAM policies:
    1. `AWSXrayWriteOnlyAccess`
    2. `AmazonSQSFullAccess`

Notes: 
AWSXrayWriteOnlyAccess
```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "xray:PutTraceSegments",
                "xray:PutTelemetryRecords"
            ],
            "Resource": [
                "*"
            ]
        }
    ]
}
```

AmazonSQSFullAccess
```javascript
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Action": [
                "sqs:*"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }
    ]
}
```

3. Create a new Amazon SQS queue. Record the SQS URL -  we will add this into the `.env` configuration file (step 4 below).

4. Create a `.env` file in the project root directory. Add the following environment variables:
```javascript
AWS_ACCESS_KEY_ID=<your access key here>
AWS_SECRET_ACCESS_KEY=<your secret access key here>
AWS_REGION=<aws region>
XRAY_CONTAINER_TIMEZONE=<time zone that the X-Ray daemon runs in>
CALC_SQS_QUEUE_URL=<your SQS URL>
```

example `.env` file:

```javascript
AWS_ACCESS_KEY_ID=ABCD1234ABCD1234ABCD
AWS_SECRET_ACCESS_KEY=abcd1234ABCD1234abcd1234ABCD1234abcd1234
AWS_REGION=ap-southeast-2
XRAY_CONTAINER_TIMEZONE=Pacific/Auckland
CALC_SQS_QUEUE_URL=https://sqs.ap-southeast-2.amazonaws.com/123456789012/calclog-syd
```

5. Run `docker-compose build` from within the project root directory - this step will take approx 5mins to complete as it downloads the base images over the Internet.
6. Run `docker images` - this will list all of the container images that have just been built:

```bash
docker images
REPOSITORY          TAG                 IMAGE ID            CREATED              SIZE
node-subtract       latest              034ff79532fe        57 seconds ago       128 MB
node-calc           latest              1ba68a9c70b9        About a minute ago   166 MB
node-multiply       latest              234f14958e8f        2 minutes ago        128 MB
node-add            latest              02b62d251ffb        2 minutes ago        148 MB
xray-daemon         latest              f73e98971b76        2 minutes ago        107 MB
node-postfix        latest              541aa36c5874        5 minutes ago        166 MB
node-power          latest              8d10cdae9009        6 minutes ago        128 MB
node-divide         latest              34b4bcc5ade0        7 minutes ago        128 MB
debian              stable-slim         40617bfb5493        6 days ago           80.3 MB
node                alpine              7fce0a61c1d6        10 days ago          59 MB
```

7. Run `docker-compose up` from within the project root directory:

```bash
Creating SUBTRACT
Creating DIVIDE
Creating MULTIPLY
Creating XRAY
Creating POSTIX
Creating POWER
Creating ADD
Creating CALC
Attaching to DIVIDE, SUBTRACT, POSTIX, MULTIPLY, ADD, POWER, XRAY, CALC
SUBTRACT    | npm info it worked if it ends with ok
SUBTRACT    | npm info using npm@4.2.0
SUBTRACT    | npm info using node@v7.10.0
SUBTRACT    | npm info lifecycle node-api@~prestart: node-api@
SUBTRACT    | npm info lifecycle node-api@~start: node-api@
SUBTRACT    | 
SUBTRACT    | > node-api@ start /usr/src/app
SUBTRACT    | > node server.js
SUBTRACT    | 
SUBTRACT    | SUBTRACT service listening on port: 8082
DIVIDE      | npm info it worked if it ends with ok
XRAY        | 2017-05-09T08:44:53+12:00 [Info] Initializing AWS X-Ray daemon 1.0.1
XRAY        | 2017-05-09T08:44:53+12:00 [Info] Using memory limit of 99 MB
XRAY        | 2017-05-09T08:44:53+12:00 [Info] 633 segment buffers allocated
POWER       | npm info it worked if it ends with ok
POSTIX      | npm info it worked if it ends with ok
MULTIPLY    | npm info it worked if it ends with ok
MULTIPLY    | npm info using npm@4.2.0
POWER       | npm info using npm@4.2.0
ADD         | npm info it worked if it ends with ok
MULTIPLY    | npm info using node@v7.10.0
DIVIDE      | npm info using npm@4.2.0
POSTIX      | npm info using npm@4.2.0
POWER       | npm info using node@v7.10.0
POWER       | npm info lifecycle node-api@~prestart: node-api@
POWER       | npm info lifecycle node-api@~start: node-api@
MULTIPLY    | npm info lifecycle node-api@~prestart: node-api@
ADD         | npm info using npm@4.2.0
POSTIX      | npm info using node@v7.10.0
POSTIX      | npm info lifecycle node-api@~prestart: node-api@
POWER       | 
MULTIPLY    | npm info lifecycle node-api@~start: node-api@
MULTIPLY    | 
MULTIPLY    | > node-api@ start /usr/src/app
MULTIPLY    | > node server.js
POSTIX      | npm info lifecycle node-api@~start: node-api@
POWER       | > node-api@ start /usr/src/app
POWER       | > node server.js
POWER       | 
MULTIPLY    | 
ADD         | npm info using node@v7.10.0
DIVIDE      | npm info using node@v7.10.0
DIVIDE      | npm info lifecycle node-api@~prestart: node-api@
DIVIDE      | npm info lifecycle node-api@~start: node-api@
DIVIDE      | 
DIVIDE      | > node-api@ start /usr/src/app
DIVIDE      | > node server.js
DIVIDE      | 
POSTIX      | 
DIVIDE      | DIVIDE service listening on port: 8084
POSTIX      | > node-api@ start /usr/src/app
POSTIX      | > node server.js
POSTIX      | 
ADD         | npm info lifecycle node-api@~prestart: node-api@
ADD         | npm info lifecycle node-api@~start: node-api@
ADD         | 
ADD         | > node-api@ start /usr/src/app
ADD         | > node server.js
ADD         | 
ADD         | ADD service listening on port: 8081
MULTIPLY    | MULTIPLY service listening on port: 8083
POWER       | POWER service listening on port: 8085
CALC        | npm info it worked if it ends with ok
CALC        | npm info using npm@4.2.0
CALC        | npm info using node@v7.10.0
POSTIX      | POSTFIX service listening on port: 9090
CALC        | npm info lifecycle node-api@~prestart: node-api@
CALC        | npm info lifecycle node-api@~start: node-api@
CALC        | 
CALC        | > node-api@ start /usr/src/app
CALC        | > node server.js
CALC        | 
CALC        | CALCULATOR service listening on port: 8080
CALC        | ********************************************
CALC        | ********************************************
CALC        | sample calculator test commands:
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=(5+3)/2" http://localhost:8080/api/calc
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=((5+3)/2)^3" http://localhost:8080/api/calc
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=3^2+((5*5-1)/2)" http://localhost:8080/api/calc
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=3^3+((5*5)-1)/2" http://localhost:8080/api/calc
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)" http://localhost:8080/api/calc
CALC        | curl --data-urlencode "calcid=1234" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2))" http://localhost:8080/api/calc
CALC        | note: the optional calcid param will be added as an annotation to the xray trace
CALC        | ********************************************
CALC        | ********************************************
```

8. In another console window, fire a test calculation at it:

`curl --data-urlencode "calcid=testid123" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2)" http://localhost:8080/api/calc`

9. Examine the console output of the response - the answer should be `43.8`

10. Examine the console output of the `docker-compose up` console:

```bash
CALC        | Calculator entry point...
CALC        | calcid supplied: 1234
CALC        | calcid: 1234, infix: ((5+3)/2)^3
POSTIX      | POSTFIX->calcid: 1234, infix: ((5+3)/2)^3
POSTIX      | POSTFIX->calcid: 1234, postfix: 5 3 + 2 / 3 ^
CALC        | STATUS: 200
CALC        | HEADERS: {"x-powered-by":"Express","date":"Mon, 08 May 2017 20:52:20 GMT","connection":"close","transfer-encoding":"chunked"}
CALC        | BODY: 5 3 + 2 / 3 ^
CALC        | postfix:5 3 + 2 / 3 ^
CALC        | http request host:port -> 172.19.10.1:8081
ADD         | adding...
ADD         | 3+5=8
CALC        | STATUS: 200
CALC        | result=8
CALC        | http request host:port -> 172.19.10.4:8084
DIVIDE      | dividing...
DIVIDE      | 8/2=4
CALC        | STATUS: 200
CALC        | result=4
CALC        | http request host:port -> 172.19.10.5:8085
CALC        | STATUS: 200
CALC        | result=64
CALC        | CALC RESULT=64
POWER       | powering...
POWER       | 4^3=64
POSTIX      | sqs success for POSTFIX service ba99d4ad-f14b-4c73-89d5-8a6e36a102aa
ADD         | sqs success for ADD service de12d435-df9a-4137-8155-45f045756ed4
DIVIDE      | sqs success for DIVIDE service ad13432a-78db-4617-b72e-83a888a4f335
POWER       | sqs success for POWER service 57e5ba5c-d46c-46a2-a680-39bcfcdb8244
XRAY        | 2017-05-09T08:52:21+12:00 [Info] Successfully sent batch of 5 segments (0.219 seconds)
```

11. Login into the AWS X-Ray console

    1. Examine the Service Map:

        ![Alt text](documentation/ServiceMap.png?raw=true "Amazon X-Ray Console Service Map")

    2. Perform a filtered trace and examine response codes:

        ![Alt text](documentation/Trace1.png?raw=true "Amazon X-Ray Console Trace - filtered search")

        ![Alt text](documentation/Trace2.png?raw=true "Amazon X-Ray Console Trace - examine response codes")
    3. Examine the configured SQS queue

## Notes

1. The X-Ray daemon may fail on its 1st attempt to publish batch results to the AWS X-Ray service - it appears to have some *warm-up* and/or initialisation to complete - after this all subsequent batch sends will work.

2. The docker containers `POSTFIX`, `ADD`, `SUBTRACT`, `MULTIPLY`, `DIVIDE`, and `POWER` each publish a message to the configured SQS queue - this is done only to demonstrate how AWS services can be instrumented against, the messages on the SQS queue are not consumed by any external service. The SQS queue should be purged when the sample project is torn down.

3. Each docker container in the solution performs a discrete function:
    1. `CALC`: orchestrates the full calculation - consulting each of the other containers as and when required
    2. `XRAY`: hosts the AWS X-Ray Daemon - this listens for incoming `UDP` traffic on port `2000`. All of the other docker containers are configured to send their X-Ray data to this container - it is then periodically batched up and delivered over `HTTPS` to the AWS X-Ray service via the Internet
    3. `POSTFIX`: converts the calculation expression from INFIX form to POSTFIX form
    4. `ADD`: returns result of the 1st number added to 2nd number
    5. `SUBTRACT`: returns result of 1st number minus 2nd number
    6. `MULTIPLY`: returns result of 1st number multiplied by 2nd number
    7. `DIVIDE`: returns result of 1st number divided by second number
    8. `POWER`: returns result of the 1st number (base) raised by the 2 number (exponent) 

4. Each docker container in the solution has been designed to return a percentage of HTTP error codes, e.g. *400s* and/or *500s*. The error codes returned have no effect on the outcome of the full calculation - this still calculates normally. The error codes are intentionally returned to demonstrate how they are rendered within the AWS X-Ray Service Map and Trace views. The following code snippet highlights this:

```javascript
var responseCode = 200;
var random = Math.random();

if (random < 0.8) {
    responseCode = 200;
} else if (random < 0.9) {
    responseCode = 403;
} else {
    responseCode = 503;
}

res.statusCode = responseCode;
res.end();
```
