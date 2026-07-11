function renderAssignments(stAssignments) {
  const container = document.getElementById("parentAssignmentsContainer");
  container.innerHTML = "";

  if (stAssignments.length === 0) {
    container.innerHTML = `
            <div class="alert alert-info text-center py-4 mb-0">
                <i class="fas fa-book-open fa-2x mb-3 text-muted"></i><br>
                لا توجد واجبات منزلية محددة حالياً.
            </div>`;
    return;
  }

  function getStatusHTML(status) {
    if (status === "تم الإنجاز") {
      return `<span class="badge bg-success fs-6 px-3 py-2">تم إنجازه 🏆</span>`;
    } else if (status === "لم ينجز") {
      return `<span class="badge bg-danger fs-6 px-3 py-2">لم يتم حفظه ❌</span>`;
    }
    return `<span class="badge bg-warning text-dark fs-6 px-3 py-2">جاري التحضير 📖</span>`;
  }

  const current = stAssignments[0];
  const history = stAssignments.slice(1);

  let html = `
        <div class="current-assignment-card">
            <span class="current-assignment-tag"><i class="fas fa-star"></i> الواجب الحالي</span>
            <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                <div>
                    <h5 class="fw-bold text-primary mb-1">${current.surah}</h5>
                    ${current.from_verse && current.to_verse ? `<small class="text-muted">من الآية ${current.from_verse} إلى ${current.to_verse}</small>` : ""}
                </div>
                <div>${getStatusHTML(current.status)}</div>
            </div>
            <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                <small class="text-muted">
                    <i class="fas fa-calendar-alt me-1"></i> ${formatArabicDate(current.date)}
                </small>
            </div>
        </div>
    `;

  if (history.length > 0) {
    let historyItemsHtml = "";
    history.forEach((a) => {
      historyItemsHtml += `
                <div class="assignment-history-item">
                    <div>
                        <span class="fw-bold text-dark">${a.surah}</span>
                        ${a.from_verse && a.to_verse ? `<span class="small text-muted">— الآيات ${a.from_verse} إلى ${a.to_verse}</span>` : ""}
                        <div class="small text-muted mt-1">
                            <i class="fas fa-calendar-alt me-1"></i>${formatArabicDate(a.date)}
                        </div>
                    </div>
                    <div>${getStatusHTML(a.status)}</div>
                </div>
            `;
    });

    html += `
            <div class="assignment-history-toggle" onclick="this.nextElementSibling.classList.toggle('open'); 
                this.querySelector('.p-timeline-toggle-icon').classList.toggle('fa-chevron-down');
                this.querySelector('.p-timeline-toggle-icon').classList.toggle('fa-chevron-up');">
                <span><i class="fas fa-clock-rotate-left me-1"></i> السجل السابق (${history.length})</span>
                <i class="fas fa-chevron-down p-timeline-toggle-icon"></i>
            </div>
            <div class="assignment-history-body">${historyItemsHtml}</div>
        `;
  }

  container.innerHTML = html;
}
