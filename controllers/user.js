const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const User = require('../models/User');
const Archive = require('../models/Oficios');

/**
 * Login page.
 */
exports.getLogin = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/login', {
    title: 'Login access'
  });
};
/**
 * Sign in using email and password.
 */
exports.postLogin = (req, res, next) => {
  req.assert('password', 'Contraseña vacia').notEmpty();
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/login');
  }
  passport.authenticate('local', (err, user, info) => {
    if (err) { return next(err); }
    if (!user) {
      req.flash('errors', info);
      return res.redirect('/login');
    }
    req.logIn(user, (err) => {
      if (err) { return next(err); }
        res.redirect('/subjects');
    });
  })(req, res, next);
};

/**
 * Log out.
 */
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

/**
 * Signup page.
 */
exports.getSignup = (req, res) => {
  if (req.user) {
    return res.redirect('/');
  }
  res.render('account/signup', {
    title: 'Create Account sss'
  });
};
exports.postSignup = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long').len(4);
  req.assert('confirmPassword', 'Passwords do not match').equals(req.body.password);
  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/signup');
  }

  const user = new User({
    email: req.body.email,
    password: req.body.password
  });

  User.findOne({ email: req.body.email }, (err, existingUser) => {
    if (existingUser) {
      req.flash('errors', { msg: 'Account with that email address already exists.' });
      return res.redirect('/signup');
    }
    user.save((err) => {
      if (err) { return next(err); }
      req.logIn(user, (err) => {
        if (err) {
          return next(err);
        }
        res.redirect('/');
      });
    });
  });
};

/**
 * GET /account
 * Profile page.
 */
exports.getAccount = (req, res, next) => {
  var i;
  var student = 0;
  const mail = req.user.email; //filtra por  el nombre de usuario
  const rol = req.user.rol;
    switch (rol){
      case 'ESTUDIANTE':
      case 'DOCENTE':
        break;
      default:
        next();
    }
  if (rol == 'admin'){
    User.find((err, allArchive) => {
        var student = 0;
        var studentEvalua = 0;
        var teacherEvalua = 0;
        
      if (allArchive) {

        for (i=0; i < allArchive.length; ++i)
          if (allArchive[i].rol == 'ESTUDIANTE'){ 
            student++;
          }

        for (i=0; i < allArchive.length; ++i)
          if (allArchive[i].modevalua == 'true' && allArchive[i].rol == 'ESTUDIANTE'){ 
            studentEvalua++;
          }

         for (i=0; i < allArchive.length; ++i)
          if (allArchive[i].modevalua == 'true' && allArchive[i].rol == 'DOCENTE'){ 
            teacherEvalua++;
          }
          console.log('Alumnos Evaluados   :' + studentEvalua);
        return res.render('evaluation/admin', {
          title: 'Dashboard',
          allArchive, studentEvalua, student, teacherEvalua
        });  
      }
      if (err){
        req.flash('success', { msg: 'No existe ningúna relación :(' });
          return res.render('evaluation/profile',{
            title: 'Correspondencia'
          });
      }
    });
  }else{
    Archive.find({ email: mail}, (err, myArchive) => {
      if (myArchive) {

        for (i=0; i < myArchive.length; ++i)
          if (myArchive[i].status == 'True'){ 
            student++;
          }
        if (myArchive.length == student){
          User.findById(req.user.id, (err, user) => {
            if(!user.modevalua){
              if (err) { return next(err); }
              user.modevalua = 'true' || '';
              user.save((err) => {
                if (err) {
                  if (err.code === 11000) {
                    req.flash('errors', { msg: 'No se pudo acceder a la petición' });
                    return res.redirect('/account');
                  }
                  return next(err);
                }
                req.flash('success', { msg: 'Proceso completo' });
                return res.render('evaluation/confirma', {
                  title: 'Evaluación completada'
                });
              });
            }else{
              return res.render('evaluation/confirma', {
                title: 'Evaluación completada'
              });
            }
          });
        }else{
          return res.render('evaluation/archive', {
            title: 'Registro de materias', myArchive, student
          });
        }   
      }
      if (err){
        req.flash('success', { msg: 'No existe ningúna relación :(' });
          return res.render('/',{
            title: 'Evalua'
          });
      }
    }).sort({codigo:1});
  }
};

