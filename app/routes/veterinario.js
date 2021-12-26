module.exports= function(app){
    
    var api = app.api.veterinario;
    app.route('/v1/veterinarios')
    .get(api.lista)
    .post(api.adiciona);

    app.route('/v1/veterinarios/cep/:cep')
    .get(api.cepToLocale);

    app.route('/v1/veterinarios/locale/:search')
    .get(api.locale);

    app.route('/v1/veterinarios/crmv/:crmv')
    .get(api.buscaPorCRMV);
    
    app.route('/v1/veterinarios/especialidades/:id')
    .get(api.byEspecialidade);

    app.route('/v1/veterinarios/especialidades/:id/municipio/:municipio')
    .get(api.byEspecialidadeMunicipio);


    app.route('/v1/veterinarios/perfil/:nomeFormated')
    .get(api.byName);

    app.route('/v1/veterinarios/:id')
    .get(api.buscaPorId)
    .put(api.atualiza);

    app.route('/v1/veterinarios/usuario/:id')
    .get(api.buscaPorUsuario);

    app.route('/v1/veterinarios/review/:id')
    .get(api.getReview)
    .post(api.createReview);
    /*.delete(api.removePorId)
    .put(api.atualiza);*/
}
