mongoose = require('mongoose');
const estabelecimento = require('../routes/estetica');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Estetica');
var Estabelecimento = mongoose.model('Estabelecimento');
var point = {}

api.lista = function(req, res) {
    model.find({}).populate('especialidades').populate('estabelecimentos')
        .then(function(esteticas) {
            res.json(esteticas);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.buscaPorId = function(req, res) {
    model.findById(req.params.id).populate('estabelecimentos')
        .then(function(estetica) {
            if (!estetica) throw Error('Estetica não localizado');
            res.json(estetica);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorUsuario = function(req, res) {
    model.findOne({ user: req.params.id }).populate('estabelecimentos').populate('especialidades')
        .then(function(estetica) {
            if (!estetica) throw Error('Estética não localizado');
            res.json(estetica);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorRG = function(req, res) {
    model.findOne({ rg: req.params.crmv })
        .then(async function(estetica) {
            res.json(estetica);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        });
};

api.cepToLocale = async function(req, res) {
    return res.json(await MapsService.getLocaleByCEP(JSON.parse(req.params.cep)));
};

api.locale = async function(req, res) {
    return res.json(await MapsService.getLocale(req.params.search));
};

api.adiciona = async function(req, res) {

    if (!req.body) {
        req.body = req;
    }

    const { nome, rg, contato, uf, endereco, atendePlano, especialidades, estabelecimentos, status, sobre, formacoes, experiencias, conquistas, img } = req.body;

    let esteticaForm = {
        nome: nome,
        uf: uf,
        rg: rg,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status ? true : false,
        sobre: sobre,
        formacoes: formacoes,
        experiencias: experiencias,
        conquistas: conquistas,
        img: img
    }

    if (req.id) {
        esteticaForm.user = req.body.id;
    }

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        esteticaForm.location = {
            "type": "Point",
            coordinates: [point.lng, point.lat]
        }
    }

    esteticaForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const estabelecimentosForm = [];

    if (estabelecimentos.length && estabelecimentos[0].cnpj !== "") {
        estabelecimentosForm = estabelecimentos;
    }

    model.create(esteticaForm)
        .then(async function(estetica) {

            estabelecimentosForm.map(async estab => {
                estab.esteticas = [estetica._id];
                if (estab._id) {
                    const _id = estab._id;
                    Estabelecimento.findByIdAndUpdate(_id, { $push: { esteticas: estetica._id } }, { new: true }).then(async function(estabUpdate) {

                    }, function(error) {
                        console.log(error);
                        res.status(500).json(error);
                    });
                    estetica.estabelecimentos.push(_id);
                } else {
                    delete estab._id;
                    estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    estab.location = {
                        coordinates: [point.lng, point.lat]
                    }
                    const estabModel = new Estabelecimento({...estab })
                    estabModel.save();
                    estetica.estabelecimentos.push(estabModel._id);
                }
            })

            await estetica.save();
            if (req.body.id) {
                return true;
            } else {
                res.json(estetica);
            }

        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.atualiza = async function(req, res) {
    const _id = req.params.id;
    const { nome, rg, uf, contato, endereco, atendePlano, especialidades, status, estabelecimentos, sobre, formacoes, experiencias, conquistas, img } = req.body;

    let esteticaForm = {
        nome: nome,
        rg: rg,
        uf: uf,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        estabelecimentos: [],
        status: status,
        sobre: sobre,
        formacoes: formacoes,
        experiencias: experiencias,
        conquistas: conquistas,
        img: img

    }

    esteticaForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        esteticaForm.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    const estabelecimentosForm = [];

    if (estabelecimentos.length && estabelecimentos[0].cnpj !== "") {
        estabelecimentosForm = estabelecimentos;
    }

    await Promise.all(estabelecimentosForm.map(async estab => {
        estab.esteticas = [_id];
        if (estab._id) {
            const _id = estab._id;
            Estabelecimento.findByIdAndUpdate(_id, { $push: { esteticas: _id } }, { new: true }).then(async function(estabUpdate) {

            }, function(error) {
                console.log(error);
                res.status(500).json(error);
            });
            esteticaForm.estabelecimentos.push(_id);

        } else {
            delete estab._id;

            estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            estab.location = {
                coordinates: [point.lng, point.lat]
            }
            const estabModel = new Estabelecimento({...estab })
            estabModel.save();
            esteticaForm.estabelecimentos.push(estabModel._id);


        }
    }));

    await model.findOneAndUpdate({ _id }, esteticaForm, { new: true }).then(async function(vet) {
        res.json(vet);
    }, function(error) {
        console.log(error);
        res.status(500).json(error);
    });
}

api.byNomeMunicipio = async function(req, res) {

    await model.findOne({
            nomeFormated: { '$regex': formatarParamUrl(req.params.nomeFormated), '$options': 'i' },
            $and: [
                { "endereco.municipio": { '$regex': formatarParamUrl(req.params.municipioFormated), '$options': 'i' } }
            ]
        })
        .populate('especialidades')
        .populate('estabelecimentos')
        .then(function(adestrador) {
            res.json(adestrador);
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
module.exports = api;