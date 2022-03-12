mongoose = require('mongoose');
var modelUpload = mongoose.model('Upload');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util')


var api = {};

api.lista = async function(req, res) {
    await modelUpload.find({})
        .then(function(uplpads) {
            res.json(uplpads);
        }, function(error) {
            console.log(error);
            res.status(500).json(error);
        });

}

api.adiciona = async function(req, res) {
    const arquivo = { originalname: name, size, key, url = '' } = req.file;
    console.log(req.file);

    post = await modelUpload.create({
        name,
        size,
        key,
        url,
    }).then(function(upload) {
        res.json(upload);
    }, function(error) {
        console.log(error);
        res.status(500).json(error);
    });
}


api.remove = async function(req, res) {

    const arquivo = await modelUpload.findById(req.params.id);

    console.log(arquivo.key);

    await modelUpload.deleteOne({ _id: arquivo.id })
        .then(function() {
                if (process.env.STORAGE_TYPE === 'local') {
                    var pathDir = path.resolve(__dirname, '..', '..', '..', 'public', 'uploads', arquivo.key);
                    console.log(pathDir);
                    fs.unlink(pathDir, (err) => {
                        if (err) throw err;
                        console.log(pathDir);
                    })
                }
                res.sendStatus(204);

            },
            function(error) {
                console.log(error);
                res.status(500).json(error);
            })
}

module.exports = api;