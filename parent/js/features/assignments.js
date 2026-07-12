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

    // فصل الواجبات: حالية + سابقة
    const currentAssignments = stAssignments.filter(a => 
        a.status !== "تم الإنجاز"
    );

    const completedAssignments = stAssignments.filter(a => 
        a.status === "تم الإنجاز"
    );

    let html = `<h6 class="fw-bold text-success mb-3"><i class="fas fa-tasks me-2"></i> الواجبات الحالية</h6>`;

    if (currentAssignments.length === 0) {
        html += `<div class="alert alert-success py-3">جميع الواجبات السابقة تم إنجازها ✓</div>`;
    } else {
        currentAssignments.forEach(assign => {
            html += `
                <div class="current-assignment-card mb-3">
                    <span class="current-assignment-tag">
                        <i class="fas fa-star"></i> الواجب الحالي
                    </span>
                    <div class="d-flex justify-content-between align-items-start flex-wrap gap-2">
                        <div>
                            <h5 class="fw-bold text-primary mb-1">${assign.surah}</h5>
                            ${assign.from_verse && assign.to_verse ? 
                                `<small class="text-muted">من الآية ${assign.from_verse} إلى ${assign.to_verse}</small>` : ""}
                        </div>
                        <div>${getStatusHTML(assign.status)}</div>
                    </div>
                    <div class="mt-3 pt-3 border-top d-flex justify-content-between align-items-center">
                        <small class="text-muted">
                            <i class="fas fa-calendar-alt me-1"></i> ${formatArabicDate(assign.date)}
                        </small>
                    </div>
                </div>
            `;
        });
    }

    // السجل السابق (المنجز فقط)
    if (completedAssignments.length > 0) {
        let historyItemsHtml = "";
        completedAssignments.forEach(a => {
            historyItemsHtml += `
                <div class="assignment-history-item">
                    <div>
                        <span class="fw-bold text-dark">${a.surah}</span>
                        ${a.from_verse && a.to_verse ? 
                            `<span class="small text-muted">— الآيات ${a.from_verse} إلى ${a.to_verse}</span>` : ""}
                        <div class="small text-muted mt-1">
                            <i class="fas fa-calendar-alt me-1"></i>${formatArabicDate(a.date)}
                        </div>
                    </div>
                    <div>${getStatusHTML(a.status)}</div>
                </div>
            `;
        });

        html += `
            <div class="assignment-history-toggle mt-4" onclick="
                this.nextElementSibling.classList.toggle('open'); 
                this.querySelector('.p-timeline-toggle-icon').classList.toggle('fa-chevron-down');
                this.querySelector('.p-timeline-toggle-icon').classList.toggle('fa-chevron-up');
            ">
                <span><i class="fas fa-clock-rotate-left me-1"></i> السجل السابق (${completedAssignments.length})</span>
                <i class="fas fa-chevron-down p-timeline-toggle-icon"></i>
            </div>
            <div class="assignment-history-body">${historyItemsHtml}</div>
        `;
    }

    container.innerHTML = html;
}
