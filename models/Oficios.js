const mongoose = require('mongoose');

const archiveSchema = new mongoose.Schema({
  email: String,
  codmateria: Number,
  materia: String,
  codigo: String,
  semestre: String,
  paralelo: String,
  docente: String, 
  item01: String,
  item02: String,
  item03: String,
  item04: String,
  item05: String,
  item06: String,
  item07: String,
  item08: String,
  item09: String,
  item10: String,
  item11: String,
  item12: String,
  item13: String,
  item14: String,
  item15: String,
  status: String
});
const Archive = mongoose.model('Syllabu', archiveSchema);

module.exports = Archive;