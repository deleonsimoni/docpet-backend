var http = require('http');
var app = require('./config/express');
require('dotenv').config();
var porta = 3001 
/*require('./config/database')('localhost/pet'); */
require('./config/database')('mongo71-farm10.kinghost.net/vetzco01', 
                                {   user: 'vetzco01',
                                    pass: 'Ad=15937-Bcng',
                                    useNewUrlParser: true,
                                    useUnifiedTopology: true 
                                });

http.createServer(app).listen(porta, function(){
    console.log('Server Start - V.1.11 - Porta - '+porta);
});