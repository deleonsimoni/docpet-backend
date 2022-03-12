const passport = require("passport");

module.exports = function (app) {

    var api = app.api.dashboard;

    app.route('/v1/dashboard/dashboardAdmin')
        .get(passport.authenticate("jwt", {
            session: false,
        }), api.dasboardAdmin);

    app.route('/v1/dashboard/markAccess')
        .get(api.markAccess);


}
