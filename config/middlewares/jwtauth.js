module.exports = function (passport) {
  return function (req, res, next) {
    passport.authenticate('jwt', function (err, user) {
      if (err || !user) return res.makeError(401, err ? err.message : 'Unable to authenticate');
      req.user = user.toObject();
      next();
    })(req, res, next);
  };
};
