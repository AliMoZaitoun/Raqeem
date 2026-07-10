// ==============================================
// auth.js — القفل الآمن والتحقق من الرمز السري
// ==============================================

function verifyPin() {
  const inputVal = document.getElementById("pinInputField").value;
  const errorMsg = document.getElementById("pinErrorMsg");
  if (inputVal === APP_PIN) {
    localStorage.setItem("app_secure_pin", APP_PIN);
    errorMsg.classList.add("d-none");
    document.getElementById("lockScreen").classList.add("d-none");
    document.getElementById("appMainContent").classList.remove("d-none");
    fetchDataFromSheets();
  } else {
    errorMsg.classList.remove("d-none");
    document.getElementById("pinInputField").value = "";
    document.getElementById("pinInputField").focus();
  }
}

function lockApp() {
  localStorage.removeItem("app_secure_pin");
  document.getElementById("pinInputField").value = "";
  document.getElementById("appMainContent").classList.add("d-none");
  document.getElementById("lockScreen").classList.remove("d-none");
}

