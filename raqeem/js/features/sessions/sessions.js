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
    let sum = appData.sessions.reduce(
      (acc, curr) => acc + curr.rating,
      0,
    );
    document.getElementById("statAvgRating").innerText =
      `${(sum / appData.sessions.length).toFixed(1)} / 3`;
  } else {
    document.getElementById("statAvgRating").innerText = "0 / 3";
  }
}


function renderRecentSessionsTable() {
  const tbody = document.getElementById("recentSessionsTableBody");
  tbody.innerHTML = "";
  let sorted = [...appData.sessions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);
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


function saveSession(e) {
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

  const surah = document.getElementById("sessSurah").value.trim();
  const from_verse = document.getElementById("sessFrom").value;
  const to_verse = document.getElementById("sessTo").value;
  const rating = document.getElementById("sessRating").value;
  const errors = document.getElementById("sessErrors").value;
  const notes = document.getElementById("sessNotes").value.trim();

  if (!studentId || !studentName) {
    showToast(
      "الرجاء كتابة واختيار اسم طالب صحيح من القائمة المنسدلة للبحث!",
      "error",
    );
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

  const payload = {
    action: "add_session",
    teacher: teacher,
    student_id: Number(studentId),
    student_name: studentName,
    surah: surah,
    from_verse: Number(from_verse),
    to_verse: Number(to_verse),
    rating: Number(rating),
    errors: Number(errors),
    notes: notes,
    date: dateStr,
    pin: APP_PIN,
  };

  console.log("🔍 Payload before send:", {
    teacher,
    studentId,
    studentName,
    surah,
  });

  const submitBtn = e.target.querySelector('button[type="submit"]');
  setBtnLoading(submitBtn, true, "جاري حفظ التسميع...");

  fetch(SCRIPT_URL, {
    method: "POST",
    mode: "cors",
    body: JSON.stringify(payload),
  })
    .then(() => {
      showToast("تم حفظ التسميع ومزامنته بنجاح!", "success");
      document.getElementById("sessionForm").reset();
      document.getElementById("fullSurahCheck").checked = false;
      document.getElementById("sessFrom").readOnly = false;
      document.getElementById("sessTo").readOnly = false;
      document.getElementById("surahInfoLabel").innerText = "";
      switchTab(
        "dashboard",
        document.querySelector(".navbar-nav .nav-link"),
      );
      fetchDataFromSheets();
    })
    .catch((err) => {
      console.error(err);
      showToast(
        "تعذر حفظ التسميع، تأكد من الاتصال بالإنترنت وحاول مجدداً.",
        "error",
      );
    })
    .finally(() => {
      setBtnLoading(submitBtn, false);
    });
}

