module.exports = function(app){
    var api = app.api.auth;

    app.post('/v1/user/login', api.autentica);
    app.post('/v1/user', api.createUser);
    app.get('/v1/user/users', api.getUsers);
    app.get('/v1/user/changeAdmin/:id', api.changeAdmin);

    //app.use('/*', api.verificaToken);
}