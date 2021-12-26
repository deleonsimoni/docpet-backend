var mongoose = require('mongoose');

var schema = mongoose.Schema({
    
    nome:{
        type:String,
        require:true
    },

    nomeFormated:{
        type:String, 
    },

    img:{
        type:String, 
    },

    crmv:{
        type:String,
        require:true
    },

    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },

    location: {
        type: { type: String },
        coordinates: { type: [], default: undefined }
    },

    dtCriacao:{
        type: Date,
        default: Date.now
    },
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
    
    sobre:{
        type:String,
        require:true
    },

    formacoes:[{
        nomeInstituicao:{
            type:String,
            require:true
        },
        curso:{
            type:String,
            require:true
        },
        anoInicio:{
            type:Number,
            require:true
        },
        anoFim:{
            type:Number,
            require:true
        }
    }],

    experiencias:[{
        nomeEstabelecimento:{
            type:String,
            require:true
        },
        anoInicio:{
            type:Number,
            require:true
        },
        anoFim:{
            type:Number,
            require:true
        }
    }],

    conquistas:[{
        nome:{
            type:String,
            require:true
        },
        mes:{
            type:Number,
            require:true
        },
        ano:{
            type:Number,
            require:true
        },
        descricao:{
            type:String,
            require:true
        }
    }],

    especialidades:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidade',
        require:true
    }],

    estabelecimentos:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Estabelecimento',
            require:true
        }
    ],
   

   contato:{
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
   },
    endereco:{
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
       }
   },

   reviews: [{
    user:{
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

mongoose.model('Veterinario', schema);