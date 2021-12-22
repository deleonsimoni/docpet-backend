var http = require('http');
var app = require('./config/express');
require('./config/database')('localhost/pet');
/*require('./config/database')('mongo71-farm10.kinghost.net/gugaweigert01', 
                                {   user: 'gugaweigert01',
                                    pass: 'Ad=15937-Bc',
                                    useNewUrlParser: true,
                                    useUnifiedTopology: true 
                                });*/
http.createServer(app).listen(21168, function(){
    console.log('Server Start');
});