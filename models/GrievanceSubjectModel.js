const mongoose = require("mongoose");
const grievanceSubjectSchema = new mongoose.Schema({
  grievanceSubject: {
    type: String,
    trim: true,
    required: [true, "Please enter grievance category"],
  },
  grievanceCatId: {
    type: mongoose.Schema.ObjectId,
    ref: "GrievanceCat",
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("GrievanceSubject", grievanceSubjectSchema);
