module.exports= function(app){
    
    var api = app.api.veterinario;
    app.route('/v1/veterinarios')
    .get(api.lista)
    .post(api.adiciona);

    app.route('/v1/veterinarios/crmv/:crmv')
    .get(api.buscaPorCRMV);
    
    app.route('/v1/veterinarios/especialidades/:id')
    .get(api.byEspecialidade);

    app.route('/v1/veterinarios/:id')
    .get(api.buscaPorId)
    .put(api.atualiza);
    /*.delete(api.removePorId)
    .put(api.atualiza);*/
}
