const mongoose = require('mongoose');

const cronoSchema = new mongoose.Schema({
  periodo: String,
  evento: String,
  comentario: String,
  fecha: String,
  status: String
});
const Crono = mongoose.model('Cronograma', cronoSchema);

module.exports = Crono;

