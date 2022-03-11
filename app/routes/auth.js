const passport = require("passport");

module.exports = function (app) {
    var api = app.api.auth;

    app.post('/v1/user/login', api.autentica);
    app.post('/v1/user', api.createUser);
    app.post('/v1/user/changePassword', api.changePassword);
    app.post('/v1/user/updatePassword/:token', api.updatePassword);

    app.get('/v1/user/users', passport.authenticate("jwt", {
        session: false,
    }), api.getUsers);
    app.get('/v1/user/changeAdmin/:id', passport.authenticate("jwt", {
        session: false,
    }), api.changeAdmin);

    //app.use('/*', api.verificaToken);
}