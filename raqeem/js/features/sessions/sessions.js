// ==============================================
// sessions.js — تسميع الجلسات (السور، الحفظ، لوحة التحكم)
// ==============================================

function initSurahDatalist() {
  const dl = document.getElementById("surahDatalist");
  dl.innerHTML = "";
  Object.keys(quranSurahs).forEach((s) => {
    dl.innerHTML += `<option value="${s}">`;
  });
}

// قائمة انتظار السور اللي رح تنحفظ مع بعض بنفس جلسة التسميع
// (مشان يقدر الأستاذ يضيف أكتر من سورة قبل ما يضغط "حفظ التسميع")
let pendingSessionSurahs = [];

// إذا الأستاذ ضغط "ابدأ التسميع" من لوحة الواجبات، منخزّن معرّف الواجب هون
// مشان أول ما يحفظ التسميع بنجاح، نحدّث حالة هاد الواجب لـ "تم الإنجاز" تلقائياً
let linkedAssignmentId = null;

// بتعبي حقول السورة/من آية/إلى آية بالتسميع تلقائياً من بيانات واجب موجود،
// حتى الأستاذ بس يضيف التقييم وعدد الأخطاء ويحفظ (بدل ما يكتب كل شي من الصفر)
function startSessionFromAssignment(assignmentId) {
  const assign = appData.assignments.find((a) => a.id == assignmentId);
  if (!assign) return;

  document.getElementById("sessSurah").value = assign.surah;
  document.getElementById("sessFrom").value = assign.from_verse;
  document.getElementById("sessTo").value = assign.to_verse;
  document.getElementById("fullSurahCheck").checked = false;
  document.getElementById("sessFrom").readOnly = false;
  document.getElementById("sessTo").readOnly = false;
  onSurahChange();

  linkedAssignmentId = assign.id;

  document.getElementById("sessRating").focus();
  showToast(
    `تم تعبئة بيانات "${assign.surah}"، ضيف التقييم والأخطاء واحفظ التسميع 👍`,
    "success",
  );
}

function renderSessionSurahQueue() {
  const containerEl = document.getElementById("sessionSurahQueueList");
  if (!containerEl) return;
  if (!pendingSessionSurahs.length) {
    containerEl.innerHTML =
      '<div class="text-muted small fst-italic">لسا ما ضفت ولا سورة للقائمة</div>';
    return;
  }
  containerEl.innerHTML = pendingSessionSurahs
    .map(
      (item, idx) => `
        <div class="border rounded-2 px-2 py-2 mb-1 bg-white">
          <div class="d-flex align-items-center justify-content-between">
            <span class="small">
              <span class="fw-bold">${item.surah}</span>
              <span class="text-muted"> (الآيات ${item.from_verse} - ${item.to_verse})</span>
            </span>
            <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="removeSurahFromSessionQueue(${idx})">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="small text-muted mt-1">
            ${getRatingStarsHtml(item.rating)} · أخطاء: ${item.errors}
            ${item.notes ? `<br>ملاحظات: ${item.notes}` : ""}
          </div>
        </div>`,
    )
    .join("");
}

function addSurahToSessionQueue() {
  const surah = document.getElementById("sessSurah").value.trim();
  const from_verse = document.getElementById("sessFrom").value;
  const to_verse = document.getElementById("sessTo").value;
  const rating = document.getElementById("sessRating").value;
  const errors = document.getElementById("sessErrors").value;
  const notes = document.getElementById("sessNotes").value.trim();

  if (!isValidSurah(surah)) {
    showToast("الرجاء اختيار اسم سورة صحيح من القائمة أولاً!", "error");
    return;
  }
  if (!from_verse || !to_verse) {
    showToast("الرجاء تحديد من آية وإلى آية قبل الإضافة!", "error");
    return;
  }

  pendingSessionSurahs.push({
    surah,
    from_verse: Number(from_verse),
    to_verse: Number(to_verse),
    rating: Number(rating),
    errors: Number(errors),
    notes,
  });
  renderSessionSurahQueue();

  // تفريغ حقول السورة الحالية مشان يدخل الأستاذ السورة يلي بعدها (كل سورة إلها تقييمها وملاحظاتها الخاصة)
  document.getElementById("sessSurah").value = "";
  document.getElementById("sessFrom").value = "";
  document.getElementById("sessTo").value = "";
  document.getElementById("sessRating").value = "3";
  document.getElementById("sessErrors").value = "0";
  document.getElementById("sessNotes").value = "";
  document.getElementById("fullSurahCheck").checked = false;
  document.getElementById("sessFrom").readOnly = false;
  document.getElementById("sessTo").readOnly = false;
  document.getElementById("surahInfoLabel").innerText = "";
  showToast(`تمت إضافة سورة ${surah} للقائمة`, "success");
}

