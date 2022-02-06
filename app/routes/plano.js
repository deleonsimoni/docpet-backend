module.exports = function(app) {

    var api = app.api.plano;

    app.route('/v1/planos')
        .get(api.lista)
        .post(api.adicionaPlano)

    app.route('/v1/planos/:id')
        .put(api.atualizaPlano)
        .delete(api.removePlanoId)
        .get(api.buscaPorId);





}