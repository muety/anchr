const morgan = require('morgan');

morgan.token('user', function(req) {
  return req.user ? req.user._id : null
})

module.exports = function () {
  return morgan(':date[iso] :method :url :user :status :res[content-length] - :response-time ms')
};
