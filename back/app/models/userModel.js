const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: String,
  email: { type: String, index: true, unique: true },
  display_name: String,

  created_at: Date,
  facebook: {
    id: { type: String, index: true },
    token: String,
    email: String,
  },
  google: {
    id: { type: String, index: true },
    token: String,
    email: String,
  },
  linkedin: {
    id: { type: String, index: true },
    token: String,
    email: String,
  },
  github: {
    id: { type: String, index: true },
    token: String,
    email: String,
  },
});


module.exports = mongoose.model('User', userSchema);
