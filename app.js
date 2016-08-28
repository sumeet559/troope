var express           =     require('express')
  , passport          =     require('passport')
  , util              =     require('util')
  , FacebookStrategy  =     require('passport-facebook').Strategy
  , session           =     require('express-session')
  , cookieParser      =     require('cookie-parser')
  , bodyParser        =     require('body-parser')
  , config            =     require('./configuration/config')
  , MongoClient       =     require('mongodb').MongoClient
  , app               =     express();

// Passport session setup.
passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
  done(null, obj);
});

passport.use('facebook',new FacebookStrategy({
    clientID: config.facebook_api_key,
    clientSecret:config.facebook_api_secret ,
    callbackURL: config.callback_url
  },
  function(accessToken, refreshToken, profile, done) {
    var user_data={
                    "user_id":profile.id,
                    "username":profile.displayName,
                    "data":{}
                  };
    if(config.use_database==='true')
      {
        MongoClient.connect(config.mongo_url, function(err, db) {
        db.collection('troope_users').find({
          "user_id": profile.id
        },function(err,result){
          if(err) throw err;
          console.log("hereteyee>>>>>>",result);
              if(!result.username)
                {
                  console.log("There is no such user, adding now");
                  
                  db.collection('troope_users').insertOne(user_data,function(err,result){
                    if(err) throw err;
                  });
                }
                else {
                  user_data.data=result.data;
                  console.log("User Already Exists");
                }
            });
            db.close();
        });
      }

    return done(null, user_data); // the user object we just made gets passed to the route's controller as `req.user`
  }
));


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(session({ secret: 'keyboard cat', key: 'sid'}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'));

app.get('/', function(req, res){
  res.render('index', { user: req.user });
});

app.get('/account', ensureAuthenticated, function(req, res){
  res.render('account', { user: req.user });
});

app.get('/auth/facebook', passport.authenticate('facebook',{scope:'email'}));


app.get('/auth/facebook/callback',
  passport.authenticate('facebook', { successRedirect : '/', failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
  });

app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});


function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login')
}

app.listen(3000);