function removeSurahFromSessionQueue(index) {
  pendingSessionSurahs.splice(index, 1);
  renderSessionSurahQueue();
}

function onSurahChange() {
  const surahName = document.getElementById("sessSurah").value.trim();
  const label = document.getElementById("surahInfoLabel");
  const fromInput = document.getElementById("sessFrom");
  const toInput = document.getElementById("sessTo");
  const fullCheck = document.getElementById("fullSurahCheck");

  if (quranSurahs[surahName]) {
    const totalVerses = quranSurahs[surahName];
    label.innerText = `عدد آيات سورة ${surahName} هو: ${totalVerses} آية`;
    toInput.max = totalVerses;
    fromInput.max = totalVerses;

    if (fullCheck.checked) {
      fromInput.value = 1;
      toInput.value = totalVerses;
    }
  } else {
    label.innerText = "";
  }
}

function toggleFullSurah(checkbox) {
  const surahName = document.getElementById("sessSurah").value.trim();
  const fromInput = document.getElementById("sessFrom");
  const toInput = document.getElementById("sessTo");

  if (checkbox.checked) {
    if (quranSurahs[surahName]) {
      fromInput.value = 1;
      toInput.value = quranSurahs[surahName];
      fromInput.readOnly = true;
      toInput.readOnly = true;
    } else {
      showToast(
        "الرجاء كتابة واختيار سورة صحيحة أولاً لتفعيل هذا الخيار!",
        "error",
      );
      checkbox.checked = false;
    }
  } else {
    fromInput.readOnly = false;
    toInput.readOnly = false;
  }
}

function updateDashboardStats() {
  document.getElementById("statTotalStudents").innerText =
    appData.students.length;
  document.getElementById("statTotalSessions").innerText =
    appData.sessions.length;
  if (appData.sessions.length > 0) {
    let sum = appData.sessions.reduce((acc, curr) => acc + curr.rating, 0);
    document.getElementById("statAvgRating").innerText =
      `${(sum / appData.sessions.length).toFixed(1)} / 3`;
  } else {
    document.getElementById("statAvgRating").innerText = "0 / 3";
  }
}

function renderRecentSessionsTable() {
  const tbody = document.getElementById("recentSessionsTableBody");
  tbody.innerHTML = "";
  let sorted = [...appData.sessions].sort((a, b) => b.id - a.id).slice(0, 5);
  if (sorted.length === 0) {
    tbody.innerHTML =
      '<tr class="no-data-row"><td colspan="6" class="text-center text-muted">لا يوجد سجلات بعد</td></tr>';
    return;
  }
  sorted.forEach((s) => {
    tbody.innerHTML += `
                <tr>
                    <td data-label="الطالب" class="fw-bold">${s.student_name}</td>
                    <td data-label="الأستاذ"><span class="badge badge-teacher">${s.teacher}</span></td>
                    <td data-label="السورة"><span class="badge bg-dark text-white">${s.surah}</span></td>
                    <td data-label="الآيات">الآيات: ${s.from_verse} - ${s.to_verse}</td>
                    <td data-label="التقييم">${getRatingStarsHtml(s.rating)}</td>
                    <td data-label="التاريخ" class="text-muted small">${s.date.split(" ")[0]}</td>
                </tr>
            `;
  });
}

