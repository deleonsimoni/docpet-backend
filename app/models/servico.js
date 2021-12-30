var mongoose = require('mongoose');

var schema = mongoose.Schema({

    nome:{
        type:String, 
        require: true
    },

    nomeFormated:{
        type:String, 
    },
    
    descricao:{
        type:String,
        require: true
    },
    
    img:{
        type:String, 
    },
});

mongoose.model('Servico', schema);