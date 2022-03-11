module.exports = function (app) {
   const jwt = require('jsonwebtoken');
   var mongoose = require('mongoose');
   require('dotenv').config();
   const bcrypt = require('bcrypt');
   const nodemailer = require('nodemailer');
   const hbs = require('nodemailer-express-handlebars')
   const path = require('path')
   const crypto = require("crypto");

   const accessService = require("../services/access");
   var accessDB = mongoose.model('Access');

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
         // let users = await model.find({}).select('-hashedPassword ');
         let users = await
            model.aggregate([
               {
                  '$lookup': {
                     'from': 'accesses',
                     'localField': '_id',
                     'foreignField': 'user',
                     'as': 'accesses'
                  }
               },
               { $unwind: { path: "$accesses", preserveNullAndEmptyArrays: true } },
               { $sort: { "accesses.dateAccess": -1 } },
               {
                  $group: {
                     "_id": "$_id",
                     "nome": { $first: "$nome" },
                     "img": { $first: "$img" },
                     "email": { $first: "$email" },
                     "role": { $first: "$role" },
                     "createdAt": { $first: "$createdAt" },
                     "isAdmin": { $first: "$isAdmin" },
                     "lastLogin": { $first: "$accesses.dateAccess" }
                  }
               },
               {
                  $project: {
                     "_id": 1,
                     "nome": 1,
                     "img": 1,
                     "email": 1,
                     "role": 1,
                     "createdAt": 1,
                     "isAdmin": 1,
                     "lastLogin": 1
                  }
               },

            ]).exec()

         res.status(200).json({ users: users });
      } catch (err) {
         console.log('Erro não esperado ao salvar usuário ' + err);
         res.status(400).json({ error: "Ocorreu erro não esperado " + err });
      }

   }

   api.changeAdmin = async function (req, res) {

      try {
         await model.findByIdAndUpdate(req.params.id, { isAdmin: req.query.isAdmin }, { new: true });
         res.status(200).json(true);

      } catch (err) {
         console.log('Erro não esperado ao salvar usuário ' + err);
         res.status(400).json({ error: "Ocorreu erro não esperado " + err });
      }

   }

   api.updatePassword = async function (req, res) {
      try {

         let password = await bcrypt.hashSync(req.body.pass, 10);
         await model.findOneAndUpdate({ changePwd: req.params.token }, { changePwd: null, hashedPassword: password }, { new: true });
         res.status(200).json(true);

      } catch (err) {
         console.log('Erro ao atualizar a senha ' + err);
         res.status(500).json({ error: "Ocorreu erro não esperado " + err });
      }
   }

   api.changePassword = async function (req, res) {

      try {

         let userFind = await model.findOne({ email: req.body.email.toLowerCase() });

         if (userFind) {

            let token = crypto.randomBytes(32).toString("hex");

            await model.findByIdAndUpdate(userFind._id, { changePwd: token }, { new: true });

            const handlebarOptions = {
               viewEngine: {
                  partialsDir: path.resolve('./public/emails'),
                  defaultLayout: false,
               },
               viewPath: path.resolve('./public/emails'),
            };

            let emailFormated = req.body.email.toLowerCase();
            let emailFrom = process.env.EMAIL;

            var from = emailFrom;
            var to = emailFormated;

            var smtpTransport = nodemailer.createTransport({
               service: 'gmail',
               auth: {
                  user: emailFrom,
                  pass: process.env.PASSWORDEMAIL
               }
            });

            smtpTransport.use('compile', hbs(handlebarOptions))

            var mailOptions = {
               from: from,
               to: to,
               subject: 'Redefinição de Senha',
               template: 'forgot-password',
               context: {
                  url: "http://vetzco.com.br/update-password/" + token
               }
            }

            smtpTransport.sendMail(mailOptions, async function (error, response) {
               if (error) {
                  console.log('Erro ao enviar email: ' + error)
                  res.status(500).json({ error: "Ocorreu erro não esperado " + error });
               } else {
                  console.log('Email de recuperação de senha enviado com sucesso para: ' + userFind.email)
                  res.status(200).json(true);
               }
            });
         } else {
            console.log('Usuário não identificado para resgatar senha! ')
            res.status(400).json({ error: "Ocorreu erro não esperado " });
         }


      } catch (err) {
         console.log('Erro ao enviar email para recuperação ' + err);
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