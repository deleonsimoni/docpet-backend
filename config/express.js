var express = require('express');
var consign = require('consign');
var cors = require("cors");
var path = require('path');

// configurações do express
var app = express();
app.set('secret', '2203b89f5a511f1d5d71e7a6d66d24f1');
app.use(express.static('./public'))
app.use('/files', express.static(path.resolve(__dirname, '..', '..', 'public', 'uploads')))
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
const corsOptions = {
    origin: '*',
    credentials: true, //access-control-allow-credentials:true
    optionSuccessStatus: 200,
}



app.use(cors());

consign({ cwd: 'app' })
    .include('models')
    .then('api')
    .then('routes/auth.js')
    .then('routes')
    .into(app);


module.exports = app;