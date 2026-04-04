const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AlertSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true }, // creator
  title: { type: String, required: true },
  body: { type: String, default: "" },
  severity: { type: String, enum: ["info","warning","critical"], default: "info" },
  forCloudCrew: { type: Boolean, default: false }, // sent to contacts / CloudCrew
  recipients: [{ type: Schema.Types.ObjectId, ref: "Contact" }], // optional contacts list
  exclusive: { type: Boolean, default: false }, // exclusive to the user (bell)
  read: { type: Boolean, default: false }, // for the creator's view
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", AlertSchema);
