let assignmentQueues = { assign: [], profileAssign: [] };

function renderAssignmentQueue(ctx) {
  renderQueueList(
    assignmentQueues[ctx],
    document.getElementById(`${ctx}QueueList`),
    `removeFromAssignmentQueue_${ctx}`,
  );
}
function removeFromAssignmentQueue_assign(index) {
  assignmentQueues.assign.splice(index, 1);
  renderAssignmentQueue("assign");
}
function removeFromAssignmentQueue_profileAssign(index) {
  assignmentQueues.profileAssign.splice(index, 1);
  renderAssignmentQueue("profileAssign");
}

function addSurahToAssignmentQueue(ctx) {
  const surah = document.getElementById(`${ctx}Surah`).value.trim();
  const fromVerse = document.getElementById(`${ctx}From`).value.trim();
  const toVerse = document.getElementById(`${ctx}To`).value.trim();

  if (!isValidSurah(surah)) {
    showToast("الرجاء اختيار اسم سورة صحيح من القائمة أولاً!", "error");
    return;
  }

  assignmentQueues[ctx].push({
    surah,
    from_verse: fromVerse || "1",
    to_verse: toVerse || String(quranSurahs[surah]),
  });
  renderAssignmentQueue(ctx);

  document.getElementById(`${ctx}Surah`).value = "";
  document.getElementById(`${ctx}From`).value = "";
  document.getElementById(`${ctx}To`).value = "";
  showToast(`تمت إضافة سورة ${surah} لواجب التسميع`, "success");
}

function renderRecitedSurahsHint(ctx, studentId) {
  const container = document.getElementById(`${ctx}RecitedHint`);
  if (!container) return;

  if (!studentId || !appData.sessions) {
    container.classList.add("d-none");
    container.innerHTML = "";
    return;
  }

  const studentSessions = appData.sessions
    .filter((s) => Number(s.student_id) === Number(studentId))
    .sort((a, b) => b.id - a.id);

  if (studentSessions.length === 0) {
    container.classList.add("d-none");
    container.innerHTML = "";
    return;
  }

  const seen = new Set();
  const uniqueRecited = [];
  studentSessions.forEach((s) => {
    if (!seen.has(s.surah)) {
      seen.add(s.surah);
      uniqueRecited.push(s);
    }
  });

  const chipsHtml = uniqueRecited
    .map(
      (s) =>
        `<span class="recited-hint-chip">${s.surah} (${s.from_verse}-${s.to_verse})</span>`,
    )
    .join("");

  container.classList.remove("d-none");
  container.innerHTML = `
    <div class="recited-hint-header" onclick="toggleRecitedHint('${ctx}')">
      <span class="recited-hint-title">
        <i class="fas fa-circle-check"></i>
        سمّع ${uniqueRecited.length} سورة سابقاً (آخر سورة: ${studentSessions[0].surah})
      </span>
      <i class="fas fa-chevron-down recited-hint-chevron" id="${ctx}RecitedChevron"></i>
    </div>
    <div class="recited-hint-chips-wrap" id="${ctx}RecitedChipsWrap">
      <div class="recited-hint-chips">${chipsHtml}</div>
    </div>
  `;
}

function toggleRecitedHint(ctx) {
  const chevron = document.getElementById(`${ctx}RecitedChevron`);
  const wrap = document.getElementById(`${ctx}RecitedChipsWrap`);
  if (!chevron || !wrap) return;
  chevron.classList.toggle("open");
  wrap.classList.toggle("open");
}

function toggleAssignmentType(ctx) {
  const isTestJuz = document.getElementById(`${ctx}TypeTest`).checked;
  const isTestSurah = document.getElementById(`${ctx}TypeTestSurah`).checked;
  const isRecitation = !isTestJuz && !isTestSurah;

  document
    .getElementById(`${ctx}RecitationFields`)
    .classList.toggle("d-none", !isRecitation);
  document
    .getElementById(`${ctx}TestSurahFields`)
    .classList.toggle("d-none", !isTestSurah);
  document
    .getElementById(`${ctx}TestFields`)
    .classList.toggle("d-none", !isTestJuz);

  if (isTestJuz) {
    populateJuzSelect(document.getElementById(`${ctx}Juz`));
  }
}

