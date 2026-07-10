function renderSummaryCards(sessions) {
  if (sessions.length === 0) return;

  const total = sessions.length;
  const avgRating = (
    sessions.reduce((sum, s) => sum + Number(s.rating || 0), 0) / total
  ).toFixed(1);
  const totalErrors = sessions.reduce(
    (sum, s) => sum + Number(s.errors || 0),
    0,
  );
  const bestRating = Math.max(...sessions.map((s) => Number(s.rating || 0)));

  document.getElementById("summaryCards").innerHTML = `
        <div class="col-6 col-md-3">
            <div class="performance-card">
                <h4 class="text-success mb-1">${avgRating} <i class="fas fa-star"></i></h4>
                <small class="text-muted">متوسط التقييم</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="performance-card">
                <h4 class="mb-1">${totalErrors}</h4>
                <small class="text-muted">إجمالي الأخطاء</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="performance-card">
                <h4 class="text-primary mb-1">${bestRating} <i class="fas fa-star"></i></h4>
                <small class="text-muted">أعلى تقييم</small>
            </div>
        </div>
        <div class="col-6 col-md-3">
            <div class="performance-card">
                <h4 class="text-success mb-1">${total}</h4>
                <small class="text-muted">جلسة تسميع</small>
            </div>
        </div>
    `;
}

function populateMonthFilter(sessions) {
  const select = document.getElementById("monthFilter");
  select.innerHTML = '<option value="">كل الشهور</option>'; // reset

  const months = new Set();
  sessions.forEach((s) => {
    const d = new Date(s.date);
    months.add(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    );
  });

  Array.from(months)
    .sort()
    .reverse()
    .forEach((key) => {
      const [year, month] = key.split("-");
      const monthName = new Date(year, parseInt(month) - 1).toLocaleDateString(
        "ar-SA",
        { month: "long" },
      );
      const option = document.createElement("option");
      option.value = key;
      option.textContent = `${monthName} ${year}`;
      select.appendChild(option);
    });
}

function filterTimeline() {
  const dayVal = document.getElementById("dayFilter").value;
  const monthVal = document.getElementById("monthFilter").value;

  let filtered = currentStudentSessions;

  if (dayVal) {
    filtered = filtered.filter((s) => getDayKey(s.date) === dayVal);
  } else if (monthVal) {
    filtered = filtered.filter((s) => {
      const d = new Date(s.date);
      return (
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}` ===
        monthVal
      );
    });
  }

  renderSessionsTimeline(filtered);
}

function renderSessionsTimeline(stSessions) {
  const container = document.getElementById("parentSessionsTimeline");
  container.innerHTML = "";

  if (stSessions.length === 0) {
    container.innerHTML =
      '<div class="text-center text-muted py-5">لا يوجد أي عمليات تسميع مسجلة بعد.</div>';
    return;
  }

  const groupsMap = new Map();
  stSessions.forEach((s) => {
    const dayKey = getDayKey(s.date);
    if (!groupsMap.has(dayKey)) groupsMap.set(dayKey, []);
    groupsMap.get(dayKey).push(s);
  });

  const timelineEl = document.createElement("div");
  timelineEl.className = "p-timeline";

  groupsMap.forEach((sessions, dayKey) => {
    const nodeEl = document.createElement("div");
    nodeEl.className = "p-timeline-node";

    let itemsHtml = "";
    sessions.forEach((s) => {
      let noteClass = "tasmiah-note-box";
      if (
        s.errors > 3 ||
        (s.notes && (s.notes.includes("إعادة") || s.notes.includes("ضعيف")))
      ) {
        noteClass += " note-important";
      }

      itemsHtml += `
                <div class="p-timeline-session-item mb-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <span class="badge badge-teacher">${s.teacher}</span>
                            <span class="badge bg-dark ms-2">${s.surah}</span>
                        </div>
                        <div class="text-end">
                            ${getStars(s.rating)}
                            <span class="badge bg-danger ms-2">أخطاء: ${s.errors}</span>
                        </div>
                    </div>
                    <div class="${noteClass} mt-2">${s.notes || "لا توجد ملاحظات"}</div>
                    <small class="text-muted d-block mt-1">من ${s.from_verse} إلى ${s.to_verse}</small>
                </div>
            `;
    });

    nodeEl.innerHTML = `
            <span class="p-timeline-dot"></span>
            <div class="p-timeline-header" onclick="this.parentElement.classList.toggle('open')">
                <div class="p-timeline-header-info">
                    <i class="fas fa-calendar-day me-2" style="color:#228b22"></i>
                    <span class="p-timeline-date">${formatArabicDate(dayKey)}</span>
                </div>
                <div>
                    <span class="p-timeline-count">${sessions.length} جلسة</span>
                    <i class="fas fa-chevron-down p-timeline-toggle-icon ms-2"></i>
                </div>
            </div>
            <div class="p-timeline-body">
                <div class="p-timeline-sessions">${itemsHtml}</div>
            </div>
        `;

    timelineEl.appendChild(nodeEl);
  });

  container.appendChild(timelineEl);
}
