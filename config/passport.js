var LocalStrategy = require('passport-local').Strategy
    , JwtStrategy = require('passport-jwt').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , ExtractJwt = require('passport-jwt').ExtractJwt
    , User = require('../app/models/user')
    , config = require('./config')
    , authConfig = require('./auth');

module.exports = function(passport) {

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });

  // =========================================================================
  // LOCAL SIGNUP ============================================================
  // =========================================================================
  passport.use('local-signup', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      },
      function(req, email, password, done) {
        process.nextTick(function() {
          User.findOne({ 'local.email' :  email }, function(err, user) {
            if (err) return done(err);

            if (user) return done({message : 'User already existing.'});

            else {
              var newUser = new User({
                created: Date.now()
              });

              newUser.local.email    = email;
              newUser.local.password = newUser.generateHash(password);

              newUser.save(function(err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }
          });
        });
      }));

  // =========================================================================
  // LOCAL LOGIN =============================================================
  // =========================================================================
  passport.use('local-login', new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true
      },
      function(req, email, password, done) {
        User.findOne({ 'local.email' :  email }, function(err, user) {
          if (err) return done(err);

          if (!user) return done({message : 'User not found.'});

          if (!user.validPassword(password)) return done({message : 'Wrong password.'});

          return done(null, user);
        });

      }));

  // =========================================================================
  // JWT AUTH ================================================================
  // =========================================================================
  var opts = {
    secretOrKey : config.secret,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
  };
  passport.use(new JwtStrategy(opts, function(jwt_payload, done) {
    var strategy = jwt_payload.strategy
        , query = {};
    query[strategy + '.email'] = jwt_payload[strategy].email;

    User.findOne(query, function(err, user) {
      if (err || !user) return done(err || {message : 'Unable to authenticate.'}, false);
      switch (strategy) {
        case 'facebook':
          if (!user.validFacebook(jwt_payload[strategy].token)) return done({message : 'Wrong facebook token.'}, false);
          break;
        default:
          if (!user.validHash(jwt_payload[strategy].password)) return done({message : 'Wrong password.'}, false);
      }
      done (null, user);
    });
  }));

  // =========================================================================
  // FACEBOOK  ===============================================================
  // =========================================================================
  passport.use(new FacebookStrategy({
        clientID        : authConfig.facebookAuth.clientID,
        clientSecret    : authConfig.facebookAuth.clientSecret,
        callbackURL     : authConfig.facebookAuth.callbackURL,
        profileFields   : ['id', 'emails', 'name']
      },

      function(token, refreshToken, profile, done) {

        process.nextTick(function() {
          User.findOne({ 'facebook.id' : profile.id }, function(err, user) {
            if (err) return done(err);
            if (user) return done(null, user);
            else {
              var newUser = new User({
                created: Date.now()
              });

              newUser.facebook.id    = profile.id;
              newUser.facebook.token = token;
              newUser.facebook.name  = profile.displayName;
              newUser.facebook.email = profile.emails[0].value;

              newUser.save(function(err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }

          });
        });
      }));

  // =========================================================================
  // GOOGLE ==================================================================
  // =========================================================================
  passport.use(new GoogleStrategy({
        clientID        : authConfig.googleAuth.clientID,
        clientSecret    : authConfig.googleAuth.clientSecret,
        callbackURL     : authConfig.googleAuth.callbackURL
      },
      function(token, refreshToken, profile, done) {
        process.nextTick(function() {
          User.findOne({ 'google.id' : profile.id }, function(err, user) {
            if (err) return done(err);

            if (user) return done(null, user);
            else {
              var newUser = new User({
                created: Date.now()
              });

              newUser.google.id    = profile.id;
              newUser.google.token = token;
              newUser.google.name  = profile.displayName;
              newUser.google.email = profile.emails[0].value;

              newUser.save(function(err) {
                if (err) throw err;
                return done(null, newUser);
              });
            }
          });
        });
      }));
};
