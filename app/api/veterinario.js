mongoose = require('mongoose');

var api = {};
var model = mongoose.model('Veterinario');
var Estabelecimento = mongoose.model('Estabelecimento');

api.lista = function (req, res){
    model.find({})
        .then(function(veterinarios){
            res.json(veterinarios);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.buscaPorId = function(req, res){
    model.findById(req.params.id)
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

api.adiciona = function(req, res){
    const {nome, crmv, contato, endereco, atendePlano, especialidades, estabelecimentos } = req.body;

    let veterinarioForm = {
        nome: nome,
        crmv: crmv,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades
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
            }else{
                delete estab._id;
                const estabModel = new Estabelecimento({...estab})
                estabModel.save();
            }
        })
        
        res.json(veterinario);

     }, function(error){
         console.log(error);
         res.status(500).json(error);
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
