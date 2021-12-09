   module.exports = function(app){
   const jwt = require('jsonwebtoken');
   var mongoose = require('mongoose');
   require('dotenv').config();

   var api = {};
   var model = mongoose.model('Usuario');

   api.autentica = function (req, res){
      model.findOne({login: req.body.login, senha: req.body.senha})
      .then(function(usuario){
         if(!usuario){
            console.log('Login e senha inválidos 1');
            res.sendStatus(401);

         } else{
            var token = jwt.sign({login:usuario.login}, process.env.SECRET, {
               expiresIn: 84600
            });

            console.log('Token criado e sendo enviado no header de reposta');
            res.set('x-access-token', token);
            res.end();
         }
      }, function(error){
            console.log('Login e senha inválidos');
            res.sendStatus(401)
      })

      
   }

   api.verificaToken = function(req, res, next){
      var token = req.headers['x-access-token'];
      console.log('Verificando Token...')
      if(token){
         jwt.verify(token, process.env.SECRET, function(err, decoded){
            if(err){
               console.log('Token rejeitado');
               res.sendStatus(401);
            }
            req.usuario = decoded;
            next();
         });
      }else{
         console.log('Token não foi enviado');
         res.sendStatus(401);
      }
      
   }
   return api;
}
