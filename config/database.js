module.exports = function(uri, options) {
    //import { BrazilianCurrency } from "@logicamente.info/mongoose-currency-brl";

    var mongoose = require('mongoose');
    //var BrazilianCurrency = require('@logicamente.info');
    //console.log(BrazilianCurrency);

    mongoose.connect('mongodb://' + uri, options);

    //BrazilianCurrency.loadType(mongoose);

    mongoose.connection.on('connected', function() {
        console.log('Conectado ao MongoDB');
    });

    mongoose.connection.on('error', function(err) {
        console.log('Mongoose default connection error: ' + err);
    });

    mongoose.connection.on('disconnected', function() {
        console.log('Desconectado ao MongoDB');
    });

    process.on('SIGINT', function() {
        mongoose.connection.close(function() {
            console.log('Conexão fechada pelo termino da aplicação');
            process.exit(0);
        })

    });

}