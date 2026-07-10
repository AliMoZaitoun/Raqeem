function renderGeneralNotes(currentStudentId) {
  const notesContainer = document.getElementById("generalNotesContainer");
  notesContainer.innerHTML = "";

  const studentGeneralNotes = globalData.notes
    .filter((n) => Number(n.student_id) === Number(currentStudentId))
    .sort((a, b) => b.id - a.id);

  if (studentGeneralNotes.length === 0) {
    notesContainer.innerHTML = `
            <div class="alert alert-success m-0">
                <i class="fas fa-check-circle me-2"></i> 
                لا توجد أي ملاحظات سلوكية سلبية حالياً. الطالب ملتزم 👍
            </div>`;
  } else {
    studentGeneralNotes.forEach((n) => {
      notesContainer.innerHTML += `
                <div class="general-note-item">
                    <div class="general-note-meta">
                        <span><i class="fas fa-user-tie me-1"></i> الأستاذ: ${n.teacher}</span>
                        <span><i class="fas fa-calendar-alt me-1"></i> ${formatArabicDate(n.date)}</span>
                    </div>
                    <div class="general-note-text">${n.note_text}</div>
                </div>
            `;
    });
  }
}
