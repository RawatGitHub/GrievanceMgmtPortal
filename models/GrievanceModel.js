const mongoose = require("mongoose");
const grievanceSchema = new mongoose.Schema({
  grievance: {
    type: String,
    trim: true,
    required: [true, "Please enter grievance"],
  },
  grievanceCatId: {
    type: mongoose.Schema.ObjectId,
    ref: "GrievanceCat",
  },
  grievanceSubId: {
    type: mongoose.Schema.ObjectId,
    ref: "GrievanceSubject",
  },
  studentId: {
    type: mongoose.Schema.ObjectId,
    ref: "Student",
  },
  facultyId: {
    type: mongoose.Schema.ObjectId,
    ref: "Faculty",
  },
  status: {
    type: String,
    default: "pending",
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
  forwardedOn: {
    type: Date,
  },
});

module.exports = mongoose.model("Grievance", grievanceSchema);
