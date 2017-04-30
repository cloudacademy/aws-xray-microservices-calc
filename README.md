# AWS X-Ray Microservices Calculator

![Alt text](documentation/XRayDockerArch.png?raw=true "AWS X-Ray Microservices Calculator" | width=1244)

Dockerised Microservices Calculator - demonstrating AWS X-Ray instrumentation and telemetry

## Installation

These instructions are for OSX. Your mileage may vary on Windows and other \*nix.

1. Create new IAM credential for the XRAY and SQS accesses. Ensure that the credential has API programmatic access - this will provision an ACCESS_KEY and SECRET_ACCESS_KEY which we will add into the `.env` file (step 3 below).
2. Attach IAM policies:
    1. `AWSXrayWriteOnlyAccess`
    2. `AmazonSQSFullAccess`
    
![Alt text](documentation/IAMPolicies.png?raw=true "IAM Policies")

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

3. Create a `.env` file in the project root directory. Add the following enviroment variables:
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

4. Run `docker-compose build`
5. Run `docker-compose up`
6. Fire a test calculation at it:

`curl --data-urlencode "calcid=testid123" --data-urlencode "expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2)" http://localhost:8080/api/calc'`

7. Examine the result - the answer should be `43.8`

8. Login into the AWS X-Ray console and examine the Service Map:

![Alt text](documentation/ServiceMap.png?raw=true "Amazon X-Ray Console Service Map")

9. Perform a filtered trace and examine response codes:

![Alt text](documentation/Trace1.png?raw=true "Amazon X-Ray Console Trace - filtered search")

![Alt text](documentation/Trace2.png?raw=true "Amazon X-Ray Console Trace - examine response codes")