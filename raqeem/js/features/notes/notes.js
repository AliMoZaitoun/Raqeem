// ==============================================
// notes.js — ملاحظات المعلم
// ==============================================

function renderTeacherNotesArchive(studentId) {
  const container = document.getElementById("teacherNotesArchive");
  container.innerHTML = "";

  const filteredNotes = appData.notes
    ? appData.notes
        .filter((n) => n.student_id === Number(studentId))
        .sort((a, b) => b.id - a.id)
    : [];

  if (filteredNotes.length === 0) {
    container.innerHTML =
      '<div class="text-muted text-center small py-2">لا توجد ملاحظات عامة سابقة مسجلة لهذا الطالب.</div>';
    return;
  }

  filteredNotes.forEach((n) => {
    container.innerHTML += `
        <div class="p-2 border-bottom small" style="background-color: #fbfbfb;">
            <div class="d-flex justify-content-between text-muted extra-small" style="font-size: 0.75rem;">
                <span><i class="fas fa-user-tie"></i> الأستاذ: ${n.teacher}</span>
                <span><i class="fas fa-clock"></i> ${n.date}</span>
            </div>
            <div class="fw-semibold text-dark mt-1" style="font-size: 0.9rem;">${n.note_text}</div>
        </div>
    `;
  });
}


function saveGeneralNote(e) {
  e.preventDefault();

  const studentId = document.getElementById("noteStudentId")
    ? document.getElementById("noteStudentId").value
    : null;
  const studentName = document.getElementById("noteStudentName")
    ? document.getElementById("noteStudentName").value
    : "";
  const teacher = document.getElementById("noteTeacherInput")
    ? document.getElementById("noteTeacherInput").value.trim()
    : "";
  const noteText = document.getElementById("noteTextInput")
    ? document.getElementById("noteTextInput").value.trim()
    : "";

  if (!studentId) {
    showToast("لم يتم تحديد الطالب الحالي بشكل صحيح!", "error");
    return;
  }

  const submitBtn =
    e.target.querySelector("button") ||
    document.querySelector("#generalNoteForm button");

  setBtnLoading(submitBtn, true, "جاري الحفظ...");

  const payload = {
    action: "add_general_note",
    student_id: studentId,
    student_name: studentName,
    teacher: teacher,
    note_text: noteText,
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(payload),
  })
    .then(() => {
      showToast(
        "تم حفظ الملاحظة العامة بنجاح، وستظهر فوراً في بوابة الأهل!",
        "success",
      );
      if (document.getElementById("noteTextInput")) {
        document.getElementById("noteTextInput").value = "";
      }

      if (!appData.notes) appData.notes = [];
      const now = new Date();
      const dateStr =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0");

      appData.notes.push({
        id: appData.notes.length + 1,
        student_id: Number(studentId),
        student_name: studentName,
        teacher: teacher,
        note_text: noteText,
        date: dateStr,
      });

      renderTeacherNotesArchive(studentId);
    })
    .catch((err) => {
      console.error(err);
      showToast("فشل الاتصال بالسيرفر، يرجى المحاولة مرة أخرى.", "error");
    })
    .finally(() => {
      setBtnLoading(submitBtn, false);
    });
}

