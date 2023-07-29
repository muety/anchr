const LocalStrategy = require('passport-local').Strategy
    , JwtStrategy = require('passport-jwt').Strategy
    , FacebookStrategy = require('passport-facebook').Strategy
    , GoogleStrategy = require('passport-google-oauth').OAuth2Strategy
    , BasicStrategy = require('passport-http').BasicStrategy
    , ExtractJwt = require('passport-jwt').ExtractJwt
    , User = require('../app/models/user')
    , config = require('./config')
    , authConfig = require('./auth')
    , log = require('./log')()

function postUserLogin(user) {
    user.updateOne({ lastLoggedIn: new Date() })
        .then(() => { })
        .catch(console.error)
}

module.exports = function (passport) {

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id)
            .then(user => done(null, user))
            .catch(err => done(err, null))
    })

    // =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    passport.use('local-signup', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        ((req, email, password, done) => {
            process.nextTick(() => {
                User.findOne({ 'local.email': email })
                    .then(user => {
                        if (user) return done({ message: 'User already existing.' })
                        else {
                            const newUser = new User({ created: Date.now() })
                            newUser.local.email = email
                            newUser.local.password = newUser.generateHash(password)
                            return newUser.save().then(() => done(null, newUser))  // TODO: handle error?
                        }
                    })
                    .catch(done)
            })
        })))

    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    passport.use('local-login', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password',
        passReqToCallback: true
    },
        ((req, email, password, done) => {
            User.findOne({ 'local.email': email })
                .then(user => {
                    if (!user) return done({ message: 'User not found.' })
                    // if token is still present, user is not yet activated
                    if (config.verifyUsers && user.verificationToken) return done({ message: 'User not active.' })

                    if (!user.validPassword(password)) return done({ message: 'Wrong password.' })

                    postUserLogin(user)  // async, don't wait
                    done(null, user)
                })
                .catch(done)
        })))

    // =========================================================================
    // JWT AUTH ================================================================
    // =========================================================================
    const opts = {
        secretOrKey: config.secret,
        jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer')
    }
    passport.use(new JwtStrategy(opts, ((jwt_payload, done) => {
        const strategy = jwt_payload.strategy
        const query = {}
        query[`${strategy}.email`] = jwt_payload[strategy].email

        User.findOne(query)
            .then(user => {
                if (!user) return done({ message: 'Unable to authenticate.' })
                postUserLogin(user)  // async, don't wait
                done(null, user)
            })
            .catch(err => done(err, false))
    })))

    // =========================================================================
    // BASIC AUTH ==============================================================
    // =========================================================================
    if (config.basicAuth) {
        passport.use(new BasicStrategy((username, password, done) => {
            const query = { 'local.email': username }
            User.findOne(query)
                .then(user => {
                    if (!user) return done({ message: 'User not found.' })
                    password = (password || '').trim()
                    if (!user.validPassword(password)) return done({ message: 'Wrong password.' })

                    postUserLogin(user)  // async, don't wait
                    done(null, user)
                })
                .catch(done)
        }))
    }

    // =========================================================================
    // FACEBOOK  ===============================================================
    // =========================================================================

    if (authConfig.with('facebookAuth')) {
        passport.use(new FacebookStrategy({
            clientID: authConfig.facebookAuth.clientID,
            clientSecret: authConfig.facebookAuth.clientSecret,
            callbackURL: authConfig.facebookAuth.callbackURL,
            profileFields: ['id', 'emails', 'name']
        },

            ((token, refreshToken, profile, done) => {

                process.nextTick(() => {
                    User.findOne({ 'facebook.id': profile.id })
                        .then(user => {
                            if (user) {
                                postUserLogin(user)  // async, don't wait
                                done(null, user)
                            }
                            else {
                                const newUser = new User({
                                    created: Date.now()
                                })

                                newUser.facebook.id = profile.id
                                newUser.facebook.token = token
                                newUser.facebook.name = profile.displayName
                                newUser.facebook.email = profile.emails[0].value

                                newUser.save().then(() => done(null, newUser))  // TODO: handle error?
                            }
                        })
                })
            }))
        )
    } else {
        log.default('[WARN] Disabling Facebook OAuth as "ANCHR_FB_*" config variables are missing.')
    }

    // =========================================================================
    // GOOGLE ==================================================================
    // =========================================================================
    if (authConfig.with('googleAuth')) {
        passport.use(new GoogleStrategy({
            clientID: authConfig.googleAuth.clientID,
            clientSecret: authConfig.googleAuth.clientSecret,
            callbackURL: authConfig.googleAuth.callbackURL
        },
            ((token, refreshToken, profile, done) => {
                process.nextTick(() => {
                    User.findOne({ 'google.id': profile.id })
                        .then(user => {
                            if (user) {
                                postUserLogin(user)  // async, don't wait
                                return done(null, user)
                            }
                            else {
                                const newUser = new User({
                                    created: Date.now()
                                })

                                newUser.google.id = profile.id
                                newUser.google.token = token
                                newUser.google.name = profile.displayName
                                newUser.google.email = profile.emails[0].value

                                newUser.save().then(() => done(null, newUser))  // TODO: handle error?
                            }
                        })
                        .catch(done)
                })
            }))
        )
    } else {
        log.default('[WARN] Disabling Google OAuth as "ANCHR_GOOGLE_*" config variables are missing.')
    }
}