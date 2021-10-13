module.exports= function(app){
    
    var api = app.api.estabelecimento;
    app.route('/v1/estabelecimentos')
    .get(api.lista)
    .post(api.adiciona);

    app.route('/v1/estabelecimentos/cnpj/:cnpj')
    .get(api.buscaPorCNPJ);
    app.route('/v1/estabelecimentos/veterinario/:id')
    .get(api.buscarPorVeterinario);

    app.route('/v1/estabelecimentos/:id')
    .get(api.buscaPorId)
    .put(api.atualiza);
    /*.delete(api.removePorId)
    .put(api.atualiza); */
}
