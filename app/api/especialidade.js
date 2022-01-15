mongoose = require('mongoose');

var api = {};
var especialidadeModel = mongoose.model('Especialidade');
var estabelecimentoModel = mongoose.model('Estabelecimento');
var veterinarioModel = mongoose.model('Veterinario');


api.lista = function (req, res) {
    especialidadeModel.find({}).sort({ nome: 'asc' })
        .then(function (especialidades) {
            res.json(especialidades);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.listaTotalEspcEstab = async function (req, res) {
    let ret = [];

    await especialidadeModel.find({}).sort({ nome: 'asc' })
        .then(async function (especialidades) {
            let totalEstab = 0;
            await Promise.all(especialidades.map(async especialidade => {
                await veterinarioModel.find({ especialidades: especialidade._id }).count().then(async function (count) {
                    await estabelecimentoModel.find({ especialidades: especialidade._id }).count().then(async function (countEstab) {
                        totalEstab = countEstab;
                    });

                    ret.push({ ...especialidade._doc, 'totalVet': count, 'totalEstab': totalEstab });
                });
            }));
            //ret = [{...especialidades, totalVet}];
            
            res.json(ret.sort((a,b) => (a.totalVet < b.totalVet) ? 1 : ((b.totalVet < a.totalVet) ? -1 : 0)));
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });

}

api.listAll = async function (req, res) {


    let retorno = [];
    let findRegex = req.query.search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    await especialidadeModel.find({ nomeFormated: { $regex: '.*' + findRegex + '.*', $options: 'i' } }).select('nome nomeFormated')
        .then(async function (especialidades) {

            retorno = [...retorno, ...especialidades.map(obj => ({ ...obj._doc, type: 1 }))];

            await veterinarioModel.find({ nomeFormated: { $regex: '.*' + findRegex + '.*', $options: 'i' } }).select('nome nomeFormated')
                .then(async function (veterinarios) {

                    retorno = [...retorno, ...veterinarios.map(obj => ({ ...obj._doc, type: 2 }))];

                    await estabelecimentoModel.find({ nomeFormated: { $regex: '.*' + findRegex + '.*', $options: 'i' } }).select('nome nomeFormated')
                        .then(async function (estabelecimento) {

                            res.json([...retorno, ...estabelecimento.map(obj => ({ ...obj._doc, type: 3 }))]);

                        }, function (error) {
                            console.log(error);
                            res.status(500).json(error);
                        });


                }, function (error) {
                    console.log(error);
                    res.status(500).json(error);
                });


        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.removeEspecialidadePorId = async function (req, res) {

    let especilidadeEmUso;

    especilidadeEmUso = await veterinarioModel.find({ especialidades: req.params.id }).count();
    especilidadeEmUso += await estabelecimentoModel.find({ especialidades: req.params.id }).count();
   
    if(especilidadeEmUso > 0){
        res.sendStatus(400);
    } else {

        especialidadeModel.deleteOne({ _id: req.params.id })
            .then(function () {
                res.sendStatus(204);
    
            }, function (error) {
                console.log(error);
                res.status(500).json(error);
            })

    }
}

api.adicionaEspecialidade = function (req, res) {

    req.body.nomeFormated = req.body.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    especialidadeModel.create(req.body)
        .then(function (estabelecimento) {
            res.json(estabelecimento);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        })
}


api.atualizaEspecialidade = function (req, res) {
    especialidadeModel.findOneAndUpdate({ _id: req.params.id }, req.body)
        .then(function (estabelecimento) {
            res.json(estabelecimento);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.buscaPorId = function(req, res){

    especialidadeModel.findById(req.params.id)
        .then(function(especialidade){
            if(!especialidade) throw Error('Especialidade não encontrado');
            res.json(especialidade);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}

module.exports = api;
