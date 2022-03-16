mongoose = require('mongoose');

var api = {};
var modal = mongoose.model('Plano');

api.lista = function(req, res) {
    modal.find({}).sort({ nome: 'asc' })
        .then(function(planos) {
            res.json(planos);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.removePlanoId = async function(req, res) {

    /*let servicoEmUso;

    servicoEmUso += await estabelecimentoModel.find({ servicos: req.params.id }).count();

    if (servicoEmUso > 0) {
        res.sendStatus(400);
    } else {

        modal.deleteOne({ _id: req.params.id })
            .then(function() {
                res.sendStatus(204);

            }, function(error) {
                console.log(error);
                res.status(500).json(error);
            })

    }*/
}

api.adicionaPlano = function(req, res) {

    req.body.nomeFormated = req.body.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    modal.create(req.body)
        .then(function(plano) {
            res.json(plano);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.atualizaPlano = function(req, res) {

    req.body.nomeFormated = req.body.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    modal.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(function(plano) {
            res.json(plano);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.buscaPorId = function(req, res) {
    console.log(req.params.id)
    modal.findById(req.params.id)
        .then(function(plano) {
            if (!plano) throw Error('Plano não encontrado');
            res.json(plano);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}
api.buscaPorNome = function(req, res) {
    console.log(req.params.nomeFormated)
    let parm = formatarParamUrl(req.params.nomeFormated);
    const strFormated = new RegExp(`${parm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');
    modal.find({'nomeFormated':strFormated})
        .then(function(plano) {
            if (!plano) throw Error('Plano não encontrado');
            res.json(plano);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

function formatarParamUrl(str) {
    if (str) {
        return str.trim().split('-').join(' ');
    } else {
        return "";
    }

}

module.exports = api;