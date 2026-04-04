const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  favourites: {
    type: [String],
    default: []
  },

  recents: {
    type: [
      {
        name: String,
        date: { type: Date, default: Date.now }
      }
    ],
    default: []
  }
});

module.exports = mongoose.model("User", UserSchema);
