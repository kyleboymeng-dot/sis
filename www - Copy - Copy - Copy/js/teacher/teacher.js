import { db } from "../firebase-config.js";

import { 
  collection,
  onSnapshot,
  query,
  where,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.9.0/firebase-firestore.js";

const tlist = document.getElementById("studentsList");
const totalEl = document.getElementById("totalStudents");

// Query only users with role "student"
// const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
const studentsQuery = query(collection(db, "students"));

// Get profile panel elements
const profile = document.getElementById("studentProfile");
const profileRecords = document.getElementById("profileRecords");
const profileName = document.getElementById("profileName");
const profileId = document.getElementById("profileId");
const profileGrade = document.getElementById("profileGrade");
const profileClass = document.getElementById("profileClass");
const profileSubject = document.getElementById("profileSubject");
const writtenWorks = document.getElementById("writtenWorks");
const performanceTask = document.getElementById("performanceTask");
const exam = document.getElementById("exam");
const gwa = document.getElementById("gwa");
const editDeletebtn = document.getElementById("editDeletebtn");

// Realtime fetch - Students list table
onSnapshot(studentsQuery, snapshot => {
  tlist.innerHTML = ""; // clear old rows

  // Count total students
  const totalStudents = snapshot.size; // number of docs in snapshot
  totalEl.textContent = totalStudents;

  snapshot.forEach(docSnap => {
  const user = docSnap.data();
  const studentId = docSnap.id;

  const row = document.createElement("tr");
  row.dataset.studentId = studentId;
  row.innerHTML = `
    <td style="font-size: .8rem">${user.studentId || ""}</td>
    <td style="font-size: .8rem">${user.firstName || ""} ${user.lastName || ""}</td>
    <td style="font-size: .8rem">${user.classId || ""}</td>
    <td>
      <button class="btn-secondary viewProfile" style="padding:8px;display:flex;gap:8px;justify-content:center; font-size: .8rem">+</button>
    </td>
  `;

  const viewBtn = row.querySelector(".viewProfile");
  viewBtn.addEventListener("click", async () => {

  profileName.textContent = `${user.firstName || ""} ${user.lastName || ""}`;
  profileId.textContent = `ID: ${user.studentId || ""}`;
  profileGrade.textContent = 'Class';
  profileClass.textContent = `${user.grade || ""} - ${user.classId || ""}`;

  writtenWorks.textContent = "";
  performanceTask.textContent = "";
  exam.textContent = "";
  gwa.textContent = "";
  profileSubject.textContent = "";
  editDeletebtn.style.display = "flex";

  try {
    let recordsHTML = "";
    let firstGradeDoc = null;
    let firstGradeData = null;

    const subjectsRef = collection(db, "grades", studentId, "subjects");
    const snapshot = await getDocs(subjectsRef);

    if (snapshot.empty) {
      profileSubject.textContent = "No grades yet.";
      profile.style.display = "block";
      profileRecords.innerHTML = recordsHTML;
      
      // Hide edit/delete buttons when no grades
      const editBtn = document.getElementById("editGradeBtn");
      const deleteBtn = document.getElementById("deleteGradeBtn");
      if (editBtn) editBtn.style.display = "none";
      if (deleteBtn) deleteBtn.style.display = "none";
      return;
    }

    snapshot.forEach((docSnap, index) => {
      const gradeData = docSnap.data();
      const docId = docSnap.id;

      // Store first grade for editing
      if (index === 0) {
        firstGradeDoc = docId;
        firstGradeData = gradeData;
      }

      recordsHTML += `
              <div style="text-align:left;padding:12px;border-radius:8px;background:#f8fafc;margin-bottom:8px;cursor:pointer;transition:all 150ms ease" data-grade-doc="${docId}" onclick="selectGradeForEdit(this, event)">
                <strong>Subject: ${gradeData.subject}</strong><br>
                <strong style="font-size:0.85rem">Academic Records</strong>
                <div style="margin-top:6px;font-size:0.8rem">
                  <div style="display:flex;justify-content:space-between"><span>Written Works (30%):</span><span>${gradeData.writtenWorks}</span></div>
                  <div style="display:flex;justify-content:space-between"><span>Performance Task (30%):</span><span>${gradeData.performanceTask}</span></div>
                  <div style="display:flex;justify-content:space-between"><span>Exam (40%):</span><span>${gradeData.exam}</span></div>
                  <div style="display:flex;justify-content:space-between;font-weight:600"><span>GWA:</span><span>${parseFloat(gradeData.gwa || 0).toFixed(2)}%</span></div>
                </div>
              </div>`;
      });

    document.getElementById("profileRecords").innerHTML = recordsHTML;

    // Show edit/delete buttons
    const editBtn = document.getElementById("editGradeBtn");
    const deleteBtn = document.getElementById("deleteGradeBtn");
    if (editBtn) editBtn.style.display = "block";
    if (deleteBtn) deleteBtn.style.display = "block";

    // Set up edit button handler with first grade
    if (editBtn && firstGradeData && firstGradeDoc) {
      editBtn.onclick = () => openEditGradeModal(studentId, user.name || "", firstGradeDoc, firstGradeData);
    }

    if (deleteBtn && firstGradeData && firstGradeDoc) {
      deleteBtn.onclick = () => {
        currentEditingGrade = firstGradeDoc;
        currentEditingStudentId = studentId;
        deleteGrade();
      };
    }

  } catch (err) {
    console.error("Error fetching grades:", err);
  }

  profile.style.display = "block";
  row.classList.add("active");
});
  tlist.appendChild(row);
});
});

const profileClose = document.getElementById("profileClose");

// Close profile button handler
profileClose.addEventListener("click", () => {
  profile.style.display = "none";
});


// Select grade for editing from profile
window.selectGradeForEdit = function(element, event) {
  event.stopPropagation();
  
  const gradeDoc = element.getAttribute("data-grade-doc");
  if (!gradeDoc) return;

  // Highlight selected grade
  document.querySelectorAll("[data-grade-doc]").forEach(el => {
    el.style.background = "#f8fafc";
    el.style.borderLeft = "none";
  });
  element.style.background = "#eef6ff";
  element.style.borderLeft = "4px solid #1F2A44";

  // Update edit button handler
  const editBtn = document.getElementById("editGradeBtn");
  if (editBtn) {
    editBtn.onclick = async () => {
      try {
        const studentId = document.querySelector("tr.active").dataset.studentId;
        const subjectsRef = collection(db, "grades", studentId, "subjects");
        const docSnap = await getDoc(doc(db, "grades", studentId, "subjects", gradeDoc));
        
        if (docSnap.exists()) {
          const studentName = document.getElementById("profileName").textContent;
          openEditGradeModal(studentId, studentName, gradeDoc, docSnap.data());
        }
      } catch (err) {
        console.error("Error loading grade for edit:", err);
      }
    };
  }

  // Update delete button handler
  const deleteBtn = document.getElementById("deleteGradeBtn");
  if (deleteBtn) {
    deleteBtn.onclick = () => {
      const studentId = document.querySelector("tr.active").dataset.studentId;
      currentEditingGrade = gradeDoc;
      currentEditingStudentId = studentId;
      deleteGrade();
    };
  }
};


/* ===========================
   ATTENDANCE SYSTEM (FIXED)
=========================== */

const tbody = document.getElementById("studentsTbody");
const presentEl = document.getElementById("presentCount");
const absentEl = document.getElementById("absentCount");
const lateEl = document.getElementById("lateCount");
const presentPctEl = document.getElementById("presentPct");
const saveBtn = document.getElementById("saveBtn");
const statusSelect = document.getElementById("statusSelect");
const classSelect = document.getElementById("classSelect");

let attendanceData = {};

/* ===========================
   LOAD STUDENTS
=========================== */
classSelect.addEventListener("change", () => {
  const selectedClass = classSelect.value;
  if (!selectedClass) return; // nothing selected

  const studentsQuery1 = query(
    collection(db, "students"), 
    where("classId", "==", selectedClass)
  );

  onSnapshot(studentsQuery1, snapshot => {
    tbody.innerHTML = "";
    attendanceData = {};

    if (snapshot.empty) {
      console.log("No students found for this class.");
      return;
    }

    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const studentDocId = docSnap.id;

      attendanceData[studentDocId] = {
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        studentId: user.studentId || "",
        classId: user.classId || "",
        status: "Present"
      };

      const row = document.createElement("tr");
      row.setAttribute("data-student-id", studentDocId);

      row.innerHTML = `
        <td>${user.studentId || ""}</td>
        <td>${user.firstName || ""} ${user.lastName || ""}</td>
        <td>${user.classId || ""}</td>
        <td style="padding:8px;display:flex;gap:8px;justify-content:center;">
          <button class="status-btn" data-status="Present">Present</button>
          <button class="status-btn" data-status="Absent">Absent</button>
          <button class="status-btn" data-status="Late">Late</button>
        </td>
      `;

      tbody.appendChild(row);

      row.querySelectorAll(".status-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          const status = btn.dataset.status;
          attendanceData[studentDocId].status = status;
          styleButtons(row, status);
          updateStats();
        });
      });

      styleButtons(row, "Present");
    });

    updateStats();
  });
});

