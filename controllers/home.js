/**
 * GET /
 * Home page.
 */
const Crono = require('../models/Crono');

exports.index = (req, res) => {
  res.render('home', {
    title: ''
  });
};
