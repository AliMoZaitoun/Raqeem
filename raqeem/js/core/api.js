// ==============================================
// api.js — الاتصال بجوجل شيتس (جلب البيانات)
// ==============================================

function fetchDataFromSheets() {
  showLoading(true);

  const FINAL_URL =
    "https://script.google.com/macros/s/AKfycbyhEa87a5nNmcA5XZ8RmHiHMs7sRMJSiFjIy1qwryYcoqe4b8RREBn6T7gcmmFmimpeKA/exec";

  fetch(`${FINAL_URL}?action=get_all_data&t=${new Date().getTime()}`, {
    method: "GET",
    mode: "cors",
  })
    .then((res) => {
      if (!res.ok) throw new Error("HTTP error " + res.status);
      return res.json();
    })
    .then((data) => {
      appData.students = data.students || [];
      appData.sessions = data.sessions || [];
      appData.notes = data.notes || [];
      appData.assignments = data.assignments || [];

      updateDashboardStats();
      renderRecentSessionsTable();
      populateStudentsDatalist();
      renderStudentsCards();
      renderHistoryTable();
      showLoading(false);
    })
    .catch((err) => {
      console.error("الخطأ في الجلب:", err);
      showLoading(false);
    });
}

