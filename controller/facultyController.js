const Faculty = require("../models/facultyModel");
const Grievance = require("../models/GrievanceModel");
const GrievanceCat = require("../models/GrievanceCatModel");
const GrievanceSubject = require("../models/GrievanceSubjectModel");
const sendEmail = require("../utils/sendEmail");

exports.showFacultyDashboard = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    if (faculty.role === "faculty") {
      const facultyGrievances = await getFacultyGrievances(faculty);
      return res.render("myGrievances", { facultyGrievances, faculty });
    } else {
      const totalGrievances = await Grievance.countDocuments();
      const resolvedGrievances = await Grievance.find({
        status: "resolved",
      });
      const pendingGrievances = await Grievance.find({
        status: "pending",
      });

      const processingGrievances = await Grievance.find({
        status: "processing",
      });

      const allTypeCats = await getCountOfTypesOfGrievance();
      getCatWiseGrievance();
      res.render("facultyDashboard", {
        faculty,
        totalGrievances,
        resolvedGrievances: resolvedGrievances.length,
        pendingGrievances: pendingGrievances.length,
        processingGrievances: processingGrievances.length,
        allTypeCats,
      });
    }
  } else {
    return res.render("facultyLogin");
  }
};

exports.showFacultyLoginPage = (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    return res.render("facultyDashboard", { faculty });
  } else {
    return res.redirect("facultyLogin");
  }
};

exports.showAddFacultyPage = async (req, res, next) => {
  try {
    const { faculty } = req.cookies;
    if (typeof faculty !== "undefined") {
      if (faculty.role === "admin") {
        const grievanceCat = await getGrievanceCategory();
        res.render("addFaculty", { grievanceCat, faculty });
      } else {
        res.redirect("/faculty");
      }
    } else {
      res.redirect("facultyLogin");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.showAllFacultyPage = async (req, res, next) => {
  try {
    const { faculty } = req.cookies;
    if (typeof faculty !== "undefined") {
      const allFaculty = await getAllFaculty();
      const allCategory = await getGrievanceCategory();
      res.render("allFaculty", {
        allFaculty,
        allCategory,
        faculty: req.cookies.faculty,
      });
    } else {
      res.redirect("facultyLogin");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.addFaculty = async (req, res, next) => {
  try {
    const { name, email, password, grievanceCat } = req.body;

    if (name == "" || email == "" || password == "") {
      return res.render("addFaculty", {
        error: true,
        msg: "Please enter all fields",
      });
    }

    const faculty = await Faculty.create({
      name,
      email,
      password,
      grievanceCat,
    });

    res.status(201).redirect(`allFaculty`);
  } catch (e) {
    console.log(e);
  }
};

exports.loginFaculty = async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.render("facultyLogin", {
      error: true,
      msg: "Please enter all fields",
      email,
    });
  }
  try {
    const faculty = await Faculty.findOne({ email }).select("+password");
    if (!faculty) {
      return res.render("facultyLogin", {
        error: true,
        msg: "Somethning went wrong",
        email,
      });
    }
    const isMatched = await faculty.comparePassword(password);

    if (!isMatched) {
      return res.render("facultyLogin", {
        error: true,
        msg: "Email or password is wrong",
        email,
      });
    }
    res.cookie("faculty", faculty);
    res.status(200);
    res.redirect("/faculty");
  } catch (e) {
    console.log(e);
    return res.redirect("facultyLogin");
  }
};

exports.showAllGrievances = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined" && faculty.role === "admin") {
    try {
      const allGrievances = await await Grievance.find({})
        .populate("studentId")
        .populate("grievanceCatId")
        .populate("grievanceSubId")
        .populate("facultyId")
        .sort({ addedOn: -1 });
      res.status(200);
      res.render("allGrievances", { allGrievances, ...req.cookies });
    } catch (e) {
      console.log(e);
      res.redirect("/faculty");
    }
  } else {
    res.redirect("/faculty");
  }
};

exports.showSingleGrievance = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    const { id } = req.params;
    try {
      const singleGrievance = await Grievance.findById(id)
        .populate("grievanceCatId")
        .populate("grievanceSubId")
        .populate("studentId")
        .populate("facultyId");

      const allFaculty = await getAllFacultyByGrievanceCategory(
        singleGrievance.grievanceCatId
      );
      res.status(200);
      res.render("singleGrievance", {
        singleGrievance,
        ...req.cookies,
        allFaculty,
      });
    } catch (e) {
      console.log(e);
      res.redirect("/");
    }
  } else {
    res.redirect("/faculty");
  }
};

