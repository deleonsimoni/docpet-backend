    module.exports = function(uri, options){
    
    var mongoose = require('mongoose');

    mongoose.connect('mongodb://' + uri, options);

    mongoose.connection.on('connected', function(){
        console.log('Conectado ao MongoDB');
    });

    mongoose.connection.on('error',function (err) {  
        console.log('Mongoose default connection error: ' + err);
    }); 

    mongoose.connection.on('disconnected', function(){
        console.log('Desconectado ao MongoDB');
    });

    process.on('SIGINT', function(){
        mongoose.connection.close(function () { 
            console.log('Conexão fechada pelo termino da aplicação'); 
            process.exit(0); 
        })    

    });
  
} 