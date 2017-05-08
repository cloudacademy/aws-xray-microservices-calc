var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var mathsolver  = require("./mathsolver.js");
var xray        = require('aws-xray-sdk');
var querystring = require('querystring');
var shortid     = require('shortid');

var serviceName = "CALCULATOR";
var servicePort = 8080;

xray.middleware.setSamplingRules('sampling-rules.json');
var http = xray.captureHTTPs(require('http'));

app.use(xray.express.openSegment(serviceName));

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || servicePort;

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: `welcome from the ${serviceName} service` });
});

router.post("/calc", function(req, res) {
    var infix = req.body.expression;
    var calcid = req.body.calcid;

    console.log("=====================================");
    console.log("Calculator entry point...");

    if (typeof calcid == "undefined") {    
        calcid = shortid.generate();
        console.log(`generating new calcid: ${calcid}`);
    }
    else {
        console.log(`calcid supplied: ${calcid}`);
    }

    console.log(`calcid: ${calcid}, infix: ${infix}`);
    
    var seg = xray.getSegment();
    seg.addAnnotation('calcid', calcid);
    
    const postData = querystring.stringify({
        'calcid': calcid,
        'expression': infix
    });

    const options = {
        hostname: '172.19.0.200',
        port: 9090,
        path: '/api/postfix/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': Buffer.byteLength(postData)
        }
    };
  
    const httpreq = http.request(options, (httpres) => {
        console.log(`STATUS: ${httpres.statusCode}`);
        console.log(`HEADERS: ${JSON.stringify(httpres.headers)}`);
        httpres.setEncoding('utf8');
        var data = '';
        httpres.on('data', (chunk) => {
            data += chunk;
            console.log(`BODY: ${chunk}`);
        });
        httpres.on('end', () => {
            //console.log('No more data in response.');

            var postfix = data;
            console.log("postfix:" + postfix);
        
            mathsolver.solvePostfix(calcid, postfix, function(result){
                console.log("result=" + result);
                res.write(`${infix}=${result}\n`);
                                
                seg.addMetadata("infix", infix);
                seg.addMetadata("postfix", postfix);
                seg.addMetadata("result", result);

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
            });
        });
    });

    httpreq.on('error', (e) => {
        console.error(`problem with request: ${e.message}`);
    });

    // write data to request body
    httpreq.write(postData);
    httpreq.end();
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.use(xray.express.closeSegment());

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`${serviceName} service listening on port: ` + port);

var exampleExpression1 = "curl --data-urlencode \"expression=(5+3)/2\" http://localhost:8080/api/calc"
var exampleExpression2 = "curl --data-urlencode \"expression=((5+3)/2)^3\" http://localhost:8080/api/calc"
var exampleExpression3 = "curl --data-urlencode \"expression=3^2+((5*5-1)/2)\" http://localhost:8080/api/calc"
var exampleExpression4 = "curl --data-urlencode \"expression=3^3+((5*5)-1)/2\" http://localhost:8080/api/calc"
var exampleExpression5 = "curl --data-urlencode \"expression=(2*(9+22/5)-((9-1)/4)^2)\" http://localhost:8080/api/calc"
var exampleExpression6 = "curl --data-urlencode \"expression=(2*(9+22/5)-((9-1)/4)^2)+(3^2+((5*5-1)/2))\" http://localhost:8080/api/calc"

console.log("********************************************");
console.log("********************************************");
console.log("sample calculator test commands:");
console.log(`${exampleExpression1}`);
console.log(`${exampleExpression2}`);
console.log(`${exampleExpression3}`);
console.log(`${exampleExpression4}`);
console.log(`${exampleExpression5}`);
console.log(`${exampleExpression6}`);
console.log("********************************************");
console.log("********************************************");










