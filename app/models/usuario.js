var mongoose = require('mongoose');

var schema = mongoose.Schema({

    login:{
        type:String, 
        require: true
    },
    
    senha:{
        type:String,
        require: true
    },

});

mongoose.model('Usuario', schema);