/* ===========================
   STYLE BUTTONS
=========================== */

function styleButtons(row, selectedStatus) {
  row.querySelectorAll(".status-btn").forEach(btn => {

    const status = btn.dataset.status;

    btn.style.borderRadius = "6px";
    btn.style.padding = "6px 12px";
    btn.style.cursor = "pointer";
    btn.style.border = "1px solid #ccc";
    btn.style.fontWeight = "normal";

    if (status === selectedStatus) {
      btn.style.fontWeight = "600";

      if (status === "Present") {
        btn.style.background = "#d4edda";
        btn.style.color = "#155724";
      }
      if (status === "Absent") {
        btn.style.background = "#f8d7da";
        btn.style.color = "#721c24";
      }
      if (status === "Late") {
        btn.style.background = "#fff3cd";
        btn.style.color = "#856404";
      }

    } else {
      btn.style.background = "#fff";
      btn.style.color = "#666";
    }
  });
}

/* ===========================
   MARK ALL
=========================== */

if (statusSelect) {
  statusSelect.addEventListener("change", () => {

    const statusMap = {
      presentOption: "Present",
      absentOption: "Absent",
      lateOption: "Late"
    };

    const statusText = statusMap[statusSelect.value];
    if (!statusText) return;

    tbody.querySelectorAll("tr").forEach(row => {

      const studentId = row.getAttribute("data-student-id");
      if (!studentId) return;

      attendanceData[studentId].status = statusText;
      styleButtons(row, statusText);
    });

    updateStats();
  });
}

