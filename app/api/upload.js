require('dotenv').config();
mongoose = require('mongoose');
var modelUpload = mongoose.model('Upload');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const aws = require('aws-sdk');
const s3 = new aws.S3();


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
    const arquivo = { originalname: name, size, key, location: url = '' } = req.file;

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
                } else if (process.env.STORAGE_TYPE === 's3') {
                    return s3.deleteObject({
                        bucket: 'vetzco-img',
                        key: arquivo.key,
                    }).promise();
                }
                res.sendStatus(204);
            },
            function(error) {
                console.log(error);
                res.status(500).json(error);
            })
}

module.exports = api;