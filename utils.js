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
  },
  isURL : function (url) {
    return !!url.match(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/);
  }
};

module.exports = utils;
