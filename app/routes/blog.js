module.exports = function(app) {

    var api = app.api.blog;
    app.route('/v1/blogs')
        .get(api.lista)
        .post(api.adiciona);


    app.route('/v1/blogs/:speciality')
        .get(api.byEspecialidade);

    app.route('/v1/blogs/link_blog/:link_blog')
        .get(api.byTitle);

    app.route('/v1/blogs/:id')
        .get(api.buscaPorId)
        .put(api.atualiza);

    
    /*.delete(api.removePorId)
    .put(api.atualiza);*/
}