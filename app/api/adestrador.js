mongoose = require('mongoose');
const estabelecimento = require('../routes/estabelecimento');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Adestrador');
var Estabelecimento = mongoose.model('Estabelecimento');
var point = {}

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

api.lista = function(req, res) {
    model.find({}).populate('especialidades').populate('estabelecimentos')
        .then(function(adestradors) {
            res.json(adestradors);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });
}

api.buscaPorId = function(req, res) {
    model.findById(req.params.id).populate('estabelecimentos')
        .then(function(adestrador) {
            if (!adestrador) throw Error('Adestrador não localizado');
            res.json(adestrador);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorUsuario = function(req, res) {
    model.findOne({ user: req.params.id }).populate('estabelecimentos').populate('especialidades')
        .then(function(adestrador) {
            if (!adestrador) throw Error('Adestrador não localizado');
            res.json(adestrador);
        }, function(error) {
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorRG = function(req, res) {
    model.findOne({ rg: req.params.crmv })
        .then(async function(adestrador) {
            res.json(adestrador);
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

    const { nome, rg, uf, contato, endereco, atendePlano, especialidades, estabelecimentos, status, sobre, formacoes, experiencias, conquistas, img } = req.body;

    let adestradorForm = {
        nome: nome,
        rg: rg,
        uf: uf,
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
        adestradorForm.user = req.body.id;
    }

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        adestradorForm.location = {
            "type": "Point",
            coordinates: [point.lng, point.lat]
        }
    }

    adestradorForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const estabelecimentosForm = [];

    if (estabelecimentos.length && estabelecimentos[0].cnpj !== "") {
        estabelecimentosForm = estabelecimentos;
    }

    model.create(adestradorForm)
        .then(async function(adestrador) {

            estabelecimentosForm.map(async estab => {
                estab.adestradors = [adestrador._id];
                if (estab._id) {
                    const _id = estab._id;
                    Estabelecimento.findByIdAndUpdate(_id, { $push: { adestradors: adestrador._id } }, { new: true }).then(async function(estabUpdate) {

                    }, function(error) {
                        console.log(error);
                        res.status(500).json(error);
                    });
                    adestrador.estabelecimentos.push(_id);
                } else {
                    delete estab._id;
                    estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    estab.location = {
                        coordinates: [point.lng, point.lat]
                    }
                    const estabModel = new Estabelecimento({...estab })
                    estabModel.save();
                    adestrador.estabelecimentos.push(estabModel._id);
                }
            })

            await adestrador.save();
            if (req.body.id) {
                return true;
            } else {
                res.json(adestrador);
            }

        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        })
}

api.atualiza = async function(req, res) {
    const _id = req.params.id;
    const { nome, rg, uf, contato, endereco, atendePlano, especialidades, status, estabelecimentos, sobre, formacoes, experiencias, conquistas, img } = req.body;

    let adestradorForm = {
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

    adestradorForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (endereco && endereco.cep) {
        point = await MapsService.getLocaleByCEP(endereco);
        adestradorForm.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    const estabelecimentosForm = [];

    if (estabelecimentos.length && estabelecimentos[0].cnpj !== "") {
        estabelecimentosForm = estabelecimentos;
    }

    await Promise.all(estabelecimentosForm.map(async estab => {
        estab.adestradors = [_id];
        if (estab._id) {
            const _id = estab._id;
            Estabelecimento.findByIdAndUpdate(_id, { $push: { adestradors: _id } }, { new: true }).then(async function(estabUpdate) {

            }, function(error) {
                console.log(error);
                res.status(500).json(error);
            });
            adestradorForm.estabelecimentos.push(_id);

        } else {
            delete estab._id;

            estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            estab.location = {
                coordinates: [point.lng, point.lat]
            }
            const estabModel = new Estabelecimento({...estab })
            estabModel.save();
            adestradorForm.estabelecimentos.push(estabModel._id);


        }
    }));

    await model.findOneAndUpdate({ _id }, adestradorForm, { new: true }).then(async function(vet) {
        res.json(vet);
    }, function(error) {
        console.log(error);
        res.status(500).json(error);
    });
}

function formatarParamUrl(str) {
    if (str) {
        return str.trim().split('-').join(' ');
    } else {
        return "";
    }

}

module.exports = api;