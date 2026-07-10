// ==============================================
// assignments.js — الواجبات
// ==============================================

function saveStudentAssignment(btnEl) {
  let studentId, studentName, surah, fromVerse, toVerse;

  if (document.getElementById("sessStudentHiddenId").value) {
    studentId = document.getElementById("sessStudentHiddenId").value;
    studentName = document.getElementById("sessStudentHiddenName").value;
    surah = document.getElementById("assignSurah").value.trim();
    fromVerse = document.getElementById("assignFrom").value.trim();
    toVerse = document.getElementById("assignTo").value.trim();
  } else {
    studentId = document.getElementById("noteStudentId").value;
    studentName = document.getElementById("profName").innerText;
    surah = document.getElementById("profileAssignSurah").value.trim();
    fromVerse = document.getElementById("profileAssignFrom").value.trim();
    toVerse = document.getElementById("profileAssignTo").value.trim();
  }

  if (!studentId || !studentName) {
    showToast("الرجاء اختيار طالب صحيح أولاً!", "error");
    return;
  }
  if (!surah) {
    showToast("يرجى كتابة اسم السورة للواجب.", "error");
    return;
  }

  const payload = {
    action: "add_assignment",
    student_id: Number(studentId),
    student_name: studentName,
    surah: surah,
    from_verse: fromVerse || "1",
    to_verse: toVerse || "آخرها",
  };

  setBtnLoading(btnEl, true, "جاري الحفظ...");

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        showToast("تم تسجيل الواجب بنجاح!", "success");

        if (document.getElementById("assignSurah"))
          document.getElementById("assignSurah").value = "";
        if (document.getElementById("profileAssignSurah"))
          document.getElementById("profileAssignSurah").value = "";

        fetchDataFromSheets();
      } else {
        showToast(
          "تعذر تسجيل الواجب: " +
            (data.message || "خطأ غير معروف من السيرفر."),
          "error",
        );
      }
    })
    .catch((err) => {
      console.error(err);
      showToast(
        "فشل الاتصال. جرب مرة ثانية أو تأكد من نشر الـ Script.",
        "error",
      );
    })
    .finally(() => {
      setBtnLoading(btnEl, false);
    });
}


function renderAssignmentsTable(currentStudentId) {
  const container = document.getElementById("studentProfileAssignments");
  if (!container) return;

  container.innerHTML = "";

  const studentAssignments = appData.assignments.filter(
    (a) => Number(a.student_id) === Number(currentStudentId),
  );

  if (studentAssignments.length === 0) {
    container.innerHTML =
      "<tr class='no-data-row'><td colspan='4' class='text-center text-muted py-3'>لا توجد واجبات لهذا الطالب</td></tr>";
    return;
  }

  studentAssignments.forEach((assign) => {
    const isDone = assign.status == "تم الإنجاز";
    const isFailed = assign.status == "لم ينجز";
    const statusColorClass = getAssignmentStatusColorClass(assign.status);
    let row = `<tr>
<td data-label="السورة" class="fw-semibold">${assign.surah}</td>
<td data-label="من آية">${assign.from_verse}</td>
<td data-label="إلى آية">${assign.to_verse}</td>
<td data-label="الحالة">
  <select
    class="form-select form-select-sm ${statusColorClass}"
    style="min-width: 130px"
    onchange="updateAssignmentStatus('${assign.id}', this.value, this)"
  >
      <option value="قيد الانتظار" ${assign.status == "قيد الانتظار" ? "selected" : ""}>⏳ قيد الانتظار</option>
      <option value="تم الإنجاز" ${isDone ? "selected" : ""}>✅ تم الإنجاز</option>
      <option value="لم ينجز" ${isFailed ? "selected" : ""}>❌ لم ينجز</option>
  </select>
</td>
    </tr>`;
    container.innerHTML += row;
  });
}

// تحديث حالة الواجب

function updateAssignmentStatus(assignmentId, newStatus, selectEl) {
  if (!assignmentId) return;

  const assign = appData.assignments.find((a) => a.id == assignmentId);
  const oldStatus = assign ? assign.status : null;

  function applyColor(status) {
    if (!selectEl) return;
    selectEl.classList.remove(
      "text-success",
      "text-danger",
      "text-warning",
      "fw-bold",
    );
    getAssignmentStatusColorClass(status)
      .split(" ")
      .forEach((cls) => selectEl.classList.add(cls));
  }

  // تحديث لون النص فوراً بدون انتظار رد السيرفر
  applyColor(newStatus);
  if (selectEl) selectEl.disabled = true;

  const payload = {
    action: "update_assignment_status",
    assignment_id: assignmentId,
    status: newStatus,
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(payload),
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.status === "success") {
        if (assign) assign.status = newStatus;
        showToast("تم تحديث حالة الواجب بنجاح.", "success");
      } else {
        showToast("حدث خطأ أثناء تحديث الحالة.", "error");
        // رجّع اللون والقيمة القديمة لأنو التحديث فشل بالسيرفر
        if (selectEl && oldStatus) selectEl.value = oldStatus;
        applyColor(oldStatus);
      }
    })
    .catch((err) => {
      console.error(err);
      showToast("فشل الاتصال بالسيرفر.", "error");
      if (selectEl && oldStatus) selectEl.value = oldStatus;
      applyColor(oldStatus);
    })
    .finally(() => {
      if (selectEl) selectEl.disabled = false;
    });
}
