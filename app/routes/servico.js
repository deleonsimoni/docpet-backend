module.exports= function(app){
    
    var api = app.api.servico;

    app.route('/v1/servicos')
    .get(api.lista)
    .post(api.adicionaServico)

    app.route('/v1/servicos/:id')
    .put(api.atualizaServico)
    .delete(api.removeServicoId)
    .get(api.buscaPorId);


    
 
   
}
