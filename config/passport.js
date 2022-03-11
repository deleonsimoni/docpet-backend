const passport = require('passport');
const LocalStrategy = require('passport-local');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
mongoose = require('mongoose');

const User = require('../app/models/usuario');

const localLogin = new LocalStrategy({
    usernameField: 'email'
}, async (email, password, done) => {
    email = email.trim();
    let user = await User.findOne({ email });
    if (!user || !bcrypt.compareSync(password, user.hashedPassword)) {
        return done(null, false, { error: 'Your login details could not be verified. Please try again.' });
    }
    user = user.toObject();
    delete user.hashedPassword;
    done(null, user);
});

const jwtLogin = new JwtStrategy({
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: 'nosamamosanimais'
}, async (payload, done) => {

    let user = await User.findById(payload.id);
    if (!user) {
        return done(null, false);
    }
    user = user.toObject();
    delete user.hashedPassword;
    done(null, user);
});


passport.use(jwtLogin);
passport.use(localLogin);


module.exports = passport;
