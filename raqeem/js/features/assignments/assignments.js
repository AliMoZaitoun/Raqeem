let assignmentQueues = { assign: [], profileAssign: [] };

function renderAssignmentQueue(ctx) {
  renderQueueList(
    assignmentQueues[ctx],
    document.getElementById(`${ctx}QueueList`),
    `removeFromAssignmentQueue_${ctx}`,
  );
}
// دوال حذف منفصلة بالاسم لكل context (مطلوبة لأن onclick بالـ HTML بستدعي بالاسم مباشرة)
function removeFromAssignmentQueue_assign(index) {
  assignmentQueues.assign.splice(index, 1);
  renderAssignmentQueue("assign");
}
function removeFromAssignmentQueue_profileAssign(index) {
  assignmentQueues.profileAssign.splice(index, 1);
  renderAssignmentQueue("profileAssign");
}

// إضافة سورة لقائمة انتظار الواجب (وضع "تسميع")، موحّدة لأي نموذج عبر الـ ctx
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

// تبديل عرض وضع "تسميع سورة/سور" مقابل وضع "اختبار جزء"، موحّد لأي نموذج عبر الـ ctx
function toggleAssignmentType(ctx) {
  const isTest = document.getElementById(`${ctx}TypeTest`).checked;
  document.getElementById(`${ctx}RecitationFields`).classList.toggle(
    "d-none",
    isTest,
  );
  document.getElementById(`${ctx}TestFields`).classList.toggle(
    "d-none",
    !isTest,
  );
  if (isTest) {
    populateJuzSelect(document.getElementById(`${ctx}Juz`));
  }
}

// الدالة الموحّدة الوحيدة لحفظ الواجب، تُستدعى من مكانين بنفس الطريقة تماماً
// btnEl: الزر اللي انضغط (لعرض حالة التحميل عليه)
// ctx: "assign" (نموذج تسميع جديد) أو "profileAssign" (تبويب الواجبات بالبروفايل)
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

  const isTest = document.getElementById(`${ctx}TypeTest`).checked;
  let itemsToSave = [];

  if (isTest) {
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
        from_verse:
          document.getElementById(`${ctx}From`).value.trim() || "1",
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
    // تصفير الحقول والقائمة بعد نجاح كامل
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

