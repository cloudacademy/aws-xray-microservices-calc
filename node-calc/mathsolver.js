var XRay = require('aws-xray-sdk');

XRay.middleware.setSamplingRules('sampling-rules.json');
//XRay.middleware.enableDynamicNaming();
var http = XRay.captureHTTPs(require('http'));

String.prototype.isNumeric = function() {
    return !isNaN(parseFloat(this)) && isFinite(this);
}

Array.prototype.clean = function() {
    for(var i = 0; i < this.length; i++) {
        if(this[i] === "") {
            this.splice(i, 1);
        }
    }
    return this;
}

module.exports = {
    infixToPostfix: function(infix) {
        var outputQueue = "";
        var operatorStack = [];
        var operators = {
            "^": {
                precedence: 4,
                associativity: "Right"
            },
            "/": {
                precedence: 3,
                associativity: "Left"
            },
            "*": {
                precedence: 3,
                associativity: "Left"
            },
            "+": {
                precedence: 2,
                associativity: "Left"
            },
            "-": {
                precedence: 2,
                associativity: "Left"
            }
        }
        infix = infix.replace(/\s+/g, "");
        infix = infix.split(/([\+\-\*\/\^\(\)])/).clean();
        for(var i = 0; i < infix.length; i++) {
            var token = infix[i];
            if(token.isNumeric()) {
                outputQueue += token + " ";
            } else if("^*/+-".indexOf(token) !== -1) {
                var o1 = token;
                var o2 = operatorStack[operatorStack.length - 1];
                while("^*/+-".indexOf(o2) !== -1 && ((operators[o1].associativity === "Left" && operators[o1].precedence <= operators[o2].precedence) || (operators[o1].associativity === "Right" && operators[o1].precedence < operators[o2].precedence))) {
                    outputQueue += operatorStack.pop() + " ";
                    o2 = operatorStack[operatorStack.length - 1];
                }
                operatorStack.push(o1);
            } else if(token === "(") {
                operatorStack.push(token);
            } else if(token === ")") {
                while(operatorStack[operatorStack.length - 1] !== "(") {
                    outputQueue += operatorStack.pop() + " ";
                }
                operatorStack.pop();
            }
        }
        while(operatorStack.length > 0) {
            outputQueue += operatorStack.pop() + " ";
        }
        return outputQueue;
    },

    solvePostfix: function(calcid, postfix, callback) {
        var resultStack = [];
        postfix = postfix.split(" ");
        var i = 0;
        calculate(calcid, postfix, i, resultStack, function(result){
            callback(result);
        });
    }
};

function calculate(calcid, postfix, i, resultStack, callback){    
    if(postfix[i].isNumeric()) {
        resultStack.push(postfix[i]);
        i = i + 1;
        calculate(calcid, postfix, i, resultStack, callback);
    } else {
        var a = resultStack.pop();
        var b = resultStack.pop();

        var left = a;
        var right = b;

        var options = null;
        if(postfix[i] === "+") {
            //resultStack.push(parseInt(a) + parseInt(b));
            options = {
                hostname: '172.19.10.1',
                port: 8081,
                path: `/api/add?calcId=${calcid}&leftOp=${left}&rightOp=${right}`
            };
        } else if(postfix[i] === "-") {
            //resultStack.push(parseInt(b) - parseInt(a));
            options = {
                hostname: '172.19.10.2',
                port: 8082,
                path: `/api/subtract?calcId=${calcid}&leftOp=${right}&rightOp=${left}`
            };
        } else if(postfix[i] === "*") {
            //resultStack.push(parseInt(a) * parseInt(b));
            options = {
                hostname: '172.19.10.3',
                port: 8083,
                path: `/api/multiply?calcId=${calcid}&leftOp=${left}&rightOp=${right}`
            };            
        } else if(postfix[i] === "/") {
            //resultStack.push(parseInt(b) / parseInt(a));
            options = {
                hostname: '172.19.10.4',
                port: 8084,
                path: `/api/divide?calcId=${calcid}&leftOp=${right}&rightOp=${left}`
            };            
        } else if(postfix[i] === "^") {
            //resultStack.push(Math.pow(parseInt(b), parseInt(a)));
            options = {
                hostname: '172.19.10.5',
                port: 8085,
                path: `/api/power?calcId=${calcid}&leftOp=${right}&rightOp=${left}`
            };            
        }

        console.log(`http request host:port -> ${options.hostname}:${options.port}`)
        const httpreq = http.request(options, (res) => {
            console.log(`STATUS: ${res.statusCode}`);
            console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
            res.setEncoding('utf8');
            var data = '';
            res.on('data', (chunk) => {
                data += chunk;
                console.log(`BODY: ${chunk}`);
            });
            res.on('end', () => {
                console.log('No more data in response.');

                //var result = Number(data);
                var result = data;
                console.log(result);
                resultStack.push(result);

                i = i + 1;
                if(i < postfix.length){
                    calculate(calcid, postfix, i, resultStack, callback);
                }            
                else{
                    if(resultStack.length > 1) {
                        return "error";
                    } else {
                        var resultVal = resultStack.pop();
                        callback(resultVal);
                        return;
                    }
                }
            });
        });

        httpreq.on('error', (e) => {
            console.error(`problem with request: ${e.message}`);
        });

        httpreq.end();
    } 
}
