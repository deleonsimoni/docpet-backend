mongoose = require('mongoose');

var api = {};
var especialidadeModel = mongoose.model('Especialidade');
var estabelecimentoModel = mongoose.model('Estabelecimento');
var veterinarioModel = mongoose.model('Veterinario');
var userModel = mongoose.model('Usuario');
var parametersModel = mongoose.model('Parameters');

var accessModel = mongoose.model('Access');

api.dasboardAdmin = async function(req, res) {

    if (!req.user.isAdmin) {
        res.status(401).json({ error: "Não autorizado" });
        return
    }

    let counts = {};
    try {

        counts.totalVets = await veterinarioModel.count({});
        counts.totalClinics = await estabelecimentoModel.count({});
        counts.totalUsers = await userModel.count({ role: 0 });
        counts.totalAccess = await parametersModel.findOne({ access: { $ne: null } });

        counts.totalLogins = await accessModel.find().select('-_id');

        res.status(200).json({ counts: counts });

    } catch (err) {
        console.log('Erro não esperado ao salvar usuário ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
}

api.markAccess = async function(req, res) {

    try {
        let accessdb = await parametersModel.findOneAndUpdate({ access: { $ne: null } }, { $inc: { 'access': 1 } });
        if (!accessdb) {
            const paramDB = new parametersModel({ access: 1 })
            await paramDB.save();
        }

        res.sendStatus(200);

    } catch (err) {
        console.log('Erro não esperado ao salvar usuário ' + err);
        res.status(400).json({ error: "Ocorreu erro não esperado " + err });
    }
}


module.exports = api;