const { model, Schema } = require('mongoose');

const stockSchema = new Schema({
  stock: String,
  likes: [String]
});

module.exports = model('Stock', stockSchema);