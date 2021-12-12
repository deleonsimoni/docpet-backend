var mongoose = require('mongoose');

var schema = mongoose.Schema({
    nome: {
      type: String,
      required: true,
    },
    img:{
      type:String, 
  },
    email: {
      type: String,
      required: true,
      unique: true,
      // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
      match: [
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please enter a valid email',
      ],
    },
    hashedPassword: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    //0 - User / 1 - Veterinario / 2 - Clinica
    role: 
      {
        type: Number,
        default: 0,
      },
  },
  {
    versionKey: false,
  }
);

mongoose.model('Usuario', schema);