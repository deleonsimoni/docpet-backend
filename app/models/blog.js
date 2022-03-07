var mongoose = require('mongoose');

var schema = mongoose.Schema({

    title:{
        type:String, 
        require: true
    },

    link_blog:{
        type:String, 
    },
    link_author:{
        type:String, 
    },
    especialidade:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Especialidade',
        require:true
    },
    doctor_name:{
        type:String, 
    },
    doctor_pic:{
        type:String, 
    },
    short_description:{
        type:String,
        require: true
    },
    description:{
        type:String,
        require: true
    },
    img:{
        type:String, 
    },
    place:{
        type:String, 
    },
    reviews:[{
        createdAt: {
            type: Date,
            default: Date.now,
          },
          nameUser: {
            type: String
          },
          email:{
            type: String,
            required: true
          },
          comment: {
              type: String
          },
          cellphone: {
              type: String
          }
    }],
    createdAt:{
        type: Date,
        default: Date.now,
    },

});

mongoose.model('Blog', schema);