/* ===========================
   UPDATE STATS
=========================== */

function updateStats() {

  const counts = { Present: 0, Absent: 0, Late: 0 };

  Object.values(attendanceData).forEach(student => {
    if (counts.hasOwnProperty(student.status)) {
      counts[student.status]++;
    }
  });

  const total = counts.Present + counts.Absent + counts.Late;

  presentEl.textContent = counts.Present + " students";
  absentEl.textContent = counts.Absent + " students";
  lateEl.textContent = counts.Late + " students";

  if (presentPctEl) {
    const percent = total === 0
      ? 0
      : Math.round((counts.Present / total) * 100);

    presentPctEl.textContent = percent + "%";
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const sessionSelect = document.getElementById("academicSessionSelect");
  const dateInput = document.getElementById("dateInput");
  const subjectSelect = document.getElementById("subjectSelect");

  if (dateInput) {
    dateInput.valueAsDate = new Date();
  }

  if (sessionSelect && sessionSelect.options.length > 0) {
    sessionSelect.selectedIndex = 0;
  }

  if (subjectSelect && subjectSelect.options.length > 0) {
    subjectSelect.selectedIndex = 0;
  }

});
window.addEventListener("DOMContentLoaded", async () => {
  document.getElementById("dateInput").valueAsDate = new Date();
  await loadClasses();
  await loadSubjects();
});

async function loadClasses() {
  const classSelect = document.getElementById("classSelect");
  const classSelect1 = document.getElementById("classSelect1");
  const classesRef = collection(db, "classes", "strand", "HUMSS");

  const snapshot = await getDocs(classesRef);
  classSelect.innerHTML = "";
  classSelect1.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const classId = docSnap.id; // e.g. HUMSS-01
    const option = document.createElement("option");
    option.value = classId;
    option.textContent = classId;
    classSelect.appendChild(option);
  });

  snapshot.forEach((docSnap) => {
    const classId = docSnap.id; // e.g. HUMSS-01
    const option = document.createElement("option");
    option.value = classId;
    option.textContent = classId;
    classSelect1.appendChild(option);
  });

  // Trigger initial load
  if (classSelect.value) {
    classSelect.dispatchEvent(new Event("change"));
  }

  if (classSelect1.value) {
    classSelect1.dispatchEvent(new Event("change"));
  }
}

