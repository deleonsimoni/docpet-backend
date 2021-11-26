var express = require('express');
var consign = require('consign');
var bodyParser = require('body-parser');
var cors = require("cors");

// configurações do express
var app = express();
app.set('secret', '2203b89f5a511f1d5d71e7a6d66d24f1');
app.use(bodyParser.json());
app.use(express.static('./public'))
app.use(express.bodyParser({limit: '50mb'}));

const corsOptions ={
   origin:'*', 
   credentials:true,            //access-control-allow-credentials:true
   optionSuccessStatus:200,
}

app.use(cors());

consign({cwd: 'app'})
    .include('models')
    .then('api')
    .then('routes/auth.js')
    .then('routes')
    .into(app);


module.exports = app;