var mongoose = require('mongoose');

var schema = mongoose.Schema({
    
    access:{
        type:Number
    },

   
});

mongoose.model('Parameters', schema);