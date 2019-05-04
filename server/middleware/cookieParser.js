const parseCookies = (req, res, next) => {

  if (req.headers.cookie) {
    var cookies = req.headers.cookie.split('; ');
    for (var cookie of cookies) {
      var data = cookie.split('=');
      req.cookies[data[0]] = data[1];
    }
    next();
  } else {
    next();
  }
};

module.exports = parseCookies;


