module.exports = function (app) {
   const jwt = require('jsonwebtoken');
   var mongoose = require('mongoose');
   require('dotenv').config();
   const bcrypt = require('bcrypt');

   var api = {};
   var model = mongoose.model('Usuario');
   var veterinarioService = require('./veterinario.js');
   var adestradorService = require('./adestrador.js');
   var esteticaService = require('./estetica.js');

   var estabelecimentoService = require('./estabelecimento.js');


   api.createUser = async function (req, res) {

      try {
         const emailDup = await model.findOne({ email: req.body.email })

         if (emailDup) {
            console.log('Email já existe na base de dados ' + req.body.email);
            res.status(400).json({ error: "E-mail já cadastrado na base de dados" });

         } else {
            let user = req.body;
            user.hashedPassword = await bcrypt.hashSync(user.password, 10);

            const userDB = new model(user)
            let saveUser = await userDB.save();

            if (user.role == 1) {
               //Veterinario
               user.id = saveUser._id;
               let ok = veterinarioService.adiciona(user);


            } else if (user.role == 2) {
               //Clinica
               user.id = saveUser._id;
               let ok = estabelecimentoService.adiciona(user);

            } else if (user.role == 3) {
               //Adestrador
               user.id = saveUser._id;
               let ok = adestradorService.adiciona(user);

            } else if (user.role == 4) {
               //Estetica
               user.id = saveUser._id;
               let ok = esteticaService.adiciona(user);

            }

            api.autentica({ body: { isCreated: true, email: saveUser.email, password: user.password } }, res);

         }
      } catch (err) {
         console.log('Erro não esperado ao salvar usuário ' + err);
         res.status(400).json({ error: "Ocorreu erro não esperado " + err });
      }


   }

   api.getUsers = async function (req, res) {

      try {
         let users = await model.find({}).select('-hashedPassword ');
         res.status(200).json({ users: users });
      } catch (err) {
         console.log('Erro não esperado ao salvar usuário ' + err);
         res.status(400).json({ error: "Ocorreu erro não esperado " + err });
      }

   } 

   api.changeAdmin = async function (req, res) {

      try {
        await model.findByIdAndUpdate(req.params.id, {isAdmin: req.query.isAdmin}, {new: true});
         res.status(200).json(true);

      } catch (err) {
         console.log('Erro não esperado ao salvar usuário ' + err);
         res.status(400).json({ error: "Ocorreu erro não esperado " + err });
      }

   }



   api.autentica = async function (req, res) {


      model.findOne({ email: req.body.email })
         .then(function (usuario) {
            if (!usuario) {
               console.log('Login e senha inválidos 1');
               res.sendStatus(401);

            } else {
               if (!bcrypt.compareSync(req.body.password, usuario.hashedPassword)) {
                  console.log('Login e senha inválidos 2');
                  res.sendStatus(401);
               } else {
                  var token = jwt.sign({ id: usuario._id, login: usuario.nome, role: usuario.role, isAdmin: usuario.isAdmin }, process.env.SECRET, {
                     expiresIn: 84600
                  });

                  res.status(200).json({ token: token });
               }

            }
         }, function (error) {
            console.log('Login e senha inválidos');
            res.sendStatus(401)
         })


   }

   api.verificaToken = function (req, res, next) {
      var token = req.headers['x-access-token'];
      console.log('Verificando Token...')
      if (token) {
         jwt.verify(token, process.env.SECRET, function (err, decoded) {
            if (err) {
               console.log('Token rejeitado');
               res.sendStatus(401);
            }
            req.usuario = decoded;
            next();
         });
      } else {
         console.log('Token não foi enviado');
         res.sendStatus(401);
      }

   }
   return api;
}
