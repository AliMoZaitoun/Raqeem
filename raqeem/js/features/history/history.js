// ==============================================
// history.js — السجل التاريخي الكامل
// ==============================================

function renderHistoryTable(filteredList = null) {
  const tbody = document.getElementById("historyTableBody");
  tbody.innerHTML = "";
  let list = filteredList ? filteredList : appData.sessions;
  let sorted = [...list].sort((a, b) => b.id - a.id);
  if (sorted.length === 0) {
    tbody.innerHTML =
      '<tr class="no-data-row"><td colspan="8" class="text-center text-muted">لا توجد سجلات</td></tr>';
    return;
  }
  sorted.forEach((s) => {
    tbody.innerHTML += `
                <tr>
                    <td data-label="المعرف">#${s.id}</td>
                    <td data-label="اسم الطالب" class="fw-bold">${s.student_name}</td>
                    <td data-label="الأستاذ"><span class="badge badge-teacher">${s.teacher}</span></td>
                    <td data-label="السورة والآيات"><span class="badge bg-dark">${s.surah}</span> آية ${s.from_verse} إلى ${s.to_verse}</td>
                    <td data-label="التقييم">${getRatingStarsHtml(s.rating)}</td>
                    <td data-label="الأخطاء"><span class="badge bg-danger rounded-pill">${s.errors}</span></td>
                    <td data-label="الملاحظات" class="small text-secondary">${s.notes || "-"}</td>
                    <td data-label="التاريخ" class="small text-muted">${s.date}</td>
                </tr>
            `;
  });
}


function filterHistoryTable() {
  const q = document
    .getElementById("historySearchInput")
    .value.toLowerCase()
    .trim();
  if (!q) {
    renderHistoryTable();
    return;
  }
  let res = appData.sessions.filter(
    (s) =>
      String(s.student_name || "")
        .toLowerCase()
        .includes(q) ||
      String(s.teacher || "")
        .toLowerCase()
        .includes(q) ||
      String(s.surah || "")
        .toLowerCase()
        .includes(q),
  );
  renderHistoryTable(res);
}

