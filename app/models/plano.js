var mongoose = require('mongoose');

var schema = mongoose.Schema({
    nome: {
        type: String,
        require: true
    },

    nomeFormated: {
        type: String,
    },

    descricao: {
        type: String,
        require: true
    },

    cobranca: {
        /*valor: {
            type: BrazilianCurrency
        },*/
        parcela: {
            type: Boolean,
            default: false
        },
        quantidadeParcela: {
            type: Number
        }
    },

    caracteristicas: [{
        titulo: {
            type: String,
            require: true
        },
        descricao: {
            type: String
        }
    }]
});

mongoose.model('Plano', schema);