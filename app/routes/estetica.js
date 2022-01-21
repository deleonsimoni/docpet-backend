module.exports = function(app) {

    var api = app.api.estetica;
    app.route('/v1/estetica')
        .get(api.lista)
        .post(api.adiciona);

    app.route('/v1/estetica/cep/:cep')
        .get(api.cepToLocale);

    app.route('/v1/estetica/locale/:search')
        .get(api.locale);

    app.route('/v1/estetica/crmv/:crmv')
        .get(api.buscaPorRG);

    app.route('/v1/estetica/:id')
        .get(api.buscaPorId)
        .put(api.atualiza);

    app.route('/v1/estetica/usuario/:id')
        .get(api.buscaPorUsuario);

    app.route('/v1/estetica/perfil/:nome/municipio/:municipio')
        .get(api.byNomeMunicipio);

    app.route('/v1/estetica/review/:id')
        .get(api.getReview)
        .post(api.createReview);



}