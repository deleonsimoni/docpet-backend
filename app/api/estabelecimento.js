mongoose = require('mongoose');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Estabelecimento');
var Veterinario = mongoose.model('Veterinario');
var point = {}

api.lista = function (req, res){
    model.find({}).populate('veterinarios').populate('especialidades')
        .then(function(estabelecimentos){
            res.json(estabelecimentos);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.adiciona = async function(req, res){
    const {nome, cnpj, contato, endereco, atendePlano, especialidades, veterinarios } = req.body;

    let estabelecimentoForm = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades
    }
    
    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        estabelecimentoForm.location = {
            coordinates: [point.lng, point.lat]
        }
    }

    estabelecimentoForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const veterinariosForm = veterinarios;

    model.create(estabelecimentoForm)
    .then(async function(estabelecimento){
        veterinariosForm.map(async vet =>{
            vet.estabelecimentos=[estabelecimento._id];
            if(vet._id){
                Veterinario.findByIdAndUpdate(vet._id, { $push: {estabelecimentos: estabelecimento._id}}, {new: true})
                .then(async function(estabUpdate){
                
                }, function(error){
                    console.log(error);
                    res.status(500).json(error);
                });
                estabelecimento.veterinarios.push(vet._id);
            
            }else{
                delete vet._id;
                vet.nomeFormated = vet.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                vet.location = {
                    coordinates: [point.lng, point.lat]
                }
                const estabVet = new Veterinario({...vet})
                estabVet.save();
                estabelecimento.veterinarios.push(estabVet._id);
            }
        })
        await estabelecimento.save();
        res.json(estabelecimento);

     }, function(error){
         console.log(error);
         res.status(500).json(error);
     })
 }

api.buscaPorId = function(req, res){
    model.findById(req.params.id).populate('veterinarios')
        .then(function(estabelecimento){
            if(!estabelecimento) throw Error('Estabelecimento não encontrada');
            res.json(estabelecimento);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorCNPJ = function(req, res){
    model.findOne({cnpj: req.params.cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, "$1.$2.$3/$4-$5")})
        .then(async function(estabelecimento){
           res.json(estabelecimento);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        });
};

api.buscarPorVeterinario = function (req, res){
    model.find({veterinarios: req.params.id})
        .then(function(estabelecimentos){
            res.json(estabelecimentos);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.cepToLocale = async function(req, res){
    return res.json(await MapsService.getLocaleByCEP(JSON.parse(req.params.cep)));
};

api.atualiza = async function(req, res){
    const _id = req.params.id;

    const {nome, cnpj, contato, endereco, atendePlano, especialidades, status, veterinarios } = req.body;

    let estabelecimento = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status,
        veterinarios: []
    }

    estabelecimento.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        estabelecimento.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    const veterinariosForm = veterinarios;
    
    await Promise.all(veterinariosForm.map(async vet =>{
        vet.estabelecimentos=[_id];
            if(vet._id){
                Veterinario.findByIdAndUpdate(vet._id, { $push: {estabelecimentos: estabelecimento._id}}, {new: true})
                .then(async function(estabUpdate){
                
                }, function(error){
                    console.log(error);
                    res.status(500).json(error);
                });
                estabelecimento.veterinarios.push(vet._id);
            
            }else{
                delete vet._id;
                vet.nomeFormated = vet.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                vet.location = {
                    coordinates: [point.lng, point.lat]
                }

                const estabVet = new Veterinario({...vet})
                estabVet.save();
                estabelecimento.veterinarios.push(estabVet._id);
            }
    }));
    
    await model.findOneAndUpdate({ _id }, estabelecimento, {new: true}).then(async function(estab){
        res.json(estab);
    }, function(error){
        console.log(error);
        res.status(500).json(error);
    });
   
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