async function saveStudentAssignment(btnEl, ctx) {
  let studentId, studentName;

  if (ctx === "assign") {
    studentId = document.getElementById("sessStudentHiddenId").value;
    studentName = document.getElementById("sessStudentHiddenName").value;
  } else {
    studentId = document.getElementById("noteStudentId").value;
    studentName = document.getElementById("profName").innerText;
  }

  if (!studentId || !studentName) {
    showToast("الرجاء اختيار طالب صحيح أولاً!", "error");
    return;
  }

  const isTestJuz = document.getElementById(`${ctx}TypeTest`).checked;
  const isTestSurah = document.getElementById(`${ctx}TypeTestSurah`).checked;
  let itemsToSave = [];

  if (isTestJuz) {
    const juz = document.getElementById(`${ctx}Juz`).value;
    if (!juz) {
      showToast("الرجاء اختيار رقم الجزء المطلوب اختباره!", "error");
      return;
    }
    itemsToSave = [
      {
        surah: `اختبار جزء ${juz}`,
        from_verse: "",
        to_verse: "",
      },
    ];
  } else if (isTestSurah) {
    const testSurah = document.getElementById(`${ctx}TestSurah`).value.trim();
    if (!isValidSurah(testSurah)) {
      showToast("الرجاء اختيار اسم سورة صحيح من القائمة!", "error");
      return;
    }
    itemsToSave = [
      {
        surah: `اختبار سورة ${testSurah}`,
        from_verse: "",
        to_verse: "",
      },
    ];
  } else {
    itemsToSave = [...assignmentQueues[ctx]];
    const currentSurah = document.getElementById(`${ctx}Surah`).value.trim();
    if (currentSurah) {
      if (!isValidSurah(currentSurah)) {
        showToast("الرجاء اختيار اسم سورة صحيح من القائمة!", "error");
        return;
      }
      itemsToSave.push({
        surah: currentSurah,
        from_verse: document.getElementById(`${ctx}From`).value.trim() || "1",
        to_verse:
          document.getElementById(`${ctx}To`).value.trim() ||
          String(quranSurahs[currentSurah]),
      });
    }
    if (itemsToSave.length === 0) {
      showToast("الرجاء إضافة سورة واحدة على الأقل للواجب!", "error");
      return;
    }
  }

  setBtnLoading(btnEl, true, `جاري حفظ 0 من ${itemsToSave.length}...`);

  let successCount = 0;
  const failedItems = [];

  for (let i = 0; i < itemsToSave.length; i++) {
    const item = itemsToSave[i];
    setBtnLoading(btnEl, true, `جاري حفظ ${i + 1} من ${itemsToSave.length}...`);

    const payload = {
      action: "add_assignment",
      student_id: Number(studentId),
      student_name: studentName,
      surah: item.surah,
      from_verse: item.from_verse,
      to_verse: item.to_verse,
    };

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        mode: "cors",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.status === "success") {
        successCount++;
      } else {
        failedItems.push(item.surah);
      }
    } catch (err) {
      console.error(err);
      failedItems.push(item.surah);
    }
  }

  setBtnLoading(btnEl, false);

  if (failedItems.length === 0) {
    showToast(
      successCount > 1
        ? `تم تسجيل ${successCount} واجبات بنجاح!`
        : "تم تسجيل الواجب بنجاح!",
      "success",
    );
    assignmentQueues[ctx] = [];
    renderAssignmentQueue(ctx);
    if (document.getElementById(`${ctx}Surah`))
      document.getElementById(`${ctx}Surah`).value = "";
    if (document.getElementById(`${ctx}From`))
      document.getElementById(`${ctx}From`).value = "";
    if (document.getElementById(`${ctx}To`))
      document.getElementById(`${ctx}To`).value = "";
    if (document.getElementById(`${ctx}Juz`))
      document.getElementById(`${ctx}Juz`).value = "";
    if (document.getElementById(`${ctx}TestSurah`))
      document.getElementById(`${ctx}TestSurah`).value = "";
  } else {
    showToast(
      `تعذر تسجيل بعض الواجبات (${failedItems.join("، ")})، حاول مجدداً.`,
      "error",
    );
  }

  fetchDataFromSheets();
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
      <option value="قيد التحضير" ${assign.status == "قيد التحضير" ? "selected" : ""}>⏳ قيد التحضير</option>
      <option value="تم الإنجاز" ${isDone ? "selected" : ""}>✅ تم الإنجاز</option>
      <option value="لم ينجز" ${isFailed ? "selected" : ""}>❌ لم ينجز</option>
  </select>
</td>
    </tr>`;
    container.innerHTML += row;
  });
}

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

function togglePendingAssignPanel() {
  const header = document.querySelector(
    "#sessionPendingAssignmentsWrap .pending-assign-header",
  );
  const body = document.getElementById("pendingAssignBody");
  if (!header || !body) return;
  header.classList.toggle("open");
  body.classList.toggle("open");
}

function renderPendingAssignmentsPanel(studentId) {
  const wrap = document.getElementById("sessionPendingAssignmentsWrap");
  const body = document.getElementById("pendingAssignBody");
  const countBadge = document.getElementById("pendingAssignCountBadge");
  const header = document.querySelector(
    "#sessionPendingAssignmentsWrap .pending-assign-header",
  );
  if (!wrap || !body || !countBadge || !header) return;

  if (!studentId || !appData.assignments) {
    wrap.classList.add("d-none");
    return;
  }

  const pendingAssignments = appData.assignments.filter(
    (a) =>
      Number(a.student_id) === Number(studentId) && a.status === "قيد التحضير",
  );

  wrap.classList.remove("d-none");
  countBadge.innerText = pendingAssignments.length;

  if (pendingAssignments.length === 0) {
    body.innerHTML =
      '<div class="pending-assign-empty">🎉 لا توجد واجبات قيد التحضير لهذا الطالب حالياً</div>';
    header.classList.remove("open");
    body.classList.remove("open");
    return;
  }

  body.innerHTML = pendingAssignments
    .map((assign) => {
      const colorClass = getAssignmentStatusColorClass(assign.status);
      const hasVerses = assign.from_verse && assign.to_verse;
      return `
        <div class="pending-assign-row">
          <div class="pending-assign-info">
            <span class="surah-name">${assign.surah}</span>
            ${hasVerses ? `<span class="verse-range">الآيات ${assign.from_verse} - ${assign.to_verse}</span>` : ""}
          </div>
          ${
            hasVerses
              ? `<button type="button" class="btn btn-sm btn-success pending-assign-start-btn" onclick="startSessionFromAssignment('${assign.id}')">
                  <i class="fas fa-play me-1"></i>ابدأ التسميع
                </button>`
              : ""
          }
          <select
            class="form-select pending-assign-status-select ${colorClass}"
            onchange="updateAssignmentStatus('${assign.id}', this.value, this)"
          >
            <option value="قيد التحضير" selected>⏳ قيد التحضير</option>
            <option value="تم الإنجاز">✅ تم الإنجاز</option>
            <option value="لم ينجز">❌ لم ينجز</option>
          </select>
        </div>`;
    })
    .join("");

  header.classList.add("open");
  body.classList.add("open");
}
