const config = require('../config')

module.exports = function (passport) {
    return function (req, res, next) {
        passport.authenticate('jwt', { session: false }, (err, user) => {
            if (err || !user) return res.makeError(401, err ? err.message : 'Unable to authenticate')
            req.user = user.toObject()
            req.userObj = user
            next()
        })(req, res, next)
    }
}