const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter name"],
    trim: true,
  },
  email: {
    type: String,
    required: [true, "Please enter email"],
    trim: true,
    unique: true,
  },
  password: {
    type: String,
    trim: true,
    required: [true, "Please enter password"],
  },
  grievanceCat: {
    type: mongoose.Schema.ObjectId,
    ref: "GrievanceCat",
    required: true,
  },
  role: {
    type: String,
    default: "faculty",
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

facultySchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password with hash
facultySchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Faculty", facultySchema);
