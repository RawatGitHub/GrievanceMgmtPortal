const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
const studentRouter = require("./routes/studentRoute");
const facultyRouter = require("./routes/facultyRoute");
const webRouter = require("./routes/web");
const dotenv = require("dotenv");
dotenv.config({ path: "config/config.env" });
const connectDB = require("./config/db");
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "./public")));
app.set("views", path.join(__dirname, "./views"));
app.set("view engine", "ejs");
app.use("/", webRouter);
app.use("/student", studentRouter);
app.use("/faculty", facultyRouter);
app.listen(process.env.PORT, () => {
  console.log(`server running on port 5000`);
  connectDB();
});
