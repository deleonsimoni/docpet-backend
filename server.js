var http = require('http');
var app = require('./config/express');
require('dotenv').config();
const passport = require('./config/passport')
var porta = 3001
require('./config/database')('localhost/vetzdes');
/*require('./config/database')('mongo71-farm10.kinghost.net/vetzco01',
    {
        user: 'vetzco01',
        pass: 'Ad=15937-Bcng',
        useNewUrlParser: true,
        useUnifiedTopology: true
    });*/

app.use(passport.initialize());


http.createServer(app).listen(3001, function () {
    console.log('Server Start - V.1.11 - Porta - ' + porta);
});