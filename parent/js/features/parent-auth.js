async function searchStudentProfile(e) {
  e.preventDefault();

  const pinInput = document
    .getElementById("studentPinInput")
    .value.trim()
    .toUpperCase();
  const errorDiv = document.getElementById("loginError");

  await loadDataFromServer();

  const student = globalData.students.find(
    (st) =>
      st.student_pin &&
      st.student_pin.toString().trim().toUpperCase() === pinInput,
  );

  if (!student) {
    errorDiv.classList.remove("d-none");
    return;
  }

  errorDiv.classList.add("d-none");

  const currentStudentId = student.id;

  document.getElementById("parentStName").innerText = student.name;
  document.getElementById("parentStId").innerText =
    student.student_pin || "مسجل";

  // الملاحظات العامة
  renderGeneralNotes(currentStudentId);

  // الواجبات
  const stAssignments = (globalData.assignments || [])
    .filter((a) => Number(a.student_id) === Number(currentStudentId))
    .sort((a, b) => b.id - a.id);

  renderAssignments(stAssignments);

  // الجلسات
  const stSessions = globalData.sessions
    .filter((s) => Number(s.student_id) === Number(currentStudentId))
    .sort((a, b) => b.id - a.id);

  document.getElementById("parentStCount").innerText = stSessions.length;
  currentStudentSessions = stSessions;

  renderSummaryCards(stSessions);
  populateMonthFilter(stSessions);
  renderSessionsTimeline(stSessions);

  // تبديل الشاشات
  document.getElementById("loginSection").classList.add("d-none");
  document.getElementById("profileSection").classList.remove("d-none");
}

function logoutParents() {
  document.getElementById("studentPinInput").value = "";
  document.getElementById("profileSection").classList.add("d-none");
  document.getElementById("loginSection").classList.remove("d-none");
}
