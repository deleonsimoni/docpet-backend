var mongoose = require('mongoose');

var schema = mongoose.Schema({

    nome:{
        type:String, 
        require: true
    },
    cnpj:{
        type:String,
        require: true
    },
    dtCriacao:{
        type: Date,
        default: Date.now
    },
    contato:
        {
            email:{
                type:String,
                require: true
            },
            nome:{
                type:String,
                require: true
            },
            telefone:{
                type:String,
                require:false
            },
            celular:{
                type:String,
                require:false
            }
        }
    ,
    endereco:
        {
            logradouro:{
                type:String,
                require:true
            },
            bairro:{
                type:String,
                require: true
            },
            numero:{
                type:Number,
                require:true
            },
            complemento:{
                type:String,
                require: false
            },
            municipio:{
                type:String,
                require: true
            },
            estado:{
                type:String,
                require: true
            },
            cep:{
                type:String,
                require: true
            },
        }
    ,

    veterinarios:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Veterinario',
            require:true
        }
    ],

    atendePlano:{
        type:Boolean,
        require: true,
        default: false
    },
    
    status:{
        type:Boolean,
        require: true,
        default: true
    },

    especialidades:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidade',
        require:true
    }],

});

mongoose.model('Estabelecimento', schema);