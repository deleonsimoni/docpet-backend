const passport = require("passport");

module.exports = function (app) {

    var api = app.api.perguntas;

    app.route('/v1/perguntas')
        .get(api.listarPerguntas)
        .post(api.adicionarPerguntas)

    app.route('/v1/perguntas/dashboard')
        .get(api.dashboardPerguntas)

    app.route('/v1/perguntas/admin')
        .get(passport.authenticate("jwt", {
            session: false,
        }), api.listarPerguntasAdmin)

    app.route('/v1/perguntas/responder')
        .get(passport.authenticate("jwt", {
            session: false,
        }), api.listarPerguntasResponder)

    app.route('/v1/perguntas/:id/detalhe')
        .get(api.listaDetalhePergunta)
        .put(passport.authenticate("jwt", {
            session: false,
        }), api.alterarPergunta)

    app.route('/v1/perguntas/:id/validar')
        .put(passport.authenticate("jwt", {
            session: false,
        }), api.validarPergunta)

    app.route('/v1/perguntas/:id/responder')
        .put(passport.authenticate("jwt", {
            session: false,
        }), api.responder)

    app.route('/v1/perguntas/:id/changeEspecialidade')
        .put(passport.authenticate("jwt", {
            session: false,
        }), api.changeEspecialidade)

}
