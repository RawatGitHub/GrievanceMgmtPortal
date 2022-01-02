async function getGrievanceSubject(gCat) {
  const selectBox = document.getElementById("grievanceSubjectSelect");
  try {
    if (gCat != "") {
      let response = await fetch(`/student/dashboard?cat=${gCat}`);

      while (selectBox.options.length > 0) {
        selectBox.remove(0);
      }
      if (response.ok) {
        let grievanceSubs = await response.json();
        let newOption = new Option("Select Grievance Subject", "");
        selectBox.add(newOption, undefined);
        grievanceSubs.forEach((sub) => {
          let newOption = new Option(sub.grievanceSubject, sub._id);
          selectBox.add(newOption, undefined);
        });
      }
    } else {
      while (selectBox.options.length > 0) {
        selectBox.remove(0);
      }
      let newOption = new Option("Select Grievance Subject", "");
      selectBox.add(newOption, undefined);
    }
  } catch (e) {
    console.error(e);
  }
}

async function updateFacultyORstatus(id, type) {
  const er = document.getElementsByClassName("e-field");

  const studentEmail = document.getElementsByClassName("studentEmail")[0].value;

  er[0].textContent = "";
  const grievanceReply = document.getElementById("grievanceReply").value;
  if (type === "faculty") {
    try {
      const grievanceId = document.getElementsByClassName("grievanceId");

      let data = {
        id,
        type,
        studentEmail,
        grievanceId: grievanceId[0].value,
      };
      const response = await fetch(`?`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      console.log(response);
      const result = await response.json();
      console.log(result);
      window.location.replace("/faculty/allGrievances");
    } catch (e) {
      console.log(e);
    }
  }

  if (type === "status") {
    try {
      if (grievanceReply != "") {
        const grievanceId = document.getElementsByClassName("grievanceId");
        let data = {
          id,
          type,
          grievanceReply,
          studentEmail,
          grievanceId: grievanceId[0].value,
        };
        const response = await fetch(`?`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        console.log(response);
        const result = await response.json();
        console.log(result);
        window.location.replace("/faculty/allGrievances");
      } else {
        er[0].textContent = "Please enter reply and select status both.";
      }
    } catch (e) {
      console.log(e);
    }
  }
}

async function changeFacultyGrievanceCategory(catID) {
  try {
    const facultyId = document.getElementsByClassName("facultyId");
    let data = {
      catID,
      facultyId: facultyId[0].value,
    };
    const response = await fetch(`?`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    console.log(response);
    const result = await response.json();
    console.log(result);
    window.location.replace("/faculty/allFaculty");
  } catch (e) {
    console.log(e);
  }
}
