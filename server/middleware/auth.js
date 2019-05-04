const models = require('../models');
const Promise = require('bluebird');

module.exports.createSession = (req, res, next) => {

  if (req.cookies.shortlyid) {
    // if shortlyid is defined on req.cookies
    models.Sessions.get({ hash: req.cookies.shortlyid })
      .then(result => {
        if (result) {
          req.session.hash = req.cookies.shortlyid;
        }
      })
  }


  //check if shortlyid is defined on req.cookies
  //if defined,
  // look up user data related to that session
  // if valid, assign object to req.session
  // if user data is not available .... ?  

  //if no cookies, initialize new Session 
  //by calling models.Sessions.create(), have it stored in sessions db
  //set new cookies object on response headers 



};

/************************************************************/
// Add additional authentication middleware functions below
/************************************************************/

