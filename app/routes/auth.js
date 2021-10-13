module.exports = function(app){
    var api = app.api.auth;

    app.post('/autentica', api.autentica);
    //app.use('/*', api.verificaToken);
}