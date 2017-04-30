var rp = require('request-promise');

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

    solvePostfix: function(postfix, callback) {
        var resultStack = [];
        postfix = postfix.split(" ");
        var i = 0;
        calculate(postfix, i, resultStack, function(result){
            console.log(result);
            callback(result);
        });
    }
};

function calculate(postfix, i, resultStack, callback){    
    if(postfix[i].isNumeric()) {
        resultStack.push(postfix[i]);
        i = i + 1;
        calculate(postfix, i, resultStack, callback);
    } else {
        var a = resultStack.pop();
        var b = resultStack.pop();

        var left = parseInt(a);
        var right = parseInt(b);

        if(postfix[i] === "+") {
            //resultStack.push(parseInt(a) + parseInt(b));
            var options = {
                uri: 'http://127.0.0.1:8081/api/add/',
                qs: {
                    leftOp: left,
                    rightOp: right
                }
            };
        } else if(postfix[i] === "-") {
            //resultStack.push(parseInt(b) - parseInt(a));
            var options = {
                uri: 'http://127.0.0.1:8082/api/subtract/',
                qs: {
                    leftOp: right,
                    rightOp: left
                }
            };
        } else if(postfix[i] === "*") {
            //resultStack.push(parseInt(a) * parseInt(b));
            var options = {
                uri: 'http://127.0.0.1:8083/api/multiply/',
                qs: {
                    leftOp: left,
                    rightOp: right
                }
            };
        } else if(postfix[i] === "/") {
            //resultStack.push(parseInt(b) / parseInt(a));
            var options = {
                uri: 'http://127.0.0.1:8084/api/divide/',
                qs: {
                    leftOp: right,
                    rightOp: left
                }
            };
        } else if(postfix[i] === "^") {
            //resultStack.push(Math.pow(parseInt(b), parseInt(a)));
            var options = {
                uri: 'http://127.0.0.1:8085/api/power/',
                qs: {
                    leftOp: right,
                    rightOp: left
                }
            };
        }

    rp(options)
        .then(function (data) {
            var result = parseInt(data);
            console.log(result);
            resultStack.push(result);

            i = i + 1;
            if(i < postfix.length){
                calculate(postfix, i, resultStack, callback);
            }            
            else{
                if(resultStack.length > 1) {
                    return "error";
                } else {
                    var resultVal = resultStack.pop();
                    console.log(resultVal);
                    callback(resultVal);
                    return;
                }
            }
        })
        .catch(function (err) {
            console.error("error!!");
        });
    } 
}