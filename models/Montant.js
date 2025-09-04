const mongoose = require('mongoose');

const montantSchema = new mongoose.Schema({
  dollardAmount: { type: String },
  amount: { type: String},

});

module.exports = mongoose.model('Montant', montantSchema);
