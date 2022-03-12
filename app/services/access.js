mongoose = require('mongoose');
var Access = mongoose.model('Access');

async function markAccessProfile(role, id) {

    const access = new Access({ typeUser: role, user: id })
    access.save();

}

module.exports = {
    markAccessProfile,
}