var mongoose = require('mongoose');

var BrazilianCurrency = require('@logicamente.info/mongoose-currency-brl');
BrazilianCurrency.loadType(mongoose);

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
        valor: {
            type: BrazilianCurrency
        },
        parcela: {
            type: Boolean,
            default: false
        },
        quantidadeParcela: {
            type: Number
        },
        cupom: {
            type: String,
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
    }],

    diasVencimento: {
        type: Number,
        require: true
    },

    status: {
        type: Boolean,
        require: true,
        default: true
    },

});

mongoose.model('Plano', schema);