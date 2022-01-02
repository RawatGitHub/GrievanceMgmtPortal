const express = require("express");
const {
  registerStudent,
  showRegisterForm,
  showStudentDashboard,
  showLoginForm,
  loginStudent,
  showMyProfile,
  submitGrievance,
  showStatusPage,
  checkGrievanceStatus,
  showGrievanceHistoryPage,
  logout,
} = require("../controller/studentController");
const router = express.Router();

router.route("/register").get(showRegisterForm).post(registerStudent);
router.route("/login").get(showLoginForm).post(loginStudent);

router.route("/myProfile").get(showMyProfile);
router.route("/dashboard").get(showStudentDashboard).post(submitGrievance);
router.route("/grievanceHistory").get(showGrievanceHistoryPage);

router.route("/checkStatus").get(showStatusPage).post(checkGrievanceStatus);
router.route("/logout").get(logout);

module.exports = router;
