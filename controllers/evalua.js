const async = require('async');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const passport = require('passport');
const Archive = require('../models/Oficios');


/* Carga test por materia seleccionada ******************************************************************************* */
exports.getEvaluation = (req, res, next) => {
  var mail = req.user.email; //filtra por  el nombre de usuario
  Archive.findById(req.params.id, (err, mySubject) => {
    if (mySubject) {
        return res.render('evaluation/test', {
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
    return res.redirect('/subjects');
  }
  Archive.findById(req.params.id, (err, test) => {
    if (err) { return next(err); }
    test.item01 = req.body.item01 || '';
    test.item02 = req.body.item02 || '';
    test.item03 = req.body.item03 || '';
    test.item04 = req.body.item04 || '';
    test.item05 = req.body.item05 || '';
    test.item06 = req.body.item06 || '';
    test.item07 = req.body.item07 || '';
    test.item08 = req.body.item08 || '';
    test.item09 = req.body.item09 || '';
    test.item10 = req.body.item10 || '';
    test.item11 = req.body.item11 || '';
    test.item12 = req.body.item12 || '';
    test.item13 = req.body.item13 || '';
    test.item14 = req.body.item14 || '';
    test.item15 = req.body.item15 || '';
    test.status = 'True' || '';
    test.save((err) => {
      if (err) {
        if (err.code === 11000) {
          req.flash('errors', { msg: 'Se presento algún inconvniente, reporta este inconveniente al adminitrador (jmera@uce.edu.ec) .' });
          return res.redirect('/subjects');
        }
        return next(err);
      }
      res.redirect('/subjects');
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
        return res.render('evaluation/student_det', {
          title: 'Registro de Materias',
          mySearch
        });
        console.log(mySearch); 
      }
      if (err){
        req.flash('success', { msg: 'No existe ningúna relación :(' });
          return res.render('evaluation/profile',{
            title: 'Correspondencia'
          });
      }
    }).sort({codigo:1});
};
/*Resultados evaluación*/
exports.getResult = (req, res, next) => {
  const mail = req.user.email; //filtra por  el nombre de usuario
  Archive.find({ email: mail}, (err, myArchive) => {
    if (myArchive) {
      return res.render('evaluation/report', {
        title: 'Resultados', myArchive
      });  
    }
    if (err){
      req.flash('success', { msg: 'No existe ningúna relación :(' });
        return res.render('/',{
          title: 'Evalua'
        });
    }
  }).sort({codigo:1});
};