exports.showEditFacultyPage = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined" && faculty.role === "admin") {
    const { id } = req.params;
    try {
      const singleFaculty = await Faculty.findById(id).populate("grievanceCat");

      const allCats = await getGrievanceCategory();
      res.status(200);
      res.render("singleFaculty", {
        singleFaculty,
        ...req.cookies,
        allCats,
      });
    } catch (e) {
      console.log(e);
      res.redirect("/");
    }
  } else {
    res.redirect("/faculty");
  }
};

exports.updatFacultyGrievanceCategory = async (req, res, next) => {
  try {
    if (req.body.catID != "") {
      const updateFacultyCategory = await Faculty.findByIdAndUpdate(
        req.body.facultyId,
        { grievanceCat: req.body.catID },
        { new: true }
      );

      res.send(updateFacultyCategory);
    } else {
      console.log("ERROR");
    }
  } catch (e) {
    console.log(e);
  }
};

exports.showAddGrievanceCatPage = (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined" && faculty.role === "admin") {
    return res.render("addGrievanceCategory", { faculty: req.cookies.faculty });
  } else {
    return res.redirect("/faculty");
  }
};

exports.showAddGrievanceSubjectPage = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined" && faculty.role === "admin") {
    const allCategory = await getGrievanceCategory();
    return res.render("addGrievanceSubject", {
      allCategory,
      faculty: req.cookies.faculty,
    });
  } else {
    return res.redirect("/faculty");
  }
};

// assign facultya and set status
exports.updateFacultyORstatus = async (req, res, next) => {
  try {
    if (req.body.id != "") {
      if (req.body.type === "faculty") {
        const assignFaculty = await Faculty.findByIdAndUpdate(
          req.body.id,
          {
            grievanceID: req.body.grievanceId,
          },
          { new: true }
        );

        const updateForwardedOn = await Grievance.findByIdAndUpdate(
          req.body.grievanceId,
          { facultyId: req.body.id, forwardedOn: Date() }
        );

        res.send({ assignFaculty });
      }
      if (req.body.type === "status") {
        const updateStatus = await Grievance.findByIdAndUpdate(
          req.body.grievanceId,
          { status: req.body.id },
          { new: true }
        );
        const options = {
          to: req.body.studentEmail,
          subject: `Your Grievance status - ${req.body.id}`,
          msg: req.body.grievanceReply,
        };

        await sendEmail(options);
        res.send(updateStatus);
      }
    } else {
      console.log("ERROR");
    }
  } catch (e) {
    console.log(e);
  }
};

// grievance category
exports.createGrievanceCat = async (req, res, next) => {
  const { grievanceCat } = req.body;
  if (grievanceCat == "") {
    return res.render("addGrievanceCategory", {
      error: true,
      msg: "Please enter grievance category",
    });
  }
  try {
    const createdGrievanceCat = await GrievanceCat.create({ grievanceCat });

    if (!createdGrievanceCat) {
      return res.render("addGrievanceCategory", {
        error: true,
        msg: "Something went wrong",
      });
    }
    res.status(201);
    res.render("addGrievanceCategory", {
      success: true,
      faculty: req.cookies.faculty,
      msg: "Grievance Category Added",
    });
  } catch (e) {
    return res.render("addGrievanceCategory", {
      error: true,
      msg: "Something went wrong",
    });
  }
};

//  grievance subject
exports.createGrievanceSubject = async (req, res, next) => {
  const { grievanceCat, grievanceSubject } = req.body;

  if (grievanceCat == "" || grievanceSubject == "") {
    return res.render("addGrievanceSubject", {
      error: true,
      msg: "Please enter both category and subject",
    });
  }

  try {
    const createdGrievanceSubject = await GrievanceSubject.create({
      grievanceCatId: grievanceCat,
      grievanceSubject,
    });

    if (!createdGrievanceSubject) {
      return res.render("addGrievanceSubject", {
        error: true,
        msg: "Somegthing went wrong",
      });
    }

    res.status(201);
    const allCategory = await getGrievanceCategory();
    res.render("addGrievanceSubject", {
      success: true,
      msg: "Grievance Subject Added",
      allCategory,
      faculty: req.cookies.faculty,
    });
  } catch (e) {
    console.log(e);
    res.redirect("addGrievanceSubject");
  }
};

