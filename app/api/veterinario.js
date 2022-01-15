mongoose = require('mongoose');
const estabelecimento = require('../routes/estabelecimento');
const MapsService = require('../services/service-maps');

var api = {};
var model = mongoose.model('Veterinario');
var Estabelecimento = mongoose.model('Estabelecimento');
var especialidadeModel = mongoose.model('Especialidade');
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
    model.findOne({nomeFormated: {'$regex' : req.params.nomeFormated, '$options' : 'i'}})
    .populate('especialidades')
    .populate('estabelecimentos')
    .populate({
        path: 'reviews',
        populate: {
            path: 'user',
            model: 'Usuario',
            select: 'nome'
        }
    })
        .then(function(veterinario){
            res.json(veterinario);
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
            $maxDistance: 2000000}
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

api.byNoEspecialidadeMunicipio = async function (req, res){
   
    let especialidade;

    await especialidadeModel.findOne({nomeFormated: {'$regex' : formatarParamUrl(req.params.especialidade), '$options' : 'i'}}).then(function(espec){
        especialidade = espec;

    }, function(error){
        console.log(error);
        res.status(500).json(error);
    });

    let objMap = await MapsService.getLocaleFromDescription(req.params.municipio);
    
    await model.find({$and: [

        {especialidades:{_id:especialidade._id}},
        {'location': 
            {$near: {
                $geometry: {
                type: "Point" ,
                coordinates: [ objMap.geometry.location.lng, objMap.geometry.location.lat]
                },
            $maxDistance: 2000000}
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

api.byNomeEspecialidadeMunicipio = async function (req, res){

    let especialidade;

    await especialidadeModel.findOne({nomeFormated: {'$regex' : formatarParamUrl(req.params.especialidadeFormated), '$options' : 'i'}}).then(function(espec){
        especialidade = espec;

    }, function(error){
        console.log(error);
        res.status(500).json(error);
    });
    
    await model.findOne({nomeFormated: {'$regex' : formatarParamUrl(req.params.nomeFormated), '$options' : 'i'}, $and: [

        {"endereco.municipio": {'$regex' : formatarParamUrl(req.params.municipioFormated), '$options' : 'i'}}, 
        {especialidades:{_id:especialidade._id}}
    
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
    model.findById(req.params.id).populate('estabelecimentos').populate('especialidades')
        .then(function(veterinario){
            if(!veterinario) throw Error('Veterinário não localizado');
            res.json(veterinario);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}

api.buscaPorUsuario = function(req, res){
    model.findOne({user: req.params.id}).populate('estabelecimentos').populate('especialidades')
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

    if(!req.body){
        req.body = req;
    }

    const {nome, crmv, contato, endereco, atendePlano, especialidades, estabelecimentos, status, sobre, formacoes, experiencias, conquistas, img, uf } = req.body;

    let veterinarioForm = {
        nome: nome,
        crmv: crmv,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status ? true : false,
        sobre:sobre,
        formacoes:formacoes,
        experiencias:experiencias,
        conquistas:conquistas,
        img: img,
        uf:uf 
    }

    if(req.id){
        veterinarioForm.user = req.body.id;
    }
    
    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        veterinarioForm.location = {
            "type": "Point",
            coordinates: [point.lng, point.lat]
          }
    }

    veterinarioForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    let estabelecimentosForm = [];

    if(estabelecimentos.length && estabelecimentos[0].cnpj !== ""){
        estabelecimentosForm = estabelecimentos;
    }
    
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
        if(req.body.id){
            return true;
        } else {
            res.json(veterinario);
        }

     }, function(error){
         console.log(error);
         res.status(500).json(error);
     })
 }

 api.atualiza = async function(req, res){
    const _id = req.params.id;
    const {nome, crmv, contato, endereco, atendePlano, especialidades, status, estabelecimentos, sobre, formacoes, experiencias, conquistas, img, uf } = req.body;

    let veterinarioForm = {
        nome: nome,
        crmv: crmv,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        estabelecimentos: [],
        status: status,
        sobre:sobre,
        formacoes:formacoes,
        experiencias:experiencias,
        conquistas:conquistas,
        img: img,
        uf: uf,

    }
    
    veterinarioForm.nomeFormated = nome.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    if(endereco && endereco.cep){
        point = await MapsService.getLocaleByCEP(endereco);
        veterinarioForm.location = {
            type: 'Point',
            coordinates: [point.lng, point.lat]
        }
    }
    
    let estabelecimentosForm = [];

    if(estabelecimentos.length && estabelecimentos[0].cnpj !== ""){
        estabelecimentosForm = estabelecimentos;
    }

  
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



api.getReview = async function(req, res){
    try {
        let review = await model.findById(req.params.id).populate({
            path:     'reviews',			
            populate: { path:  'user',
                    model: 'Usuario',
                    select: 'nome' }
          }).select('reviews');
        res.status(200).json({ reviews: review });

    } catch (err) {
        console.log('Erro não esperado ao salvar usuário ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
     }
};

api.createReview = async function(req, res){

    try {

        let a = await model.findOneAndUpdate({_id: req.params.id }, {$push : {reviews: req.body}});
        res.status(200).json(true);

    } catch (err) {
        console.log('Erro não esperado ao salvar review ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
     }
};

/*api.removePorId = function(req, res){
    model.deleteOne({_id: req.params.id})
        .then(function(){
            res.sendStatus(204);

        }, function(error){
            console.log(error);
            res.status(500).json(error);
        })
} */


function formatarParamUrl(str){
    if(str){
      return str.trim().split('-').join(' ');
    }else{
      return "";
    }

}


module.exports = api;
