const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  models.Sessions.get({ hash: req.cookies.shortlyid })
    .then(result => {
      if (result) {
        // if shortlyid exists on our sessions table
        // result returns to us an object which contains the hash
        // create {} for req.session, add hash details
        req.session = { hash: result.hash };
        if (result.user) {
          // if there is a user property in our result object,
          // this means there is an existing user, add details to req.session

          req.session.user = { username: result.user.username };
          req.session.userId = result.user.id;
        }
        next();

      } else {
        // either req.cookies.shortlyid is undefined 
        // or shortlyid does not match anything in sessions table
        // create new session and insert into sessions table 
        models.Sessions.create()
          .then(result => {
            // get hash using insertI
            models.Sessions.get({ id: result.insertId })
              .then(userData => {
                // create {} for req.session, add hash details in to pass to next middleware
                req.session = { hash: userData.hash };
                // add cookies into response to be sent back to client later
                res.cookie('shortlyid', userData.hash);
                // pass to next middleware function
                next();
              })
          })
      }
    })
};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

