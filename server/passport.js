//Passport.js configuration
module.exports = function ( passport, Manager ) {

  var LocalStrategy = require('passport-local').Strategy;

  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.deserializeUser(function(obj, done) {
    done(null, obj);
  });

  passport.use(
    new LocalStrategy({ usernameField: 'login' }, function(login, password, done) {
      Manager.findOneUser( { 'login': login }, function(err, user) {
        if (err) return done(err);
        if (!user) return done(null, false);

        if(user.password === password) {
          delete(user._id);
          delete(user.password);
          return done(null, user);
        }
        else {
          return done(null, false);
        }
      });
    })
  );
};
