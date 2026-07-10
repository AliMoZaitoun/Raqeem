async function loadDataFromServer() {
  showLoading(true);
  try {
    const res = await fetch(`${SCRIPT_URL}?action=get_all_data`);
    const data = await res.json();

    globalData.students = data.students || [];
    globalData.sessions = data.sessions || [];
    globalData.notes = data.notes || [];
    globalData.assignments = data.assignments || [];

    return data;
  } catch (err) {
    console.error(err);
    alert("فشل الاتصال بخادم الحلقة.");
    return null;
  } finally {
    showLoading(false);
  }
}
