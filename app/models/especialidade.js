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

});

mongoose.model('Especialidade', schema);