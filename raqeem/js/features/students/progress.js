// ==============================================
// progress.js — حساب وعرض تقدم الطالب بحفظ القرآن الكريم
// ==============================================
//
// ملاحظة مهمة عن الدقة:
// - "عدد السور المكتملة" و "عدد الآيات المحفوظة" مقاييس دقيقة 100%،
//   محسوبة من سجل التسميع الفعلي (appData.sessions) بعد دمج أي تداخل
//   بين الجلسات (مثلاً لو سمّع نفس السورة على دفعتين متفرقتين).
// - "عدد الأجزاء" و "عدد الصفحات" مقاييس تقريبية (تقديرية)، محسوبة
//   كنسبة من إجمالي الآيات المحفوظة. السبب: الأجزاء والصفحات مش موزّعة
//   بالتساوي على السور (كل جزء بين ١٤٨-٣٤٦ آية تقريباً)، وحساب دقيق
//   يحتاج جدول حدود كل جزء وكل صفحة بالمصحف، وهاد مش موجود حالياً
//   بالتطبيق. القيم التقريبية كافية لإعطاء صورة عامة عن التقدّم.

const TOTAL_QURAN_AYAHS = Object.values(quranSurahs).reduce((a, b) => a + b, 0); // 6236
const TOTAL_QURAN_SURAHS = Object.keys(quranSurahs).length; // 114
const TOTAL_QURAN_JUZ = 30;
const TOTAL_QURAN_PAGES = 604; // الطباعة المدنية الشائعة

// بتدمج أي نطاقات آيات متداخلة أو متلاصقة، مشان ما نعد نفس الآية مرتين
// إذا الطالب سمّع نفس المقطع أكتر من مرة، أو سمّع السورة على دفعات
function mergeVerseRanges(ranges) {
  const sorted = [...ranges].sort((a, b) => a[0] - b[0]);
  const merged = [];
  sorted.forEach(([start, end]) => {
    if (merged.length && start <= merged[merged.length - 1][1] + 1) {
      merged[merged.length - 1][1] = Math.max(
        merged[merged.length - 1][1],
        end,
      );
    } else {
      merged.push([start, end]);
    }
  });
  return merged;
}

function calculateStudentProgress(studentId) {
  const sessions = (appData.sessions || []).filter(
    (s) => Number(s.student_id) === Number(studentId),
  );

  const bySurah = {};
  sessions.forEach((s) => {
    if (!quranSurahs[s.surah]) return; // تجاهل أي قيمة مش من قائمة السور الرسمية (متل سجلات اختبار الجزء)
    if (!bySurah[s.surah]) bySurah[s.surah] = [];
    bySurah[s.surah].push([Number(s.from_verse), Number(s.to_verse)]);
  });

  let memorizedAyahs = 0;
  let completedSurahsCount = 0;
  const completedSurahsList = [];

  Object.keys(bySurah).forEach((surah) => {
    const merged = mergeVerseRanges(bySurah[surah]);
    let ayahsInSurah = merged.reduce(
      (sum, [start, end]) => sum + (end - start + 1),
      0,
    );
    ayahsInSurah = Math.min(ayahsInSurah, quranSurahs[surah]); // حماية من بيانات مدخلة بالغلط تتجاوز عدد آيات السورة
    memorizedAyahs += ayahsInSurah;
    if (ayahsInSurah >= quranSurahs[surah]) {
      completedSurahsCount++;
      completedSurahsList.push(surah);
    }
  });

  const percentage =
    TOTAL_QURAN_AYAHS > 0 ? (memorizedAyahs / TOTAL_QURAN_AYAHS) * 100 : 0;

  return {
    completedSurahsCount,
    completedSurahsList,
    totalSurahs: TOTAL_QURAN_SURAHS,
    memorizedAyahs,
    totalAyahs: TOTAL_QURAN_AYAHS,
    percentage,
    estimatedJuz: (percentage / 100) * TOTAL_QURAN_JUZ,
    estimatedPages: Math.round((percentage / 100) * TOTAL_QURAN_PAGES),
  };
}

// بترسم لوحة التقدم بأي حاوية معطاة (نفس الدالة تُستخدم بتطبيق الأستاذ
// وبتطبيق الأهل، بس لازم appData و quranSurahs يكونوا معرّفين بنفس الصفحة)
function renderProgressPanel(containerEl, studentId) {
  if (!containerEl) return;

  const p = calculateStudentProgress(studentId);
  const pct = Math.min(100, p.percentage).toFixed(1);

  containerEl.innerHTML = `
    <div class="progress-panel-card">
      <div class="progress-panel-header">
        <span class="progress-panel-title">
          <i class="fas fa-chart-line"></i> تقدّم الحفظ الإجمالي
        </span>
        <span class="progress-panel-pct">${pct}%</span>
      </div>
      <div class="progress-panel-bar">
        <div class="progress-panel-bar-fill" style="width: ${pct}%"></div>
      </div>
      <div class="progress-stats-grid">
        <div class="progress-stat-item">
          <div class="progress-stat-value">${p.estimatedJuz.toFixed(1)}<span class="progress-stat-max">/30</span></div>
          <div class="progress-stat-label">جزء <span class="progress-stat-approx">(تقريبي)</span></div>
        </div>
        <div class="progress-stat-item">
          <div class="progress-stat-value">${p.completedSurahsCount}<span class="progress-stat-max">/${p.totalSurahs}</span></div>
          <div class="progress-stat-label">سورة مكتملة</div>
        </div>
        <div class="progress-stat-item">
          <div class="progress-stat-value">${p.memorizedAyahs}<span class="progress-stat-max">/${p.totalAyahs}</span></div>
          <div class="progress-stat-label">آية محفوظة</div>
        </div>
        <div class="progress-stat-item">
          <div class="progress-stat-value">${p.estimatedPages}<span class="progress-stat-max">/604</span></div>
          <div class="progress-stat-label">صفحة <span class="progress-stat-approx">(تقريبي)</span></div>
        </div>
      </div>
    </div>
  `;
}

// نقطة الدخول المستخدمة بتطبيق الأستاذ (raqeem) تحديداً
function renderStudentProgressPanel(studentId) {
  renderProgressPanel(
    document.getElementById("studentProgressPanel"),
    studentId,
  );
}