async function loadSubjects() {
  const subjectSelect = document.getElementById("subjectSelect");
  const subjectSelect1 = document.getElementById("subjectSelect1");
  const subjectRef = collection(db, "subjects");

  const snapshot = await getDocs(subjectRef);
  subjectSelect.innerHTML = "";
  subjectSelect1.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const subjectId = docSnap.id; // e.g. HUMSS-01
    const option = document.createElement("option");
    option.value = subjectId;
    option.textContent = subjectId;
    subjectSelect.appendChild(option);
  });

  snapshot.forEach((docSnap) => {
    const subjectId = docSnap.id; // e.g. HUMSS-01
    const option = document.createElement("option");
    option.value = subjectId;
    option.textContent = subjectId;
    subjectSelect1.appendChild(option);
  });

  // Trigger initial load
  if (subjectSelect.value) {
    subjectSelect.dispatchEvent(new Event("change"));
  }
  if (subjectSelect1.value) {
    subjectSelect1.dispatchEvent(new Event("change"));
  }
}

/* ===========================
   PREVENT DUPLICATE SAVE
=========================== */
/* ===========================
   SAVE ATTENDANCE (USE SELECTED DATE)
=========================== */

let isSaving = false;
saveBtn.addEventListener("click", async () => {
  if (isSaving) return; 
  isSaving = true;
  saveBtn.disabled = true;

  try {

    const selectedSession = document.getElementById("academicSessionSelect")?.value 
      || "SY_2025_2026_SEM1";

    const selectedClass = document.getElementById("classSelect").value;
    const selectedSubject = document.getElementById("subjectSelect").value;
    const selectedDate = document.getElementById("dateInput").value;

    if (!selectedDate) throw new Error("Select a date first.");
    if (!selectedClass) throw new Error("Select a class first.");
    if (!selectedSubject) throw new Error("Select a subject first.");

    // Build correct path: attendance/session/dates/date/classes/class/subjects/subject
    const subjectRef = doc(
      db,
      "attendance",
      selectedSession,
      "dates",
      selectedDate,
      "classes",
      selectedClass,
      "subjects",
      selectedSubject
    );

    // Check if attendance already exists
    const existing = await getDoc(subjectRef);

    if (existing.exists()) {
      const confirmUpdate = confirm(
        "Attendance already exists for this date. Do you want to update it?"
      );
      if (!confirmUpdate) {
        isSaving = false;
        saveBtn.disabled = false;
        return;
      }
    }

    // Create/Update subject doc with metadata
    await setDoc(subjectRef, {
      subjectId: selectedSubject,
      classId: selectedClass,
      date: selectedDate,
      academicYear: selectedSession,
      updatedAt: serverTimestamp()
    }, { merge: true });

    // Save individual student attendance records
    const studentsRef = collection(subjectRef, "students");

    const batchPromises = Object.entries(attendanceData).map(
      ([studentDocId, info]) => {

        const studentDocRef = doc(studentsRef, studentDocId);

        return setDoc(studentDocRef, {
          studentId: info.studentId,
          firstName: info.firstName,
          lastName: info.lastName,
          classId: info.classId,
          status: info.status,
          date: selectedDate,
          academicYear: selectedSession,
          recordedAt: serverTimestamp()
        }, { merge: true });
      }
    );

    await Promise.all(batchPromises);

    alert("Attendance saved successfully!");

  } catch (error) {
    console.error("Error saving attendance:", error);
    alert(error.message || "Failed to save attendance.");
  }

  isSaving = false;
  saveBtn.disabled = false;
});

