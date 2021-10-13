var mongoose = require('mongoose');

var schema = mongoose.Schema({

    nome:{
        type:String, 
        require: true
    },
    
    descricao:{
        type:String,
        require: true
    },

});

mongoose.model('Especialidade', schema);