module.exports = function(app) {

    var api = app.api.adestrador;
    app.route('/v1/adestrador')
        .get(api.lista)
        .post(api.adiciona);

    app.route('/v1/adestrador/cep/:cep')
        .get(api.cepToLocale);

    app.route('/v1/adestrador/locale/:search')
        .get(api.locale);

    app.route('/v1/adestrador/crmv/:crmv')
        .get(api.buscaPorRG);

    app.route('/v1/adestrador/:id')
        .get(api.buscaPorId)
        .put(api.atualiza);

    app.route('/v1/adestrador/usuario/:id')
        .get(api.buscaPorUsuario);

    app.route('/v1/adestrador/perfil/:nome/municipio/:municipio')
        .get(api.byNomeMunicipio);

    app.route('/v1/adestrador/review/:id')
        .get(api.getReview)
        .post(api.createReview);
}