const mongoose = require("mongoose");

function connectDB() {
  let options = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };
  return mongoose.connect(process.env.DB_URI, options);
}

module.exports = connectDB;
