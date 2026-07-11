// ==============================================
// ui-helpers.js — أدوات واجهة عامة (تنبيهات، تحميل، تبويبات)
// ==============================================

function showLoading(status) {
  const overlay = document.getElementById("loadingOverlay");
  if (status) overlay.classList.remove("d-none");
  else overlay.classList.add("d-none");
}

/* ============================================= */
/* تنبيهات عصرية (Toast) بدل alert الافتراضي       */
/* ============================================= */

function showToast(message, type = "success") {
  const container = document.getElementById("appToastContainer");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `app-toast app-toast-${type}`;
  const icon =
    type === "success" ? "fa-circle-check" : "fa-circle-exclamation";
  const title = type === "success" ? "تم بنجاح" : "حدث خطأ";

  toast.innerHTML = `
    <div class="app-toast-icon"><i class="fas ${icon}"></i></div>
    <div class="app-toast-body">
      <div class="app-toast-title">${title}</div>
      <div class="app-toast-msg"></div>
    </div>
    <button type="button" class="app-toast-close" aria-label="إغلاق">
      <i class="fas fa-xmark"></i>
    </button>
    <div class="app-toast-progress"></div>
  `;
  // إدخال النص كـ textContent لمنع أي مشاكل تنسيق إذا كانت الرسالة تحتوي رموزاً خاصة
  toast.querySelector(".app-toast-msg").textContent = message;

  const removeToast = () => {
    toast.classList.remove("show");
    toast.classList.add("hide");
    setTimeout(() => toast.remove(), 300);
  };

  toast
    .querySelector(".app-toast-close")
    .addEventListener("click", removeToast);

  container.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add("show"));

  const autoTimer = setTimeout(removeToast, 3800);
  toast.addEventListener("mouseenter", () => clearTimeout(autoTimer));
}

/* تفعيل / إلغاء حالة التحميل على أي زر حفظ */

function setBtnLoading(btn, isLoading, loadingText = "جاري الحفظ...") {
  if (!btn) return;
  if (isLoading) {
    if (!btn.dataset.originalHtml) {
      btn.dataset.originalHtml = btn.innerHTML;
    }
    btn.disabled = true;
    btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status"></span>${loadingText}`;
  } else {
    btn.disabled = false;
    if (btn.dataset.originalHtml) {
      btn.innerHTML = btn.dataset.originalHtml;
      delete btn.dataset.originalHtml;
    }
  }
}


function switchTab(tabId, element) {
  document
    .querySelectorAll("#appMainContent .tab-content")
    .forEach((el) => el.classList.add("d-none"));
  document.getElementById(tabId).classList.remove("d-none");
  document
    .querySelectorAll(".nav-link")
    .forEach((el) => el.classList.remove("active"));
  element.classList.add("active");
}


function getRatingStarsHtml(rating) {
  let stars = "";
  for (let i = 1; i <= 3; i++) {
    if (i <= rating) stars += '<i class="fas fa-star rating-stars"></i>';
    else stars += '<i class="far fa-star text-muted"></i>';
  }
  return stars;
}


function getAssignmentStatusColorClass(status) {
  if (status == "تم الإنجاز") return "text-success fw-bold";
  if (status == "لم ينجز") return "text-danger fw-bold";
  return "text-warning fw-bold";
}

// تتحقق أنو اسم السورة المكتوب موجود فعلياً بقائمة السور الرسمية (quranSurahs)
// هاي أهم نقطة مشتركة: أي مكان بالتطبيق بدو يتحقق من سورة، يستخدم هاي الدالة
function isValidSurah(surahName) {
  return Object.prototype.hasOwnProperty.call(
    quranSurahs,
    (surahName || "").trim(),
  );
}

// تعبئة أي select بقائمة الأجزاء 1-30 (تُستخدم بخيار "اختبار جزء")
function populateJuzSelect(selectEl) {
  if (!selectEl) return;
  selectEl.innerHTML = '<option value="">اختر الجزء...</option>';
  juzList.forEach((j) => {
    selectEl.innerHTML += `<option value="${j}">الجزء ${j}</option>`;
  });
}

// دالة عرض موحّدة لأي "قائمة انتظار" عناصر (سور تسميع أو سور واجب)
// items: مصفوفة عناصر فيها surah/from_verse/to_verse على الأقل
// containerEl: العنصر اللي رح تترسم فيه القائمة
// onRemove: دالة تستدعى مع index العنصر عند الضغط على زر الحذف
function renderQueueList(items, containerEl, onRemoveName) {
  if (!containerEl) return;
  if (!items.length) {
    containerEl.innerHTML =
      '<div class="text-muted small fst-italic">لسا ما ضفت ولا سورة للقائمة</div>';
    return;
  }
  containerEl.innerHTML = items
    .map(
      (item, idx) => `
        <div class="d-flex align-items-center justify-content-between border rounded-2 px-2 py-1 mb-1 bg-white">
          <span class="small">
            <span class="fw-bold">${item.surah}</span>
            ${item.from_verse || item.to_verse ? `<span class="text-muted"> (${item.from_verse || 1} - ${item.to_verse || quranSurahs[item.surah] || ""})</span>` : ""}
          </span>
          <button type="button" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="${onRemoveName}(${idx})">
            <i class="fas fa-times"></i>
          </button>
        </div>`,
    )
    .join("");
}

