mongoose = require('mongoose');

var api = {};
var servicoModel = mongoose.model('Servico');
var estabelecimentoModel = mongoose.model('Estabelecimento');



api.lista = function (req, res) {
    servicoModel.find({}).sort({ nome: 'asc' })
        .then(function (servicos) {
            res.json(servicos);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}





api.removeServicoId = async function (req, res) {

    let servicoEmUso;

    servicoEmUso += await estabelecimentoModel.find({ servicos: req.params.id }).count();
   
    if(servicoEmUso > 0){
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

api.buscaPorId = function(req, res){
    console.log(req.params.id)
    servicoModel.findById(req.params.id)
        .then(function(servico){
            if(!servico) throw Error('Servico não encontrado');
            res.json(servico);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}


module.exports = api;
