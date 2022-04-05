mongoose = require('mongoose');

var api = {};
var perguntasModel = mongoose.model('Pergunta');
var veterinarioModel = mongoose.model('Veterinario');
var estabelecimentoModel = mongoose.model('Estabelecimento');
var adestradorModel = mongoose.model('Adestrador');
var esteticaModel = mongoose.model('Estetica');


api.listarPerguntas = function (req, res) {
    perguntasModel.find({}).sort({ pergunta: 'asc' })
        .populate('user', 'nome img')
        .populate('especialidade', 'nome')
        .populate('respostas', 'createdAt resposta img like')
        .populate({
            path: 'respostas',
            populate: {
                path: 'user',
                model: 'Usuario',
                select: 'nome email img'
            }
        })
        .then(function (especialidades) {
            res.json(especialidades);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.listarPerguntasAdmin = function (req, res) {

    if (!req.user.isAdmin) {
        res.status(401).json({ error: "Não autorizado" });
        return
    }

    perguntasModel.find({}).sort({ status: 1 })
        .populate('especialidade', 'nome')
        .populate('user', 'nome')
        .then(function (pergunta) {
            res.json(pergunta);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.listarPerguntasResponder = async function (req, res) {

    let especialidades;

    if (req.user.role == 1) {
        //Veterinario
        especialidades = await veterinarioModel.find({ user: req.user._id }).populate('especialidades', '_id').select('especialidades');

    } else if (req.user.role == 2) {
        //Clinica
        especialidades = await estabelecimentoModel.find({ user: req.user._id }).populate('especialidades', '_id').select('especialidades');

    } else if (req.user.role == 3) {
        //Adestrador
        especialidades = await adestradorModel.find({ user: req.user._id }).populate('especialidades', '_id').select('especialidades');

    } else if (req.user.role == 4) {
        //Estetica
        especialidades = await esteticaModel.find({ user: req.user._id }).populate('especialidades', '_id').select('especialidades');

    }

    perguntasModel.find({ $and: [{ especialidade: { $in: especialidades[0].especialidades } }, { status: 1 }] }).sort({ status: 1 })
        .populate('especialidade', 'nome')
        .populate('user', 'nome')
        .then(function (pergunta) {
            res.json(pergunta);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}


api.listaDetalhePergunta = function (req, res) {
    perguntasModel.find({ '_id': req.params.id })
        .populate('especialidade', 'nome img')
        .populate('user', 'nome email img')
        .populate('respostas', 'createdAt resposta img like')
        .populate({
            path: 'respostas',
            populate: {
                path: 'user',
                model: 'Usuario',
                select: 'nome email img'
            }
        })
        .then(function (pergunta) {
            res.json(pergunta);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.validarPergunta = function (req, res) {

    if (!req.user.isAdmin) {
        res.status(401).json({ error: "Não autorizado" });
        return
    }

    perguntasModel.findByIdAndUpdate(req.params.id, { "$set": { status: req.body.status } })
        .then(async function (estabUpdate) {
            res.json(estabUpdate);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.responder = function (req, res) {

    let resposta = {};
    resposta.resposta = req.body.resposta;
    resposta.user = req.user._id;

    perguntasModel.findByIdAndUpdate(req.params.id, { $push: { respostas: resposta } }, { new: true })
        .then(async function (estabUpdate) {
            res.json(estabUpdate);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.changeEspecialidade = function (req, res) {

    if (!req.user.isAdmin) {
        res.status(401).json({ error: "Não autorizado" });
        return
    }

    perguntasModel.findByIdAndUpdate(req.params.id, { "$set": { especialidade: req.body.especialidade } })
        .then(async function (estabUpdate) {
            res.json(estabUpdate);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        });
}


api.alterarPergunta = function (req, res) {

    if (!req.user.isAdmin) {
        res.status(401).json({ error: "Não autorizado" });
        return
    } else {

        perguntasModel.find({}).sort({ status: 1 })
            .populate('especialidade', 'nome')
            .populate('user', 'nome')
            .then(function (pergunta) {
                res.json(pergunta);
            }, function (error) {
                console.log(error);
                res.status(500).json(error);
            });

    }

}




api.dashboardPerguntas = async function (req, res) {

    let counts = {};
    try {

        counts.totalPerguntas = await perguntasModel.count({});
        counts.totalRespostas = await perguntasModel.aggregate([{
            $project: {
                respostasSize: { $size: "$respostas" }
            }
        }]);
        counts.totalProfissionais = await perguntasModel.count({ role: 0 });


        res.status(200).json({ counts: counts });

    } catch (err) {
        console.log('Erro não esperado ao capturar dashboard perguntas ' + err);
        res.status(400).json({ error: "Erro não esperado ao capturar dashboard perguntas " + err });
    }
}

api.adicionarPerguntas = function (req, res) {


    req.body.anonimo = {
        nome: req.body.nome,
        email: req.body.email,
        wpp: req.body.wpp
    }

    perguntasModel.create(req.body)
        .then(function (pergunta) {
            res.json(pergunta);
        }, function (error) {
            console.log(error);
            res.status(500).json(error);
        })
}


module.exports = api;