function formatArabicDate(dateStr) {
  if (!dateStr) return "-";
  try {
    let str = dateStr.toString().trim();
    if (str.includes("T")) str = str.split("T")[0];
    let onlyDate = str.split(" ")[0];
    let parts = onlyDate.includes("-")
      ? onlyDate.split("-")
      : onlyDate.split("/");
    if (parts.length !== 3) return onlyDate;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  } catch (e) {
    return dateStr.toString().split(" ")[0];
  }
}

function getDayKey(dateStr) {
  if (!dateStr) return "-";
  const str = dateStr.toString().trim();
  const d = new Date(str.includes(" ") ? str.replace(" ", "T") : str);
  if (!isNaN(d.getTime())) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }
  return str.includes("T") ? str.split("T")[0] : str.split(" ")[0];
}

function getStars(rating) {
  let html = "";
  for (let i = 1; i <= 3; i++) {
    if (i <= rating) {
      html += '<i class="fas fa-star rating-stars"></i>';
    } else {
      html += '<i class="far fa-star text-muted"></i>';
    }
  }
  return html;
}

function showLoading(status) {
  const overlay = document.getElementById("loadingOverlay");
  if (status) {
    overlay.classList.remove("d-none");
  } else {
    overlay.classList.add("d-none");
  }
}