async function saveSession(e) {
  e.preventDefault();
  handleStudentSelect();

  setTimeout(() => {
    handleStudentSelect();
  }, 50);

  const teacher = document.getElementById("sessTeacher").value.trim();
  const studentId = document.getElementById("sessStudentHiddenId").value;
  const studentName = document
    .getElementById("sessStudentHiddenName")
    .value.trim();

  if (!studentId || !studentName) {
    showToast(
      "الرجاء كتابة واختيار اسم طالب صحيح من القائمة المنسدلة للبحث!",
      "error",
    );
    return;
  }

  // إذا في سور بالقائمة استخدمها، وإلا اعتبر الحقول الحالية سورة وحيدة (تسميع سريع لسورة وحدة)
  // كل سورة معها تقييمها وأخطاؤها وملاحظاتها الخاصة فيها
  let itemsToSave = [...pendingSessionSurahs];
  const currentSurah = document.getElementById("sessSurah").value.trim();
  if (currentSurah) {
    if (!isValidSurah(currentSurah)) {
      showToast("الرجاء اختيار اسم سورة صحيح من القائمة!", "error");
      return;
    }
    itemsToSave.push({
      surah: currentSurah,
      from_verse: Number(document.getElementById("sessFrom").value),
      to_verse: Number(document.getElementById("sessTo").value),
      rating: Number(document.getElementById("sessRating").value),
      errors: Number(document.getElementById("sessErrors").value),
      notes: document.getElementById("sessNotes").value.trim(),
    });
  }

  if (itemsToSave.length === 0) {
    showToast("الرجاء إضافة سورة واحدة على الأقل قبل الحفظ!", "error");
    return;
  }

  const now = new Date();
  const dateStr =
    now.getFullYear() +
    "-" +
    String(now.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(now.getDate()).padStart(2, "0") +
    " " +
    String(now.getHours()).padStart(2, "0") +
    ":" +
    String(now.getMinutes()).padStart(2, "0") +
    ":" +
    String(now.getSeconds()).padStart(2, "0");

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setBtnLoading(submitBtn, true, `جاري حفظ 0 من ${itemsToSave.length}...`);

  // بنبعت كل سورة على حدة بالترتيب (وحدة وحدة)، بدون أي إعادة تحميل للصفحة بينهم،
  // وبس أول ما تخلص كل السور منحدّث الشاشة مرة وحدة بالنهاية
  let successCount = 0;
  const failedSurahs = [];

  for (let i = 0; i < itemsToSave.length; i++) {
    const item = itemsToSave[i];
    setBtnLoading(
      submitBtn,
      true,
      `جاري حفظ ${i + 1} من ${itemsToSave.length}...`,
    );

    const payload = {
      action: "add_session",
      teacher: teacher,
      student_id: Number(studentId),
      student_name: studentName,
      surah: item.surah,
      from_verse: item.from_verse,
      to_verse: item.to_verse,
      rating: item.rating,
      errors: item.errors,
      notes: item.notes || "",
      date: dateStr,
      pin: APP_PIN,
    };

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(payload),
      });
      successCount++;
    } catch (err) {
      console.error(err);
      failedSurahs.push(item.surah);
    }
  }

  setBtnLoading(submitBtn, false);

  if (failedSurahs.length === 0) {
    showToast(
      successCount > 1
        ? `تم حفظ ${successCount} سور ومزامنتها بنجاح!`
        : "تم حفظ التسميع ومزامنته بنجاح!",
      "success",
    );
  } else {
    showToast(
      `تعذر حفظ بعض السور (${failedSurahs.join("، ")})، تأكد من الاتصال وأعد المحاولة.`,
      "error",
    );
  }

  // تصفير النموذج والقائمة فقط إذا انحفظت كل السور بنجاح
  if (failedSurahs.length === 0) {
    // إذا هالتسميع كان مربوط بواجب (ضغط الأستاذ "ابدأ التسميع" من لوحة الواجبات)،
    // بنحدّث حالة الواجب لـ "تم الإنجاز" تلقائياً، بدون أي خطوة إضافية من الأستاذ
    if (linkedAssignmentId) {
      updateAssignmentStatus(linkedAssignmentId, "تم الإنجاز", null);
      linkedAssignmentId = null;
    }

    pendingSessionSurahs = [];
    renderSessionSurahQueue();
    document.getElementById("sessionForm").reset();
    document.getElementById("fullSurahCheck").checked = false;
    document.getElementById("sessFrom").readOnly = false;
    document.getElementById("sessTo").readOnly = false;
    document.getElementById("surahInfoLabel").innerText = "";
    renderPendingAssignmentsPanel(null);
    switchTab("dashboard", document.querySelector(".navbar-nav .nav-link"));
  }

  fetchDataFromSheets();
}
