var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');
var session = require('express-session');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
app.use(cookieParser());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));



app.get('/', 
function(req, res) {
  res.render('index');
  
});

app.get('/create', 
function(req, res) {
  res.render('index');
});

app.get('/links', 
function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        Links.create({
          url: uri,
          title: title,
          base_url: req.headers.origin
        })
        .then(function(newLink) {
          res.send(200, newLink);
        });
      });
    }
  });
});

/************************************************************/
// Write your authentication routes here
/************************************************************/

app.post('/signup', 
function(req, res) {
  var uri = req.body.url;


  var data = {
    username: req.body.username,
    password: req.body.password
  }; 
   new User(data).save().then(function(model) {
    console.log('Everything is saved!');
    });


});
app.use(session({secret: 'ssshhhhh'}));
app.post('/login', 
  function(req, res) {
    var uri = req.body.url;

    var userN = req.body.username;
    var password = req.body.password;
    console.log('in login');
    new User({username: userN})
    .fetch()
    .then(function(model) {
      if(model.get('password') === password){
        console.log("I already exist!");
        /////////////ADDING SESSION//////////////
        //app.use(session({secret: 'ssshhhhh'}));
        
        req.session.name = userN;
        //res.redirect('/');






        ///////////ADDING SESSION///////////////




        ///////////////////////ADDING COOKIE HERE////////////////////////
          // check if client sent cookie
          // console.log(req.cookies);
          // var cookie = req.cookies.cookieName;
          // if (cookie === undefined)
          // {
          //   // no: set a new cookie
          //   var randomNumber=Math.random().toString();
          //   randomNumber=randomNumber.substring(2,randomNumber.length);
          //   res.cookie('cookieName','1234', { maxAge: 900000, httpOnly: true });
          //   console.log('res.cookie after assign');
          //   console.log('cookie created successfully');
          // } 
          // else
          // {
          //   // yes, cookie was already present 
          //   console.log('cookie exists', cookie);
          // } 
          // // //next(); // <-- important!
      //////////////////////////END OF ADDING COOKIE///////////////////
      } else {
        console.log("sign up first");
      //redirect to signup page
    }
  });

   


});

/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        link.set('visits', link.get('visits')+1);
        link.save().then(function() {
          return res.redirect(link.get('url'));
        });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);
