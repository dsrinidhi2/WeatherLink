const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ContactSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // owner
  name: { type: String, required: true },
  relation: { type: String, default: "" }, // e.g. Mom, Dad, Bestie
  city: { type: String, default: "" },
  phone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Contact", ContactSchema);
