const express = require("express");
const {
  createGrievanceCat,
  createGrievanceSubject,
  showFacultyDashboard,
  addFaculty,
  showFacultyLoginPage,
  loginFaculty,
  showAllGrievances,
  showSingleGrievance,
  showAddGrievanceCatPage,
  showAddGrievanceSubjectPage,
  showResolvedGrievancePage,
  showPendingGrievancePage,
  showAddFacultyPage,
  showAllFacultyPage,
  updateFacultyORstatus,
  showEditFacultyPage,
  updatFacultyGrievanceCategory,
  showGrievanceByCategory,
  showProcessingGrievancePage,
  logout,
} = require("../controller/facultyController");
const router = express.Router();

router.route("/").get(showFacultyDashboard).post(loginFaculty);
router.route("/facultyLogin").get(showFacultyLoginPage).post(loginFaculty);
router.route("/allGrievances").get(showAllGrievances);
router
  .route("/grievance/:id")
  .get(showSingleGrievance)
  .post(updateFacultyORstatus);
router
  .route("/addGrievanceCategory")
  .get(showAddGrievanceCatPage)
  .post(createGrievanceCat);

router
  .route("/addGrievanceSubject")
  .get(showAddGrievanceSubjectPage)
  .post(createGrievanceSubject);

router.route("/resolvedGrievance").get(showResolvedGrievancePage);
router.route("/pendingGrievance").get(showPendingGrievancePage);

router.route("/processingGrievance").get(showProcessingGrievancePage);

router.route("/allFaculty").get(showAllFacultyPage);
router.route("/myGrievances").get(showFacultyDashboard);
router.route("/addFaculty").get(showAddFacultyPage).post(addFaculty);

router
  .route("/editfaculty/:id")
  .get(showEditFacultyPage)
  .post(updatFacultyGrievanceCategory);

router.route("/grievanceCategory/:cat").get(showGrievanceByCategory);

router.route("/logout").get(logout);

module.exports = router;
