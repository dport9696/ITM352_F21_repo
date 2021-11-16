const { response, request } = require('express');
var express = require('express');
var app = express();

app.all('*', function (request, response, next) {
    console.log(request.method + 'to path' + request.path + 'query string' + JSON.stringify(request.query));
    next();
});

app.use(express.urlencoded({ extended: true }));

var products = require('./product_data.json');
products.forEach( (prod,i) => {prod.total_sold = 0});

app.get("/product_data.js", function (request, response, next) {
    response.type('.js');
    var products_str = `var products = ${JSON.stringify(products)};`;
    response.send(products_str);
});

function process_quantity_form (POST, response) {
    let brand = products[0]['brand'];
    let brand_price = products[0]['price'];

    var q = request.body['quantity_textbox'];
    if (typeof q != 'undefined') {
        if (isNonNegInt(q)) {
            products[0].total_sold += Number(q);
            response.redirect('receipt.html?quantity=' + q);
        } else {
            response.send(`Error: ${q} is not a quantity. Hit the back button to fix..`)
        }
    } else {
        response.send(`Hey! You need to pick some stuff!`);
    }
    next();
}

app.post('/process_form', function (request, response, next) {
    process_quantity_form(request.body, response);
});

app.use(express.static('./public')); // essentially replaces http-server

app.listen(8080, () => console.log(`listening on port 8080`)); // note the use of an anonymous function here to do a callback

function isNonNegInt(q, returnErrors = false) {
    errors = []; // assume no errors at first
    if (q == '') q = 0;
    if (Number(q) != q) errors.push('Not a number!'); // Check if string is a number value
    else {
        if (q < 0) errors.push('Negative value!'); // Check if it is non-negative
        if (parseInt(q) != q) errors.push('Not an integer!'); // Check that it is an integer
    }

    return returnErrors ? errors : (errors.length == 0);
}