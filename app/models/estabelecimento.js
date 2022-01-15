var mongoose = require('mongoose');

var schema = mongoose.Schema({

    nome: {
        type: String,
        require: true
    },
    nomeFormated: {
        type: String,
    },
    img: {
        type: String,
    },
    cnpj: {
        type: String,
        require: true
    },
    sobre: {
        type: String,
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },
    location: {
        type: {
            type: String,
            default: "Point"
        },
        coordinates: []
    },
    dtCriacao: {
        type: Date,
        default: Date.now
    },
    contato: {
        email: {
            type: String,
            require: true
        },
        nome: {
            type: String,
            require: true
        },
        telefone: {
            type: String,
            require: false
        },
        celular: {
            type: String,
            require: false
        }
    },
    endereco: {
        logradouro: {
            type: String,
            require: true
        },
        bairro: {
            type: String,
            require: true
        },
        numero: {
            type: Number,
            require: true
        },
        complemento: {
            type: String,
            require: false
        },
        municipio: {
            type: String,
            require: true
        },
        estado: {
            type: String,
            require: true
        },
        cep: {
            type: String,
            require: true
        },
    },

    veterinarios: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Veterinario',
        require: true
    }],

    atendePlano: {
        type: Boolean,
        require: true,
        default: false
    },

    status: {
        type: Boolean,
        require: true,
        default: true
    },

    especialidades: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidade',
        require: true
    }],

    servicos: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Servico',
        require: true
    }],

    reviews: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Usuario'
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
        score: {
            type: Number
        },
        nameUser: {
            type: String
        },
        description: {
            type: String
        },
        cellphone: {
            type: String
        },
        like: {
            type: Boolean
        }
    }]

});

mongoose.model('Estabelecimento', schema);