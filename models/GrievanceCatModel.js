const mongoose = require("mongoose");
const grievanceCatSchema = new mongoose.Schema({
  grievanceCat: {
    type: String,
    trim: true,
    required: [true, "Please enter grievance category"],
    unique: true,
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GrievanceCat", grievanceCatSchema);