/**
 * Carga materias por estudiantes
 */
exports.getAccountProfile = (req, res) => {
  res.render('account/profile', {
    title: 'Datos personales'
  });
};
exports.postUpdateProfile = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }

  /**
   * Update profile user
   */
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    //user.email = req.body.email || '';
    user.usuario = req.body.name || '';
    //user.profile.gender = req.body.gender || '';
   // user.profile.location = req.body.location || '';
    //user.profile.website = req.body.website || '';
    user.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      req.flash('success', { msg: 'Datos personales actualizados' });
      res.redirect('/profile');
    });
  });
};


/* Carga test por materia seleccionada ******************************************************************************* */
exports.getEvaluation = (req, res, next) => {
  var mail = req.user.email; //filtra por  el nombre de usuario
  Archive.findById(req.params.id, (err, mySubject) => {
    if (mySubject) {
        //req.flash('success', { msg: 'Alumno habilitado' });
        return res.render('account/test', {
          title: 'Indicadores',
          mySubject
        });
    }
  });
};
exports.postUpdateEvaluation = (req, res, next) => {
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account');
  }
  Archive.findById(req.params.id, (err, test) => {
    if (err) { return next(err); }
    test.item01 = req.body.item01 || '';
    test.item02 = req.body.item02 || '';
    test.status = 'True' || '';
    //user.profile.gender = req.body.gender || '';
    test.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'The email address you have entered is already associated with an account.' });
          return res.redirect('/account');
        }
        return next(err);
      }
      //req.flash('success', { msg: 'Evaluación con Exito.' });
      res.redirect('/account');
    });
  });
};

/* Carga materias por estudiante ******************************************************************************* */
exports.getAccountStudent = (req, res) => {
  res.render('evaluation/student', {
    title: 'Materias por alumno'
  });
};
exports.postAccountStudent = (req, res, next) => {
  var mail = req.body.email; //filtra por  el nombre de usuario
  const errors = req.validationErrors();
  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/account/student');
  }
    Archive.find({ email: mail}, (err, mySearch) => {
      if (mySearch) {
          //req.flash('success', { msg: 'Alumno habilitado' });
        return res.render('account/student_det', {
          title: 'Registro de Materias',
          mySearch
        });
        console.log(mySearch); 
      }
      if (err){
        req.flash('success', { msg: 'No existe ningúna relación :(' });
          return res.render('account/profile',{
            title: 'Correspondencia'
          });
      }
    }).sort({codigo:1});
};

/**
 * Update current password.
 */
exports.getAccountPassword = (req, res) => {
  res.render('account/pass', {
    title: 'Cambio clave'
  });
};

exports.postUpdatePassword = (req, res, next) => {
  req.assert('password', 'La contraseña debe tener un mínimo de 4 caracteres').len(4);
  req.assert('confirmPassword', 'Las contraseñas no coinciden!').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/reset');
  }

  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user.password = req.body.password;
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('success', { msg: 'Cambio exitoso de contraseña' });
      res.redirect('/subjects');
    });
  });
};

/**
 * POST /account/delete
 * Delete user account.
 */
exports.postDeleteAccount = (req, res, next) => {
  User.remove({ _id: req.user.id }, (err) => {
    if (err) { return next(err); }
    req.logout();
    req.flash('info', { msg: 'Your account has been deleted.' });
    res.redirect('/');
  });
};

/**
 * GET /account/unlink/:provider
 * Unlink OAuth provider.
 */
