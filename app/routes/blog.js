module.exports = function(app) {

    var api = app.api.blog;
    app.route('/v1/blogs')
        .get(api.lista)
        .post(api.adiciona);


    app.route('/v1/blogs/especialidade/:especialidade')
        .get(api.byEspecialidade);

    app.route('/v1/blogs/link/:linkblog')
        .get(api.byTitle);

    app.route('/v1/blogs/:id')
        .get(api.buscaPorId)
        .put(api.atualiza);

    
    /*.delete(api.removePorId)
    .put(api.atualiza);*/
}