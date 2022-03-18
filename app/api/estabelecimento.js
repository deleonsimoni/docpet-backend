mongoose = require('mongoose');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Estabelecimento');
var Veterinario = mongoose.model('Veterinario');
var servico = mongoose.model('Servico');
var point = {}

api.lista = function(req, res) {
    model.find({}).populate('veterinarios').sort({ dtCriacao: -1 }).populate('especialidades').populate('servicos')
        .then(function(estabelecimentos) {
            res.json(estabelecimentos);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.adiciona = async function(req, res) {
    if (!req.body) {
        req.body = req;
    }
    const { nome, cnpj, contato, endereco, atendePlano, especialidades, veterinarios, img, servicos, sobre } = req.body;

    let estabelecimentoForm = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        servicos: servicos,
        img: img,
        sobre: sobre
    }

    if (req.id) {
        estabelecimentoForm.user = req.body.id;
    }

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        estabelecimentoForm.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    estabelecimentoForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const veterinariosForm = veterinarios;

    model.create(estabelecimentoForm)
        .then(async function(estabelecimento) {
            veterinariosForm.map(async vet => {
                vet.estabelecimentos = [estabelecimento._id];
                if (vet._id) {
                    Veterinario.findByIdAndUpdate(vet._id, { $push: { estabelecimentos: estabelecimento._id } }, { new: true })
                        .then(async function(estabUpdate) {

                        }, function(error) {
                            console.log(error);
                            res.status(500).json(error);
                        });
                    estabelecimento.veterinarios.push(vet._id);

                } else {
                    delete vet._id;
                    vet.nomeFormated = vet.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    vet.location = {
                        coordinates: [point.lng, point.lat]
                    }
                    const estabVet = new Veterinario({...vet })
                    estabVet.save();
                    estabelecimento.veterinarios.push(estabVet._id);
                }
            })
            await estabelecimento.save();
            if (req.body.id) {
                return true;
            } else {
                res.json(estabelecimento);
            }

        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.buscaPorId = function(req, res) {
    model.findById(req.params.id).populate('veterinarios').populate('especialidades').populate('servicos')
        .then(function(estabelecimento) {
            if (!estabelecimento) throw Error('Estabelecimento não encontrada');
            res.json(estabelecimento);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorCNPJ = function(req, res) {
    model.findOne({ cnpj: req.params.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5") })
        .then(async function(estabelecimento) {
            res.json(estabelecimento);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        });
};

api.buscarPorVeterinario = function(req, res) {
    model.find({ veterinarios: req.params.id })
        .then(function(estabelecimentos) {
            res.json(estabelecimentos);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.cepToLocale = async function(req, res) {
    return res.json(await MapsService.getLocaleByCEP(JSON.parse(req.params.cep)));
};

api.atualiza = async function(req, res) {
    const _id = req.params.id;

    const { nome, cnpj, contato, endereco, atendePlano, especialidades, status, veterinarios, img, servicos, sobre } = req.body;

    let estabelecimento = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status,
        veterinarios: [],
        img: img,
        servicos: servicos,
        sobre: sobre,
    }

    estabelecimento.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        estabelecimento.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    const veterinariosForm = veterinarios;

    await Promise.all(veterinariosForm.map(async vet => {
        vet.estabelecimentos = [_id];
        if (vet._id) {
            Veterinario.findByIdAndUpdate(vet._id, { $push: { estabelecimentos: estabelecimento._id } }, { new: true })
                .then(async function(estabUpdate) {

                }, function(error) {
                    console.log(error);
                    res.status(500).json(error);
                });
            estabelecimento.veterinarios.push(vet._id);

        } else {
            delete vet._id;
            vet.nomeFormated = vet.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            vet.location = {
                coordinates: [point.lng, point.lat]
            }

            const estabVet = new Veterinario({...vet })
            estabVet.save();
            estabelecimento.veterinarios.push(estabVet._id);
        }
    }));

    await model.findOneAndUpdate({ _id }, estabelecimento, { new: true }).then(async function(estab) {
        res.json(estab);
    }, function(error) {
        console.log(error);
        res.status(500).json(error);
    });

}

api.byNome = async function(req, res) {
    let name = formatarParamUrl(req.params.nome);

    const strFormated = new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, 'i');

    await model.findOne({ nomeFormated: strFormated }).populate('veterinarios').populate('especialidades').populate('servicos')
        .then(function(estabelecimento) {
            res.json(estabelecimento);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });

}


api.getReview = async function(req, res) {
    try {
        let review = await model.findById(req.params.id).populate({
            path: 'reviews',
            populate: {
                path: 'user',
                model: 'Usuario',
                select: 'nome'
            }
        }).select('reviews');
        res.status(200).json({ reviews: review });

    } catch (err) {
        console.log('Erro não esperado ao salvar usuário ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
};

api.createReview = async function(req, res) {

    try {

        let a = await model.findOneAndUpdate({ _id: req.params.id }, { $push: { reviews: req.body } });
        res.status(200).json(true);

    } catch (err) {
        console.log('Erro não esperado ao salvar review ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
};

function formatarParamUrl(str) {
    if (str) {
        return str.trim().split('-').join(' ');
    } else {
        return "";
    }

}

api.buscaPorUsuario = function(req, res) {
        model.findOne({ user: req.params.id }).populate('veterinarios').populate('especialidades').populate('servicos')
            .then(function(estabelecimento) {
                if (!estabelecimento) throw Error('Esatabelecimento não localizado');
                res.json(estabelecimento);
            }, function(error) {
                console.log(error);
                res.status(404).json(error);
            })
    }
    /*api.removePorId = function(req, res){
        model.deleteOne({_id: req.params.id})
            .then(function(){
                res.sendStatus(204);

            }, function(error){
                console.log(error);
                res.status(500).json(error);
            })
    }



    api.atualiza = function(req, res){
        model.findByIdAndUpdate(req.params.id, req.body)
            .then(function(foto){
                res.json(foto);

            }, function(error){
                console.log(error);
                res.status(500).json(error);
            })
    }
    */

module.exports = api;