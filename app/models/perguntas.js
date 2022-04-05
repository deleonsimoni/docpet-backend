var mongoose = require('mongoose');

var schema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },

    especialidade: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidade',
        require: true
    },

    dtCriacao: {
        type: Date,
        default: Date.now
    },

    pergunta: {
        type: String,
        require: true
    },

    anonimo: {
        nome: {
            type: String,
        },
        email: {
            type: String,
        },
        wpp: {
            type: String,
        },
    },

    //0 - Aguardando administrador
    // 1 - liberada
    status: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: false
    },


    respostas: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        resposta: {
            type: String
        },
        like: [{
            id: {
                type: Number
            },
        }]
    }]

});

mongoose.model('Pergunta', schema);