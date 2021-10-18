var http = require('http');
var app = require('./config/express');
var porta = process.env.PORT_PET_API_SERVER || 3001 
/*require('./config/database')('localhost/pet'); */
require('./config/database')('mongo71-farm10.kinghost.net/gugaweigert01', 
                                {   user: 'gugaweigert01',
                                    pass: 'Ad=15937-Bc',
                                    useNewUrlParser: true,
                                    useUnifiedTopology: true 
                                }); 
http.createServer(app).listen(porta, function(){
    console.log('Server Start - V.1.10 - Porta - '+porta);
});