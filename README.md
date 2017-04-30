# AWS X-Ray Microservices Calculator

![Alt text](documentation/ServiceMap.png?raw=true "Amazon X-Ray Console Service Map")

## Architecture

![Alt text](documentation/XRayDockerArch.png?raw=true "AWS X-Ray Microservices Calculator")

Dockerised Microservices Calculator - demonstrating AWS X-Ray instrumentation and telemetry workflows.

## Background

This project implements a simple Node.js microservices based calculator for the purpose demonstrating Amazon's newly launched X-Ray service: `https://aws.amazon.com/xray/`

AWS X-Ray helps developers analyze and debug production, distributed applications, such as those built using a microservices architecture. With X-Ray, you can understand how your application and its underlying services are performing to identify and troubleshoot the root cause of performance issues and errors. X-Ray provides an end-to-end view of requests as they travel through your application, and shows a map of your application’s underlying components. You can use X-Ray to analyze both applications in development and in production, from simple three-tier applications to complex microservices applications consisting of thousands of services.

The Node.js microservices based calculator has been instrumented with the aws-xray-sdk - allowing it to propogate telemetry into the Amazon X-Ray cloud hosted service.

The sample project has been designed to run locally on a workstation using Docker containers.

A `docker-compose.yml` file has been provided to orchestrate the provisioning of the microservices docker container architecture.

## Prerequisites

You will need to have a Docker runtime installed locally. This project uses both `docker` and `docker-compose` utilities. There are generally 2 approaches to installying a workstation Docker runtime:
1. Download and install Docker Toolbox from: `https://www.docker.com/products/docker-toolbox`
2. Install and configure Vagrant - then download and setup using CoreOS box located at: `https://github.com/coreos/coreos-vagrant`

This project has been successfully tested on:

1. Docker Community Edition 17.03.1-ce-mac5 running on macOS Sierra 10.12.4
    1 . `docker --version`
        `Docker version 17.03.1-ce, build c6d412e`
    2. `docker-compose --version`
       `docker-compose version 1.11.2, build dfed245`

## Installation

1. Create a new IAM credential for the XRAY and SQS service accesses. Ensure that the credential has API programmatic access - this will provision an ACCESS_KEY and SECRET_ACCESS_KEY - we will add these into the `.env` configuration file (step 4 below).
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

4. Create a `.env` file in the project root directory. Add the following enviroment variables:
```javascript
AWS_ACCESS_KEY_ID=<your access key here>
AWS_SECRET_ACCESS_KEY=<your secret access key here>
AWS_REGION=<aws region>
TIMEZONE=<time zone that the X-Ray daemon runs in>
CALC_SQS_QUEUE=<your SQS URL>
```

example `.env` file:

```javascript
AWS_ACCESS_KEY_ID=ABCD1234ABCD1234ABCD
AWS_SECRET_ACCESS_KEY=abcd1234ABCD1234abcd1234ABCD1234abcd1234
AWS_REGION=ap-southeast-2
TIMEZONE=Pacific/Auckland
CALC_SQS_QUEUE=https://sqs.ap-southeast-2.amazonaws.com/123456789012/calclog-sydJeremys-MacBook:xray-calc
```

5. Run `docker-compose build` from within the project root directory
6. Run `docker-compose up` from within the project root directory
7. Fire a test calculation at it:

`curl --data-urlencode "calcid=testid123" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2)" http://localhost:8080/api/calc'`

8. Examine the response - the answer should be `43.8`

9. Login into the AWS X-Ray console

    1. Examine the Service Map:

        ![Alt text](documentation/ServiceMap.png?raw=true "Amazon X-Ray Console Service Map")

    2. Perform a filtered trace and examine response codes:

        ![Alt text](documentation/Trace1.png?raw=true "Amazon X-Ray Console Trace - filtered search")

        ![Alt text](documentation/Trace2.png?raw=true "Amazon X-Ray Console Trace - examine response codes")