const express = require('express');
const compression = require('compression');
const session = require('express-session');
const bodyParser = require('body-parser');
const logger = require('morgan');
const errorHandler = require('errorhandler');
const lusca = require('lusca');
const dotenv = require('dotenv');
const MongoStore = require('connect-mongo')(session);
const flash = require('express-flash');
const path = require('path');
const mongoose = require('mongoose');
const passport = require('passport');
const expressValidator = require('express-validator');
const sass = require('node-sass-middleware');
const multer = require('multer');
const upload = multer({ dest: path.join(__dirname, 'uploads') });
dotenv.load({ path: '.env.example' });
const homeController = require('./controllers/home');
const userController = require('./controllers/user');
const evaluaController = require('./controllers/evalua');
const contactController = require('./controllers/contact');
const passportConfig = require('./config/passport');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
mongoose.connect(process.env.MONGODB_URI || process.env.MONGOLAB_URI);
mongoose.connection.on('error', () => {
  console.error('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(compression());
app.use(sass({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public')
}));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(expressValidator());
app.use(session({
  resave: true,
  saveUninitialized: true,
  secret: process.env.SESSION_SECRET,
  store: new MongoStore({
    url: process.env.MONGODB_URI || process.env.MONGOLAB_URI,
    autoReconnect: true
  })
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
  if (req.path === '/api/upload') {
    next();
  } else {
    lusca.csrf()(req, res, next);
  }
});
app.use(lusca.xframe('SAMEORIGIN'));
app.use(lusca.xssProtection(true));
app.use((req, res, next) => {
  res.locals.user = req.user;
  next();
});
app.use(function(req, res, next) {
  if (!req.user &&
      req.path !== '/login' &&
      req.path !== '/signup' &&
      !req.path.match(/^\/auth/) &&
      !req.path.match(/\./)) {
    req.session.returnTo = req.path;
  }
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { maxAge: 31557600000 }));
app.get('/', homeController.index);
app.get('/login', userController.getLogin);
app.post('/login', userController.postLogin);
app.get('/logout', userController.logout);
app.get('/forgot', userController.getForgot);
app.post('/forgot', userController.postForgot);
app.get('/reset/:token', userController.getReset);
app.post('/reset/:token', userController.postReset);
app.get('/signup', userController.getSignup);
app.post('/signup', userController.postSignup);
app.get('/contact', contactController.getContact);
app.post('/contact', contactController.postContact);
app.get('/subjects', passportConfig.isAuthenticated, userController.getAccount);
app.get('/profile', passportConfig.isAuthenticated, userController.getAccountProfile);
app.post('/account/profile', passportConfig.isAuthenticated, userController.postUpdateProfile);
app.get('/reset', passportConfig.isAuthenticated, userController.getAccountPassword );
app.post('/account/password', passportConfig.isAuthenticated, userController.postUpdatePassword);
app.get('/student', evaluaController.getAccountStudent);
app.get('/report', passportConfig.isAuthenticated, evaluaController.getResult);
app.post('/registry', evaluaController.postAccountStudent);
app.get('/:id', passportConfig.isAuthenticated, evaluaController.getEvaluation);
app.post('/:id', passportConfig.isAuthenticated, evaluaController.postUpdateEvaluation);

app.post('/account/delete', passportConfig.isAuthenticated, userController.postDeleteAccount);
//app.get('/account/unlink/:provider', passportConfig.isAuthenticated, userController.getOauthUnlink);
app.use(errorHandler());

connections = [];
io.on('connection', function(socket) {
  connections.push(socket);
  console.log('Connected: %s ', connections.length);
  socket.on('disconnect', function(data){
    connections.splice(connections.indexOf(socket), 1)
    console.log('Disconnected: %s socket', connections.length); 
  });

});
server.listen(app.get('port'), () => {
  console.log('Express server listening on port %d in %s mode', app.get('port'), app.get('env'));
});

module.exports = app;
