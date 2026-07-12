// ==============================================
// students.js — إدارة الطلاب (عرض، بحث، حفظ، ملف شامل)
// ==============================================

function populateStudentsDatalist() {
  const dl = document.getElementById("studentsDatalist");
  dl.innerHTML = "";

  appData.students.forEach((st) => {
    const optionText = `${st.name} (معرف: ${st.id})`;
    dl.innerHTML += `<option value="${optionText}">`;
  });
}


function handleStudentSelect() {
  const inputVal = document
    .getElementById("sessStudentInput")
    .value.trim();
  const hiddenId = document.getElementById("sessStudentHiddenId");
  const hiddenName = document.getElementById("sessStudentHiddenName");

  const match = inputVal.match(/(.+?)\s*\(معرف:\s*(\d+)\)/);
  if (match) {
    const name = match[1].trim();
    const id = Number(match[2]);

    hiddenId.value = id;
    hiddenName.value = name;
    return;
  }

  const student = appData.students.find(
    (st) =>
      st.name === inputVal ||
      st.name.toLowerCase() === inputVal.toLowerCase(),
  );

  if (student) {
    hiddenId.value = student.id;
    hiddenName.value = student.name;
    return;
  }

  hiddenId.value = "";
  hiddenName.value = "";
}


function renderStudentsCards(filteredList = null) {
  const container = document.getElementById("studentsContainer");
  container.innerHTML = "";
  let list = filteredList ? filteredList : appData.students;
  if (list.length === 0) {
    container.innerHTML =
      '<div class="col-12 text-center text-muted py-4">لا نتائج مطابقة</div>';
    return;
  }
  list.forEach((st) => {
    let count = appData.sessions.filter(
      (s) => s.student_id === st.id,
    ).length;

    container.innerHTML += `
                <div class="col-md-4 col-sm-6 mb-3">
                    <div class="card h-100 border-0 rounded-3 shadow-sm overflow-hidden" style="background: #ffffff;">
                        <div class="p-3 d-flex align-items-center border-bottom bg-light bg-opacity-50">
                            <div class="bg-primary bg-opacity-10 text-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 48px; height: 48px; min-width: 48px;">
                                <i class="fas fa-user-graduate fs-5"></i>
                            </div>
                            <div class="ms-3 flex-grow-1 text-start" style="margin-right: 12px;">
                                <h5 class="fw-bold text-dark mb-0 fs-6">${st.name}</h5>
                                <span class="badge bg-danger bg-opacity-10 text-danger px-2 py-0.5 rounded fw-bold" style="font-size: 0.75rem;"><i class="fas fa-key me-1"></i> رمز الدخول: ${st.student_pin || "بدون"}</span>
                            </div>
                        </div>
                        <div class="card-body p-3 text-start">
                            <div class="row g-0 text-muted small mb-3 border-bottom pb-2">
                                <div class="col-6"><i class="fas fa-birthday-cake me-1 text-secondary"></i> العمر: <b>${st.age || "-"} سنة</b></div>
                                <div class="col-6 text-end"><i class="fas fa-phone me-1 text-secondary"></i> ${st.phone || "-"}</div>
                            </div>
                            <div class="d-flex align-items-center justify-content-between">
                                <span class="badge bg-success bg-opacity-10 text-success fw-bold px-3 py-2 rounded-2" style="font-size: 0.85rem;">
                                    <i class="fas fa-check-circle me-1"></i> سمّع ${count} مرة
                                </span>
                                <button class="btn btn-primary btn-sm fw-bold px-3 py-1.5 rounded-2" style="font-size: 0.8rem; background-color: #1a73e8; border: none;" onclick="viewStudentProfile(${st.id})">
                                    السجل الكامل <i class="fas fa-chevron-left ms-1" style="font-size: 0.7rem;"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
  });
}


function filterStudents() {
  const q = document
    .getElementById("studentSearchInput")
    .value.toLowerCase()
    .trim();
  if (!q) {
    renderStudentsCards();
    return;
  }
  let res = appData.students.filter(
    (st) =>
      String(st.name || "")
        .toLowerCase()
        .includes(q) || String(st.phone || "").includes(q),
  );
  renderStudentsCards(res);
}


function viewStudentProfile(studentId) {
  let student = appData.students.find((st) => st.id === studentId);
  if (!student) return;

  // بيانات الطالب
  document.getElementById("profName").innerText = student.name;
  document.getElementById("profAge").innerText = student.age || "-";
  document.getElementById("profPhone").innerText = student.phone || "-";

  // سجل التسميع
  let ind = appData.sessions
    .filter((s) => s.student_id === studentId)
    .sort((a, b) => b.id - a.id);

  document.getElementById("profTotalCount").innerText = ind.length;

  const tbody = document.getElementById("studentProfileTableBody");
  tbody.innerHTML = "";
  ind.forEach((s) => {
    tbody.innerHTML += `<tr>
<td data-label="الأستاذ">${s.teacher}</td>
<td data-label="السورة">${s.surah}</td>
<td data-label="الآيات">${s.from_verse}-${s.to_verse}</td>
<td data-label="التقييم">${getRatingStarsHtml(s.rating)}</td>
<td data-label="الأخطاء">${s.errors}</td>
<td data-label="الملاحظات" class="small">${s.notes || "-"}</td>
    </tr>`;
  });

  renderAssignmentsTable(studentId);
  renderTeacherNotesArchive(studentId);

  // تعبئة معرّف واسم الطالب فوراً بالحقول المخفية
  // حتى نموذجي "إضافة ملاحظة" و"تحديد واجب" ياخدوا الطالب المفتوح مباشرة
  if (document.getElementById("noteStudentId")) {
    document.getElementById("noteStudentId").value = studentId;
  }
  if (document.getElementById("noteStudentName")) {
    document.getElementById("noteStudentName").value = student.name;
  }

  // فتح المودال
  const modal = new bootstrap.Modal(
    document.getElementById("studentProfileModal"),
  );
  modal.show();

  // إعادة ضبط التبويب الأول عند كل فتح للمودال
  // (بوتستراب بيتكفل تلقائياً بالتبديل بين التبويبات بما إنو الأزرار
  // فيها data-bs-toggle="tab"، فما في داعي لأي كود يدوي إضافي)
  const firstTabBtn = document.querySelector(
    "#profileTabs button.nav-link",
  );
  if (firstTabBtn) {
    bootstrap.Tab.getOrCreateInstance(firstTabBtn).show();
  }
}


function saveStudent(e) {
  e.preventDefault();

  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let generatedPin = "";
  for (let i = 0; i < 4; i++) {
    generatedPin += chars.charAt(
      Math.floor(Math.random() * chars.length),
    );
  }

  const name = document.getElementById("stName").value.trim();
  const age = document.getElementById("stAge").value;
  const phone = document.getElementById("stPhone").value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setBtnLoading(submitBtn, true, "جاري الحفظ...");

  const payload = {
    action: "add_student",
    name: name,
    age: age,
    phone: phone,
    student_pin: generatedPin,
  };

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(payload),
  })
    .then(() => {
      showToast(
        `تم حفظ الطالب بنجاح! رمز الدخول المخصص له هو: ${generatedPin}`,
        "success",
      );

      const modalEl = document.getElementById("addStudentModal");
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
      document.getElementById("studentForm").reset();

      if (!appData.students) appData.students = [];

      const nextId =
        appData.students.length > 0
          ? Math.max(...appData.students.map((s) => s.id)) + 1
          : 1;

      appData.students.push({
        id: nextId,
        name: name,
        age: age,
        phone: phone,
        student_pin: generatedPin,
      });

      renderStudentsCards();
    })
    .catch((err) => {
      console.error(err);
      showToast(
        "حدث خطأ أثناء الاتصال بالسيرفر، يرجى المحاولة مرة أخرى.",
        "error",
      );
    })
    .finally(() => {
      setBtnLoading(submitBtn, false);
    });
}


