require('dotenv').config();
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const aws = require('aws-sdk');
const multerS3 = require('multer-s3');


const storageTypes = {
    local: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, path.resolve(__dirname, '..', '..', 'public', 'uploads'))
        },
        filename: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            });
        },

    }),
    s3: multerS3({
        s3: new aws.S3(),
        bucket: 'vetzco-img',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        //acl: 'public-read',
        key: (req, file, cb) => {
            crypto.randomBytes(16, (err, hash) => {
                if (err) cb(err);

                file.key = `${hash.toString('hex')}-${file.originalname}`;

                cb(null, file.key);
            });
        }

    }),
}
module.exports = {
    //Será usado caso o destination não for configurado.
    //dest: path.resolve(__dirname, '..', '..', 'public', 'uploads'),
    storage: storageTypes[process.env.STORAGE_TYPE],
    limits: {
        // o tamanho é em bytes. 
        fileSize: 2 * 1024 * 1024,
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = [
            'image/jpg',
            'image/jpeg',
            'image/pjpeg',
            'image/png',
            'image/gif'
        ];
        if (allowedMimes.indexOf(file.mimetype) - 1) {
            cb(new Error("Tipo de Arquivo inválido"));
        }
        cb(null, true);
    },
}