exports.getOauthUnlink = (req, res, next) => {
  const provider = req.params.provider;
  User.findById(req.user.id, (err, user) => {
    if (err) { return next(err); }
    user[provider] = undefined;
    user.tokens = user.tokens.filter(token => token.kind !== provider);
    user.save((err) => {
      if (err) { return next(err); }
      req.flash('info', { msg: `${provider} account has been unlinked.` });
      res.redirect('/account');
    });
  });
};

/**
 * GET /reset/:token
 * Reset Password page.
 */
exports.getReset = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  User
    .findOne({ passwordResetToken: req.params.token })
    .where('passwordResetExpires').gt(Date.now())
    .exec((err, user) => {
      if (err) { return next(err); }
      if (!user) {
        req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
        return res.redirect('/forgot');
      }
      res.render('account/reset', {
        title: 'Password Reset'
      });
    });
};

/**
 * POST /reset/:token
 * Process the reset password request.
 */
exports.postReset = (req, res, next) => {
  req.assert('password', 'Password must be at least 4 characters long.').len(4);
  req.assert('confirm', 'Passwords must match.').equals(req.body.password);

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('back');
  }

  async.waterfall([
    function (done) {
      User
        .findOne({ passwordResetToken: req.params.token })
        .where('passwordResetExpires').gt(Date.now())
        .exec((err, user) => {
          if (err) { return next(err); }
          if (!user) {
            req.flash('errors', { msg: 'Password reset token is invalid or has expired.' });
            return res.redirect('back');
          }
          user.password = req.body.password;
          user.passwordResetToken = undefined;
          user.passwordResetExpires = undefined;
          user.save((err) => {
            if (err) { return next(err); }
            req.logIn(user, (err) => {
              done(err, user);
            });
          });
        });
    },
    function (user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Your Hackathon Starter password has been changed',
        text: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('success', { msg: 'Success! Your password has been changed.' });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/');
  });
};

/**
 * GET /forgot
 * Forgot Password page.
 */
exports.getForgot = (req, res) => {
  if (req.isAuthenticated()) {
    return res.redirect('/');
  }
  res.render('account/forgot', {
    title: 'Forgot Password'
  });
};

/**
 * POST /forgot
 * Create a random token, then the send user an email with a reset link.
 */
exports.postForgot = (req, res, next) => {
  req.assert('email', 'Please enter a valid email address.').isEmail();
  req.sanitize('email').normalizeEmail({ remove_dots: false });

  const errors = req.validationErrors();

  if (errors) {
    req.flash('errors', errors);
    return res.redirect('/forgot');
  }

  async.waterfall([
    function (done) {
      crypto.randomBytes(16, (err, buf) => {
        const token = buf.toString('hex');
        done(err, token);
      });
    },
    function (token, done) {
      User.findOne({ email: req.body.email }, (err, user) => {
        if (!user) {
          req.flash('errors', { msg: 'Account with that email address does not exist.' });
          return res.redirect('/forgot');
        }
        user.passwordResetToken = token;
        user.passwordResetExpires = Date.now() + 3600000; // 1 hour
        user.save((err) => {
          done(err, token, user);
        });
      });
    },
    function (token, user, done) {
      const transporter = nodemailer.createTransport({
        service: 'SendGrid',
        auth: {
          user: process.env.SENDGRID_USER,
          pass: process.env.SENDGRID_PASSWORD
        }
      });
      const mailOptions = {
        to: user.email,
        from: 'hackathon@starter.com',
        subject: 'Reset your password on Hackathon Starter',
        text: `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\n
          Please click on the following link, or paste this into your browser to complete the process:\n\n
          http://${req.headers.host}/reset/${token}\n\n
          If you did not request this, please ignore this email and your password will remain unchanged.\n`
      };
      transporter.sendMail(mailOptions, (err) => {
        req.flash('info', { msg: `An e-mail has been sent to ${user.email} with further instructions.` });
        done(err);
      });
    }
  ], (err) => {
    if (err) { return next(err); }
    res.redirect('/forgot');
  });
};
