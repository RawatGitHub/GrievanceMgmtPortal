const Student = require("../models/studentModel");
const GrievanceCat = require("../models/GrievanceCatModel");
const grievanceSub = require("../models/GrievanceSubjectModel");
const Grievance = require("../models/GrievanceModel");

exports.showRegisterForm = (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student !== "undefined") {
    return res.redirect("dashboard");
  }
  res.render("register");
};

exports.registerStudent = async (req, res, next) => {
  const { name, email, password, mobile, programme } = req.body;

  if (
    name == "" ||
    email == "" ||
    password == "" ||
    mobile == "" ||
    programme == ""
  ) {
    return res.render("register", {
      error: true,
      msg: "Please enter all fields",
    });
  }

  try {
    const student = await Student.create({
      name,
      email,
      password,
      mobile,
      programme,
    });

    res.cookie("student", student);
    res.status(201);
    res.redirect("dashboard");
  } catch (e) {
    return res.render("register", {
      error: true,
      msg: "Somegthing went wrong",
    });
  }
};

exports.showLoginForm = (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    // return res.render("dashboard", { student });
    return res.redirect("dashboard");
  } else res.render("login");
};

exports.loginStudent = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("login", {
      error: true,
      msg: "Please enter all fields",
    });
  }

  try {
    const student = await Student.findOne({ email }).select("+password");
    if (!student) {
      return res.render("login", {
        error: true,
        msg: "email or password is incorrect",
      });
    }

    const isMatched = await student.comparePassword(password);

    if (!isMatched) {
      return res.render("login", {
        error: true,
        msg: "email or password is incorrect",
      });
    }

    res.cookie("student", student);
    res.status(200);
    res.redirect("dashboard");
  } catch (e) {
    console.log(e);
  }
};

exports.showStudentDashboard = async (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    const allCategory = await getGrievanceCategory();
    if (typeof req.query.cat !== "undefined" && req.query.cat !== "") {
      const grievanceSubs = await grievanceSub
        .find({ grievanceCatId: req.query.cat })
        .populate("grievanceCatId");
      return res.send(grievanceSubs);
    }
    return res.render("dashboard", { student, allCategory });
  } else res.redirect("/student/login");
};

exports.showMyProfile = (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    res.render("myProfile", { student });
  } else res.redirect("/");
};

exports.submitGrievance = async (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student !== "undefined") {
    const { grievance, grievanceCat, grievanceSub } = req.body;
    const { _id } = req.cookies.student;
    if (grievance == "" || grievanceCat == "" || grievanceSub == "") {
      return res.render("dashboard", {
        error: true,
        msg: "Please enter all fields",
        student,
        allCategory: await getGrievanceCategory(),
      });
    }
    try {
      const createdGrievance = await Grievance.create({
        grievance,
        grievanceCatId: grievanceCat,
        grievanceSubId: grievanceSub,
        studentId: _id,
      });

      if (!createdGrievance) {
        return res.render("dashboard", {
          error: true,
          msg: "Something went wrong",
          student,
          allCategory: await getGrievanceCategory(),
        });
      }

      const trackId = createdGrievance._id;

      res.status(201);
      res.render("dashboard", {
        success: true,
        msg: `Your refrence no.`,
        student,
        allCategory: await getGrievanceCategory(),
        trackId,
      });
    } catch (e) {
      return res.render("dashboard", {
        error: true,
        msg: "Something went wrong",
        student,
        allCategory: await getGrievanceCategory(),
      });
    }
  } else {
    res.redirect("/");
  }
};

exports.showStatusPage = async (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    return res.render("checkStatus", { student });
  } else res.redirect("/");
};

exports.checkGrievanceStatus = async (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    const { grievanceId } = req.body;
    const allCategory = await getGrievanceCategory();
    console.log(grievanceId.match(/^[0-9a-fA-F]{24}$/));
    if (grievanceId == "") {
      return res.render("checkStatus", {
        error: true,
        msg: "Please enter refrence no of your query",
        student,
      });
    }
    try {
      const grievance = await Grievance.findById(grievanceId);

      if (!grievance) {
        return res.render("checkStatus", {
          error: true,
          msg: "Wrong reference no",
          student,
        });
      }

      res.status(200);
      res.render("checkStatus", {
        success: true,
        status: grievance.status,
        student,
      });
    } catch (e) {
      console.log(e);
      if (e.name == "CastError") {
        return res.render("checkStatus", {
          error: true,
          msg: "Wrong reference no. please enter vaild reference no",
          student,
          allCategory,
        });
      }
      return res.render("checkStatus", {
        error: true,
        msg: "Something went wrong",
        student,
        allCategory,
      });
    }
  } else res.redirect("/");
};

exports.logout = (req, res, next) => {
  if (req.cookies.student) {
    res.clearCookie("student");
    return res.redirect("/");
  }
  res.render("dashboard");
};

exports.showGrievanceHistoryPage = async (req, res, next) => {
  const { student } = req.cookies;
  if (typeof student != "undefined") {
    const studentGrievances = await Grievance.find({
      studentId: student._id,
    })
      .populate("grievanceCatId")
      .populate("grievanceSubId")
      .populate("facultyId")
      .sort({ addedOn: -1 });
    if (!studentGrievances) {
      return res.redirect("grievanceHistory");
    }
    res.render("grievanceHistory", { student, studentGrievances });
  } else res.redirect("/");
};

async function getGrievanceCategory() {
  try {
    return await GrievanceCat.find();
  } catch (e) {
    console.log(e);
  }
}
