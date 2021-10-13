mongoose = require('mongoose');

var api = {};
var model = mongoose.model('Estabelecimento');
var Veterinario = mongoose.model('Veterinario');

api.lista = function (req, res){
    model.find({}).populate('veterinarios')
        .then(function(estabelecimentos){
            res.json(estabelecimentos);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.adiciona = function(req, res){
    const {nome, cnpj, contato, endereco, atendePlano, especialidades, veterinarios } = req.body;

    const estabelecimentoForm = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades
    }
    const veterinariosForm = veterinarios;

    model.create(estabelecimentoForm)
    .then(async function(estabelecimento){
        veterinariosForm.map(async vet =>{
            delete vet._id;
            const estabVet = new Veterinario({...vet})
            estabVet.save();
            estabelecimento.veterinarios.push(estabVet._id);
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
    console.log(req.params.id);
    model.find({veterinarios: req.params.id})
        .then(function(estabelecimentos){
            res.json(estabelecimentos);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.atualiza = async function(req, res){
    const idVetCriado = [];
    const _id = req.params.id;

    const {nome, cnpj, contato, endereco, atendePlano, especialidades, status, veterinarios } = req.body;

    const estabelecimento = {
        nome: nome,
        cnpj: cnpj,
        contato: contato,
        endereco: endereco,
        atendePlano: atendePlano,
        especialidades: especialidades,
        status: status,
        veterinarios: veterinarios
    }
    const veterinariosForm = veterinarios;
     
    const newVeterinarios =  veterinariosForm || [];
    
    const oldEstabelecimento = await model.findOne({ _id });

    await Promise.all(veterinariosForm.map(async vet =>{
        if(!vet._id){
            delete vet._id;
            const estabVet = new Veterinario({...vet})
            await estabVet.save();
            vet._id = estabVet._id;
            ///estabelecimento.veterinarios.push(vet);
        }
    }));
    
    await model.findOneAndUpdate({ _id }, estabelecimento, {new: true}).then(async function(estab){
        res.json(estab);

    }, function(error){
        console.log(error);
        res.status(500).json(error);
    });

    
    /*const oldVeterinarios = oldEstabelecimento.veterinarios;
      const returnedTarget = Object.assign(oldEstabelecimento, estabelecimento);
    */
    //const newEstabelecimento = await oldEstabelecimento.save();
  
    //const added = difference(newVeterinarios, oldCategorias);
   // const removed = difference(oldCategorias, newVeterinarios);

    //await Category.updateMany({ '_id': added }, { $addToSet: { estabelecimentos: foundEstabelecimento._id } });
    //await Category.updateMany({ '_id': removed }, { $pull: { estabelecimentos: foundEstabelecimento._id } });
  
    //return res.send(estabelecimento);

    /*
    model.findByIdAndUpdate(req.params.id, estabelecimentoForm)
        .then(async function(estabelecimento){
            
            estabelecimento.veterinarios = [];


            var id = mongoose.Types.ObjectId(estabelecimento._id);
            
            console.log(veterinariosForm);

            await Veterinario.find({'estabelecimentos': id }).then(async function(vet){
                console.log("Vet" + vet); 
            })
            
            //Veterinario.update({ },{ $pull: { estabelecimentos : { $in: [estabelecimento._id]}}}, { multi: true });
                
                
            /*veterinariosForm.map(async vet =>{
                const estabVet = new Veterinario({...vet, estabelecimentos:[estabelecimento._id]})
                estabVet.save();
                estabelecimento.veterinarios.push(estabVet._id);
            })
        await estabelecimento.save();
        console.log("Estabelecimento: "+estabelecimento); 
        res.json(estabelecimento);

     }, function(error){
            console.log(error);
            res.status(500).json(error);
        }) */

         /**1 - verificar se veterinário já existe e atualizar */
    /*await estabelecimento.veterinarios.forEach(async vet => {
        Veterinario.findOne({nome: vet.nome, crmv: vet.crmv}).then(async function(isVet){
            console.log(isVet);
            if(isVet){
                console.log('Tem');
            } else{
                console.log('Nao');
                const estabVet = new Veterinario({...vet, estabelecimentos:[_id]})
                estabVet.save();
                idVetCriado.push(estabVet._id);
                console.log(idVetCriado);
            }
        });    
    }); */
    
    //console.log(idVetCriado);
   
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

function difference(A, B) {
    const arrA = Array.isArray(A) ? A.map(x => x.toString()) : [A.toString()];
    const arrB = Array.isArray(B) ? B.map(x => x.toString()) : [B.toString()];
  
    const result = [];
    for (const p of arrA) {
      if (arrB.indexOf(p) === -1) {
        result.push(p);
      }
    }
  
    return result;
  }

module.exports = api;
