var mongoose = require('mongoose');

var schema = mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Usuario'
    },

    typeUser: {
        type: String
    },

    dateAccess: {
        type: Date,
        default: Date.now,
    },

});

mongoose.model('Access', schema);