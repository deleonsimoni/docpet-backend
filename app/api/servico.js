mongoose = require('mongoose');

var api = {};
var servicoModel = mongoose.model('Servico');
var estabelecimentoModel = mongoose.model('Estabelecimento');
var veterinarioModel = mongoose.model('Veterinario');
var userModel = mongoose.model('Usuario');



api.lista = function (req, res) {
    servicoModel.find({}).sort({ nome: 'asc' })
        .then(function (servicos) {
            res.json(servicos);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}



api.mergeUsersVets = async function (req, res) {

    let emailAux;
    let retorno = 'Fazendo tarefa -> \n';
    let countAux = 0;
    let userDB;

    let objUser = {
        nome: 'a',
        email: 'a',
        hashedPassword: 'a',
        role: 1
    }

    let vets = await veterinarioModel.find({ user: null }).sort('contato.email');


    await vets
        .filter(vet => vet.contato.email)
        .forEach(async function (veterinario, i) {
            if (emailAux != veterinario.contato.email) {
                emailAux = veterinario.contato.email
                objUser.nome = veterinario.nome;
                objUser.email = veterinario.contato.email.toLowerCase();

                userDB = new userModel(objUser);
                let userCreate = await userDB.save();

                await veterinarioModel.findByIdAndUpdate(veterinario._id, { $push: { user: userCreate._id } }, { new: true })

                console.log('[forEach]', veterinario.nome, veterinario.contato.email.toLowerCase(), i);
                retorno += `[merge user Vet], ${veterinario.nome}, ${veterinario.contato.email.toLowerCase()}\r\n`;
                countAux++;
            }
        })

    res.status(200).json('processo finalizado');

}

api.mergeUsersEstabs = async function (req, res) {

    let emailAux;
    let retorno = 'Fazendo tarefa -> \n';
    let countAux = 0;
    let userDB;

    let objUser = {
        nome: 'a',
        email: 'a',
        hashedPassword: 'a',
        role: 1
    }

    let vets = await estabelecimentoModel.find({ user: null }).sort('contato.email');


    await vets
        .filter(vet => vet.contato.email)
        .forEach(async function (veterinario, i) {
            if (emailAux != veterinario.contato.email) {
                emailAux = veterinario.contato.email
                objUser.nome = veterinario.nome;
                objUser.email = veterinario.contato.email.toLowerCase();

                userDB = new userModel(objUser);
                let userCreate = await userDB.save();

                await estabelecimentoModel.findByIdAndUpdate(veterinario._id, { $push: { user: userCreate._id } }, { new: true })

                console.log('[forEach]', veterinario.nome, veterinario.contato.email.toLowerCase(), i);
                retorno += `[merge user Vet], ${veterinario.nome}, ${veterinario.contato.email.toLowerCase()}\r\n`;
                countAux++;
            }
        })

    res.status(200).json('processo finalizado');

}

api.removeServicoId = async function (req, res) {

    let servicoEmUso;

    servicoEmUso += await estabelecimentoModel.find({ servicos: req.params.id }).count();

    if (servicoEmUso > 0) {
        res.sendStatus(400);
    } else {

        servicoModel.deleteOne({ _id: req.params.id })
            .then(function () {
                res.sendStatus(204);

            }, function (error) {
                console.log(error);
                res.status(500).json(error);
            })

    }
}

api.adicionaServico = function (req, res) {

    req.body.nomeFormated = req.body.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    servicoModel.create(req.body)
        .then(function (servico) {
            res.json(servico);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        })
}


api.atualizaServico = function (req, res) {

    req.body.nomeFormated = req.body.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    servicoModel.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(function (servico) {
            res.json(servico);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.buscaPorId = function (req, res) {
    console.log(req.params.id)
    servicoModel.findById(req.params.id)
        .then(function (servico) {
            if (!servico) throw Error('Servico não encontrado');
            res.json(servico);
        }, function (error) {
            console.log(error);
            res.status(404).json(error);
        })
}


module.exports = api;
