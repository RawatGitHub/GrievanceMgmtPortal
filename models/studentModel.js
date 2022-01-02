const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const studentSchema = new mongoose.Schema({
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
    select: false,
  },
  mobile: {
    type: String,
    required: [true, "Please enter mobile no"],
    unique: true,
    trim: true,
  },
  programme: {
    type: String,
    required: [true, "Please enter course"],
  },
  registeredOn: {
    type: Date,
    default: Date.now,
  },
});

studentSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// compare password with hash
studentSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Student", studentSchema);
