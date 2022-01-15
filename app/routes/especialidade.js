module.exports= function(app){
    
    var api = app.api.especialidade;

    app.route('/v1/especialidades')
    .get(api.lista)
    .post(api.adicionaEspecialidade)


    app.route('/v1/especialidades/:id')
    .put(api.atualizaEspecialidade)
    .delete(api.removeEspecialidadePorId)
    .get(api.buscaPorId);

    
    app.route('/v1/especialidades-total')
    .get(api.listaTotalEspcEstab);
    
    app.route('/v1/especialidades-search')
    .get(api.listAll);
   // .post(api.adiciona);

   /* app.route('/v1/fotos/:id')
    .get(api.buscaPorId)
    .delete(api.removePorId)
    .put(api.atualiza); */
}