exportCsvBtn.addEventListener("click", () => {
  const rows = [["Student ID", "First Name", "Last Name", "Class", "Status"]];
  Object.values(attendanceData).forEach(a => {
    rows.push([a.studentId, a.firstName, a.lastName, a.classId, a.status]);
  });

  // Convert rows to CSV string
  const csvContent = rows.map(r => r.map(v => `"${v}"`).join(",")).join("\n");

  // Create a temporary link to download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  const date = new Date();
  link.setAttribute("download", `attendance_${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

window.addEventListener("DOMContentLoaded", () => {
  loadAttendanceHistory();
});

document.getElementById("academicSessionSelect")
.addEventListener("change", () => {
  loadAttendanceHistory();
});

const historyTbody = document.getElementById("attendanceHistoryTbody");

/* ===========================
   LOAD ATTENDANCE HISTORY
=========================== */

function loadAttendanceHistory() {

  const selectedSession = document.getElementById("academicSessionSelect")?.value 
    || "SY_2025_2026_SEM1";

  if (!selectedSession) return;

  // Listen to ALL students subcollections under this session
  const studentsCollectionGroup = collectionGroup(db, "students");

  onSnapshot(studentsCollectionGroup, (snapshot) => {

    historyTbody.innerHTML = "";

    snapshot.forEach((docSnap) => {

      const data = docSnap.data();

      // Filter only records from selected session
      if (data.academicYear !== selectedSession) return;

      // Extract path info
      const pathSegments = docSnap.ref.path.split("/");

      // attendance/session/dates/date/classes/class/subjects/subject/students/student
      const date = pathSegments[3];
      const section = pathSegments[5];
      const subject = pathSegments[7];

      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${date}</td>
        <td>${data.firstName || ""} ${data.lastName || ""}</td>
        <td>${data.studentId || ""}</td>
        <td>${section || ""}</td>
        <td>${subject || ""}</td>
        <td>${data.status || ""}</td>
      `;

      historyTbody.appendChild(row);

    });

  });

}

/* ============================================
   ADD GRADE FUNCTIONALITY (COMPLETE + FIXED)
============================================ */

const openAddGradeBtn = document.getElementById("openAddGradeBtnStudents");
const addGradeBackdrop = document.getElementById("addGradeBackdrop");
const studentSelect = document.getElementById("addGradeStudent");
const addGradeSubject = document.getElementById("addGradeSubject");
const addGradeCancel = document.getElementById("addGradeCancel");
const addGradeConfirm = document.getElementById("addGradeConfirm");
const addGradeWrittenWorks = document.getElementById("addGradeWrittenWorks");
const addGradePerformanceTask = document.getElementById("addGradePerformanceTask");
const addGradeExam = document.getElementById("addGradeExam");

// Placeholder for students data
let studentsData = {};

/* ---------------- FETCH STUDENTS (Optional) ---------------- */
// If you are using Firebase, keep this. If not, you can remove it.
async function loadStudents() {

  try {
    const snapshot = await getDocs(studentsQuery);
    studentSelect.innerHTML = `<option value="">Select student</option>`;
    snapshot.forEach(docSnap => {
      const user = docSnap.data();
      const uid = docSnap.id;
      studentsData[uid] = user;
      const option = document.createElement("option");
      option.value = uid;
      option.textContent = `${user.name || "No Name"} (${user.id || ""})`;
      studentSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error loading students:", err);
  }
}
loadStudents(); 

/* ---------------- OPEN MODAL ---------------- */

if (openAddGradeBtn) {
  openAddGradeBtn.addEventListener("click", () => {
    addGradeBackdrop.classList.remove("hidden");
    addGradeBackdrop.setAttribute("aria-hidden", "false");
    
    // Focus on the first input for accessibility
    setTimeout(() => studentSelect.focus(), 100);
  });
}

/* ---------------- CLOSE MODAL ---------------- */
function closeAddGradeModal() {
  addGradeBackdrop.classList.add("hidden");
  addGradeBackdrop.setAttribute("aria-hidden", "true");
  resetGradeForm();
}

addGradeCancel.addEventListener("click", closeAddGradeModal);

addGradeBackdrop.addEventListener("click", (e) => {
  // Close only if clicking the dark backdrop, not the dialog itself
  if (e.target === addGradeBackdrop) {
    closeAddGradeModal();
  }
});

/* ---------------- CALCULATE GWA ---------------- */
function calculateGwa() {
  const ww = parseFloat(addGradeWrittenWorks.value) || 0;
  const pt = parseFloat(addGradePerformanceTask.value) || 0;
  const ex = parseFloat(addGradeExam.value) || 0;

  // Formula: (WW * 0.3) + (PT * 0.3) + (Exam * 0.4)
  const gwaValue = (ww * 0.3) + (pt * 0.3) + (ex * 0.4);
  return parseFloat(gwaValue.toFixed(2)); // Round to 2 decimals
}

// Attach calculation to input changes
addGradeWrittenWorks.addEventListener("input", calculateGwa);
addGradePerformanceTask.addEventListener("input", calculateGwa);
addGradeExam.addEventListener("input", calculateGwa);

/* ---------------- SAVE GRADE ---------------- */
addGradeConfirm.addEventListener("click", async () => {
  try {
    const studentId = studentSelect.value;
    const subject = addGradeSubject.value.trim();

    const ww = parseFloat(addGradeWrittenWorks.value) || 0;
    const pt = parseFloat(addGradePerformanceTask.value) || 0;
    const ex = parseFloat(addGradeExam.value) || 0;

    // 1. Validation
    if (!studentId) {
      alert("Please select a student.");
      return;
    }
    if (!subject) {
      alert("Please enter a subject.");
      return;
    }
    if ([ww, pt, ex].some(g => g < 0 || g > 100)) {
      alert("Grades must be between 0 and 100.");
      return;
    }

    const gwaValue = calculateGwa();


    const subjectRef = collection(db, "grades", studentId, "subjects");
    await addDoc(subjectRef, {
      subject,
      writtenWorks: ww,
      performanceTask: pt,
      exam: ex,
      gwa: gwaValue,
      quarter: "1st",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // For demonstration (remove alert in production):
    console.log("Grade Saved:", { studentId, subject, ww, pt, ex, gwaValue });
    alert(`Grade saved successfully!\nGWA: ${gwaValue}`);
    
    closeAddGradeModal();

  } catch (err) {
    console.error("Error saving grade:", err);
    alert("Error saving grade. Check console.");
  }
});

/* ---------------- RESET FORM ---------------- */
function resetGradeForm() {
  studentSelect.value = "";
  addGradeSubject.value = "";
  addGradeWrittenWorks.value = "";
  addGradePerformanceTask.value = "";
  addGradeExam.value = "";
}

document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    // Remove active from all buttons
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Hide all tab contents
    document.querySelectorAll('.tab-content').forEach(tab => {
      tab.classList.remove('active');
    });

      // Show selected tab
      const tabName = btn.dataset.tab;
      if (tabName === "mark-attendance") {
        document.getElementById("mark-attendance-tab").classList.add("active");
      } else {
        document.getElementById("view-history-tab").classList.add("active");
      }
    });
  });

