const parseCookies = (req, res, next) => {

  if (!res.cookies) {
    res.cookies = {};
  }

  if (!req.cookies) {
    req.cookies = {};
  }

  if (req.headers.cookie) {
    var cookies = req.headers.cookie.split('; ');
    for (var cookie of cookies) {
      console.log('req cookies??', req.cookies);
      var data = cookie.split('=');
      req.cookies[data[0]] = data[1];
    }
  } 
  next();
};

module.exports = parseCookies;


