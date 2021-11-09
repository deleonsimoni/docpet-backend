mongoose = require('mongoose');

var api = {};
var especialidadeModel = mongoose.model('Especialidade');
var estabelecimentoModel = mongoose.model('Estabelecimento');
var veterinarioModel = mongoose.model('Veterinario');


api.lista = function (req, res){
    especialidadeModel.find({}).sort({nome: 'asc'})
        .then(function(especialidades){
            res.json(especialidades);
        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}

api.listaTotalEspcEstab = async function(req, res){
    let ret = [];

    await especialidadeModel.find({}).sort({nome: 'asc'})
    .then(async function(especialidades){
        let totalEstab = 0;
        await Promise.all(especialidades.map(async especialidade =>{
            await veterinarioModel.find({especialidades : especialidade._id}).count().then(async function (count) {
                await estabelecimentoModel.find({especialidades : especialidade._id}).count().then(async function (countEstab) {
                    totalEstab = countEstab;
                });

                ret.push({...especialidade._doc, 'totalVet':count, 'totalEstab':totalEstab});
            });
        }));
        //ret = [{...especialidades, totalVet}];
        res.json(ret);
        console.log(ret); 
    }, function(error){
        console.log(error);
        res.status(500).json(error);
    });
}

api.listAll = async function (req, res){
    

    let retorno = [];
    let findRegex = req.query.search.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    await especialidadeModel.find({nomeFormated: { $regex: '.*' + findRegex + '.*', $options:'i' } }).select('nome nomeFormated')
        .then(async function(especialidades){

            retorno = [...retorno, ...especialidades.map(obj=> ({ ...obj._doc, type: 1 }))];

            await  veterinarioModel.find({nomeFormated: { $regex: '.*' + findRegex + '.*', $options:'i' } }).select('nome nomeFormated')
                .then(async function(veterinarios){

                    retorno = [...retorno, ...veterinarios.map(obj=> ({ ...obj._doc, type: 2 }))];

                    await   estabelecimentoModel.find({nomeFormated: { $regex: '.*' + findRegex + '.*', $options:'i' } }).select('nome nomeFormated')
                    .then(async function(estabelecimento){

                        res.json([...retorno, ...estabelecimento.map(obj=> ({ ...obj._doc, type: 3 }))]);

                    }, function(error){
                        console.log(error);
                        res.status(500).json(error);
                });


            }, function(error){
                console.log(error);
                res.status(500).json(error);
            });


        }, function(error){
            console.log(error);
            res.status(500).json(error);
        });
}


/* api.adiciona = function(req, res){
    model.create(req.body)
     .then(function(estabelecimento){
         res.json(estabelecimento);
     }, function(error){
         console.log(error);
         res.status(500).json(error);
     })
 }
*/
/*api.buscaPorId = function(req, res){
    model.findById(req.params.id)
        .then(function(foto){
            if(!foto) throw Error('Foto não encontrada');
            res.json(foto);
        }, function(error){
            console.log(error);
            res.status(404).json(error);
        })
}
api.removePorId = function(req, res){
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
