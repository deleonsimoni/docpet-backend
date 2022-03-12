const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
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