module.exports = function(app) {
    const multer = require('multer');
    const multerConfig = require('../../config/multer');

    var api = app.api.upload;
    app.route('/v1/upload')
        .get(api.lista)
        .post(multer(multerConfig).single('file'), api.adiciona)

    app.route('/v1/upload/:id')
        .delete(api.remove)
}