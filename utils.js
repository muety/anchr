var config = require('./config/config');

var utils = {
  imgUrl : function (id) {
    return config.publicImageUrl + '/' + id;
  },
  shortlinkUrl : function (id) {
    return config.publicShortlinkUrl + '/' + id;
  },
  generateUUID : function (maxLen) {
    var len = maxLen || 5;
    var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      out = '';
    for(var i=0, clen=chars.length; i<len; i++){
      out += chars.substr(0|Math.random() * clen, 1);
    }
    return out;
  }
};

module.exports = utils;
