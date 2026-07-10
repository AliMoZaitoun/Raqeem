// ==============================================
// main.js — تشغيل التطبيق عند تحميل الصفحة
// ==============================================

window.addEventListener("DOMContentLoaded", () => {
  initSurahDatalist();
  const savedPin = localStorage.getItem("app_secure_pin");
  if (savedPin === APP_PIN) {
    document.getElementById("lockScreen").classList.add("d-none");
    document.getElementById("appMainContent").classList.remove("d-none");
    fetchDataFromSheets();
  }
});