/* ============================================
   TODAY'S SCHEDULE - DASHBOARD DISPLAY
============================================ */

// Global schedule storage
window.scheduleData = [];

// Function to add class to schedule and update dashboard
window.addClassAndUpdateDashboard = function(cls) {
  window.scheduleData.push(cls);
  updateTodayScheduleDisplay();
};

// Function to update today's schedule display
function updateTodayScheduleDisplay() {
  const todayScheduleContent = document.getElementById("todayScheduleContent");
  if (!todayScheduleContent) return;

  // Get today's day name
  const today = new Date();
  const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const todayName = daysOfWeek[today.getDay()];

  // Filter classes for today
  const todayClasses = window.scheduleData.filter(cls => 
    cls.day && cls.day.toLowerCase() === todayName.toLowerCase()
  );

  if (todayClasses.length === 0) {
    // No classes today
    todayScheduleContent.innerHTML = `
      <p>No classes scheduled for today</p>
    `;
  } else {
    // Display today's classes
    let classesHTML = '<div style="width:100%">';
    todayClasses.forEach((cls, index) => {
      classesHTML += `
        <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:${index < todayClasses.length - 1 ? '12px' : '0'}">
          <div style="width:3px;height:60px;background:#526EEA;border-radius:2px;flex-shrink:0;margin-top:2px"></div>
          <div style="flex:1">
            <div style="font-weight:600;color:#1F2A44;font-size:0.95rem">${cls.name}</div>
            <div style="color:#7a8899;font-size:0.85rem;margin-top:2px">${cls.subject}</div>
            <div style="color:#7a8899;font-size:0.8rem;margin-top:4px">⏱ ${cls.start} - ${cls.end} &nbsp; • &nbsp; 📍 ${cls.room}</div>
          </div>
        </div>
      `;
    });
    classesHTML += '</div>';
    todayScheduleContent.innerHTML = classesHTML;
  }
}

// Call update on page load
window.addEventListener("DOMContentLoaded", () => {
  updateTodayScheduleDisplay();
});

// Also update when a new class is added through the modal
const originalAddClassToSchedule = window.addClassToSchedule;
if (originalAddClassToSchedule) {
  window.addClassToSchedule = function(cls) {
    originalAddClassToSchedule(cls);
    window.addClassAndUpdateDashboard(cls);
  };
}