exports.showResolvedGrievancePage = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    if (faculty.role === "admin") {
      try {
        const resolvedGrievance = await Grievance.find({
          status: "resolved",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });
        res.status(200);
        res.render("resolvedGrievance", {
          resolvedGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("resolvedGrievance");
      }
    } else {
      try {
        const resolvedGrievance = await Grievance.find({
          facultyId: faculty._id,
          status: "resolved",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });
        res.status(200);
        res.render("resolvedGrievance", {
          resolvedGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("resolvedGrievance");
      }
    }
  } else {
    res.redirect("/facultyLogin");
  }
};

exports.showPendingGrievancePage = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    if (faculty.role === "admin") {
      try {
        const pendingGrievance = await Grievance.find({
          status: "pending",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });
        res.status(200);
        res.render("pendingGrievance", {
          pendingGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("pendingGrievance");
      }
    } else {
      try {
        const pendingGrievance = await Grievance.find({
          facultyId: faculty._id,
          status: "pending",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });

        res.status(200);
        res.render("pendingGrievance", {
          pendingGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("pendingGrievance");
      }
    }
  } else {
    res.redirect("/facultyLogin");
  }
};

exports.showProcessingGrievancePage = async (req, res, next) => {
  const { faculty } = req.cookies;
  if (typeof faculty !== "undefined") {
    if (faculty.role === "admin") {
      try {
        const processingGrievance = await Grievance.find({
          status: "processing",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });
        res.status(200);
        res.render("processingGrievance", {
          processingGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("processingGrievance");
      }
    } else {
      try {
        const processingGrievance = await Grievance.find({
          facultyId: faculty._id,
          status: "processing",
        })
          .populate("grievanceCatId")
          .populate("grievanceSubId")
          .populate("studentId")
          .populate("facultyId")
          .sort({ addedOn: -1 });

        res.status(200);
        res.render("processingGrievance", {
          processingGrievance,
          faculty: req.cookies.faculty,
        });
      } catch (e) {
        console.log(e);
        res.redirect("processingGrievance");
      }
    }
  } else {
    res.redirect("/facultyLogin");
  }
};

exports.showGrievanceByCategory = async (req, res, next) => {
  try {
    const { faculty } = req.cookies;
    if (typeof faculty !== "undefined" && faculty.role === "admin") {
      const cat = req.params.cat;
      if (cat !== "") {
        const catWiseGrievance = await getCatWiseGrievance(cat);

        res.render("showGrievanceByCategory", {
          faculty,
          cat,
          catWiseGrievance,
        });
      } else {
        res.redirect("/faculty");
      }
      // res.render()
    } else {
      res.redirect("/facultyLogin");
    }
  } catch (e) {
    console.log(e);
  }
};

async function getCatWiseGrievance(cat) {
  const allGrievance = await Grievance.find()
    .populate("grievanceCatId")
    .populate("grievanceSubId")
    .populate("studentId")
    .populate("facultyId");

  let res = [];
  allGrievance.forEach((g) => {
    if (g.grievanceCatId.grievanceCat === cat) {
      res.push(g);
    }
  });
  return res;
}

async function getGrievanceCategory() {
  try {
    return await GrievanceCat.find();
  } catch (e) {
    console.log(e);
  }
}

async function getCountOfTypesOfGrievance() {
  const allGCats = await getGrievanceCategory();
  let types = [];
  allGCats.forEach((cat) => {
    types.push(cat.grievanceCat);
  });
  let typesCats = {};
  for (let i = 0; i < allGCats.length; i++) {
    typesCats[types[i]] = await Grievance.find({
      grievanceCatId: allGCats[i]._id,
    }).count();
  }
  return typesCats;
}

async function getAllFaculty() {
  try {
    return await Faculty.find({
      role: { $ne: "admin" },
    })
      .populate("grievanceCat")
      .sort({ addedOn: -1 });
  } catch (e) {
    console.log(e);
  }
}

async function getAllFacultyByGrievanceCategory(catId) {
  try {
    const filteredFaculty = await Faculty.find({
      grievanceCat: catId,
    }).populate("grievanceCat");
    return filteredFaculty;
  } catch (e) {
    console.log(e);
  }
}

async function getFacultyGrievances(faculty) {
  try {
    return await Grievance.find({ facultyId: faculty._id })
      .populate("grievanceCatId")
      .populate("grievanceSubId")
      .populate("studentId");
  } catch (e) {
    console.log(e);
  }
}

exports.logout = (req, res, next) => {
  if (req.cookies.faculty) {
    res.clearCookie("faculty");
    res.redirect("/faculty");
  }
  res.render("facultyDashboard");
};
