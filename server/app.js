const express = require('express');
const path = require('path');
const utils = require('./lib/hashUtils');
const partials = require('express-partials');
const bodyParser = require('body-parser');
const Auth = require('./middleware/auth');
const CookieParser = require('./middleware/cookieParser')
const models = require('./models');

const app = express();

app.set('views', `${__dirname}/views`);
app.set('view engine', 'ejs');

app.use(partials());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));
// add in our own middle wares
app.use(CookieParser);
app.use(Auth.createSession);



app.get('/',
  (req, res) => {
    res.render('index');
  });

app.get('/create',
  (req, res) => {
    res.render('index');
  });

app.get('/links',
  (req, res, next) => {
    models.Links.getAll()
      .then(links => {
        res.status(200).send(links);
      })
      .error(error => {
        res.status(500).send(error);
      });
  });

app.post('/links',
  (req, res, next) => {
    var url = req.body.url;
    if (!models.Links.isValidUrl(url)) {
      // send back a 404 if link is not valid
      return res.sendStatus(404);
    }

    return models.Links.get({ url })
      .then(link => {
        if (link) {
          throw link;
        }
        return models.Links.getUrlTitle(url);
      })
      .then(title => {
        return models.Links.create({
          url: url,
          title: title,
          baseUrl: req.headers.origin
        });
      })
      .then(results => {
        return models.Links.get({ id: results.insertId });
      })
      .then(link => {
        throw link;
      })
      .error(error => {
        res.status(500).send(error);
      })
      .catch(link => {
        res.status(200).send(link);
      });
  });

/************************************************************/
// Write your authentication routes here
/************************************************************/
app.post('/signup',
  (req, res, next) => {
    var options = {
      username: req.body.username,
      password: req.body.password
    };

    return models.Users.get({ username: req.body.username })
      .then(result => {
        if (!result) {
          return models.Users.create(options); //if username does not exist, create and insert it, returns an object of insert details
        }
        // if username exists, do nothing --> returns undefined
      })
      .then(result => {
        if (result) {
          return models.Sessions.update({ hash: req.session.hash }, { userId: result.insertId })
        }
      })
      .then(result => {
        if (result) {
          res.redirect(200, '/'); // code only flows here if username is inserted (something is returned)
        } else {
          res.redirect(409, '/signup') // code flows here if undefined is returned
        }
      })
      .catch(error => console.log('error is', error));

  });

app.post('/login',
  (req, res, next) => {

    return models.Users.get({ username: req.body.username })
      .then(result => {
        if (result) {
          return models.Users.compare(req.body.password, result.password, result.salt); // if username exists, compare and return boolean
        }
        // if username does not exist, do nothing and return undefined
      })
      .then(result => {
        if (result) {
          res.redirect('/'); // if boolean is true (password is correct), redirect to correct page
        } else {
          res.redirect(403, '/login'); // if boolean  is false (password is wrong) or undefined is returned, redirect back to login page
        }
      }).catch(error => console.log('error is', error));
  });

app.get('/logout',
  (req, res, next) => {
    return models.Sessions.delete({ hash: req.session.hash })
      .then(result => {
        if (result) {
          res.clearCookie('shortlyid', req.session.hash);
          res.redirect('/');
        }
      })
      .catch(error => console.log('error logging out is', error));
  }
);


/************************************************************/
// Handle the code parameter route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/:code', (req, res, next) => {

  return models.Links.get({ code: req.params.code })
    .tap(link => {

      if (!link) {
        throw new Error('Link does not exist');
      }
      return models.Clicks.create({ linkId: link.id });
    })
    .tap(link => {
      return models.Links.update(link, { visits: link.visits + 1 });
    })
    .then(({ url }) => {
      res.redirect(url);
    })
    .error(error => {
      res.status(500).send(error);
    })
    .catch(() => {
      res.redirect('/');
    });
});

module.exports = app;
