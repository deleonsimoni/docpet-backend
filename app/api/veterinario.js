mongoose = require('mongoose');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Veterinario');
var Estabelecimento = mongoose.model('Estabelecimento');
var point = {}

api.lista = function (req, res){
    model.find({}).populate('especialidades').populate('estabelecimentos')
        .then(function(veterinarios){
            res.json(veterinarios);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.byName = function (req, res){
    model.findOne({nomeFormated: req.params.nomeFormated}).populate('especialidades').populate('estabelecimentos')
        .then(function(veterinarios){
            res.json(veterinarios);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}
api.byEspecialidade = function (req, res){
    model.find({especialidades : req.params.id}).populate('especialidades').populate('estabelecimentos')
        .then(function(veterinarios){
            res.json(veterinarios);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.byEspecialidadeMunicipio = async function (req, res){
   
    let geometry = await MapsService.getLocaleFromPlaceID(req.params.municipio);

    model.find({$and: [

        {especialidades : req.params.id}, 
        {'location': 
            {$near: {
                $geometry: {
                type: "Point" ,
                coordinates: [ geometry.lng, geometry.lat]
                },
            $maxDistance: 20000}
        }
    },
    ]})

    .populate('especialidades')
    .populate('estabelecimentos')
        .then(function(veterinarios){
            res.json(veterinarios);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.buscaPorId = function(req, res){
    model.findById(req.params.id).populate('estabelecimentos')
        .then(function(veterinario){
            if(!veterinario) throw Error('Veterinário não localizado');
            res.json(veterinario);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorCRMV = function(req, res){
    model.findOne({crmv: req.params.crmv})
        .then(async function(veterinario){
           res.json(veterinario);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        });
};

api.cepToLocale = async function(req, res){
    return res.json(await MapsService.getLocaleByCEP(JSON.parse(req.params.cep)));
};

api.locale = async function(req, res){
    return res.json(await MapsService.getLocale(req.params.search));
};

api.adiciona = async function(req, res){
    const {nome, crmv, contato, endereco, atendePlano, especialidades, estabelecimentos, status } = req.body;

    let veterinarioForm = {
        nome: nome,
        crmv: crmv,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status
    }

    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        veterinarioForm.location = {
            coordinates: [point.lng, point.lat]
          }
    }

    veterinarioForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    const estabelecimentosForm = estabelecimentos;

    model.create(veterinarioForm)
    .then(async function(veterinario){
        estabelecimentosForm.map(async estab =>{
            estab.veterinarios=[veterinario._id];
            if(estab._id){
                const _id = estab._id;
                Estabelecimento.findByIdAndUpdate(_id, { $push: {veterinarios: veterinario._id}}, {new: true}).then(async function(estabUpdate){
                
                }, function(error){
                    console.log(error);
                    res.status(500).json(error);
                });
                veterinario.estabelecimentos.push(_id);
            }else{
                delete estab._id;
                estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                estab.location = {
                    coordinates: [point.lng, point.lat]
                }
                const estabModel = new Estabelecimento({...estab})
                estabModel.save();
                veterinario.estabelecimentos.push(estabModel._id);
            }
        })
        await veterinario.save();        
        res.json(veterinario);

     }, function(error){
         console.log(error);
         res.status(500).json(error);
     })
 }

 api.atualiza = async function(req, res){
    const _id = req.params.id;
    const {nome, crmv, contato, endereco, atendePlano, especialidades, status, estabelecimentos } = req.body;

    let veterinarioForm = {
        nome: nome,
        crmv: crmv,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        estabelecimentos: [],
        status: status

    }
    
    veterinarioForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        veterinarioForm.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }

    const estabelecimentosForm = estabelecimentos;

    await Promise.all(estabelecimentosForm.map(async estab =>{
        estab.veterinarios=[_id];
        if(estab._id){
            const _id = estab._id;
            Estabelecimento.findByIdAndUpdate(_id, { $push: {veterinarios: _id}}, {new: true}).then(async function(estabUpdate){

            }, function(error){
                console.log(error);
                res.status(500).json(error);
            });
            veterinarioForm.estabelecimentos.push(_id);

        }else{
            delete estab._id;
        
            estab.nomeFormated = estab.nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            estab.location = {
                coordinates: [point.lng, point.lat]
            }
            const estabModel = new Estabelecimento({...estab})
            estabModel.save();
            veterinarioForm.estabelecimentos.push(estabModel._id);
            
            
        }
    }));
    
    await model.findOneAndUpdate({ _id }, veterinarioForm, {new: true}).then(async function(vet){
        res.json(vet);
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
} */





module.exports = api;
