const CONFIG = window.LEAD_HUNTER_CONFIG || {};
const LS_KEYS = {
  sources: 'trendos_lead_sources_v1',
  keywords: 'trendos_lead_keywords_v1',
  leads: 'trendos_lead_inbox_v1'
};

const defaultKeywords = [
  ['حد يعرف مطبعة', 'شراء', 100], ['مطبعة في بنها', 'شراء', 100], ['عايز أطبع', 'شراء', 95],
  ['محتاج مطبعة', 'شراء', 95], ['طباعة بسرعة', 'شراء', 90], ['سعر طباعة', 'شراء', 90],
  ['مجات', 'خدمة', 85], ['استيكرات', 'خدمة', 80], ['كروت شخصية', 'خدمة', 80], ['بانر', 'خدمة', 75],
  ['فايبر', 'خدمة', 85], ['ليزر', 'خدمة', 85], ['حفر', 'خدمة', 80], ['سبلميشن', 'خدمة', 70],
  ['بنها', 'مدينة', 40], ['القليوبية', 'مدينة', 35]
].map(([keyword, category, score_weight]) => ({ keyword, category, score_weight, active: true }));

const defaultSources = [
  { source_id: id('SRC'), source_name: 'جروب بنها الآن', source_url: 'https://www.facebook.com/search/posts/?q=%D9%85%D8%B7%D8%A8%D8%B9%D8%A9%20%D8%A8%D9%86%D9%87%D8%A7', source_type: 'group', access_mode: 'manual', active: true, refresh_minutes: 30, priority: 'high', last_checked: '', next_check: new Date().toISOString() },
  { source_id: id('SRC'), source_name: 'مطبعة المستقبل - بنها', source_url: 'https://www.facebook.com/search/posts/?q=%D9%85%D8%AC%D8%A7%D8%AA%20%D8%A8%D9%86%D9%87%D8%A7', source_type: 'page', access_mode: 'manual', active: true, refresh_minutes: 30, priority: 'high', last_checked: '', next_check: new Date().toISOString() },
  { source_id: id('SRC'), source_name: 'عروض مطابع بنها', source_url: 'https://www.facebook.com/search/posts/?q=%D8%B7%D8%A8%D8%A7%D8%B9%D8%A9%20%D8%A8%D9%86%D9%87%D8%A7', source_type: 'group', access_mode: 'manual', active: true, refresh_minutes: 30, priority: 'medium', last_checked: '', next_check: new Date().toISOString() },
  { source_id: id('SRC'), source_name: 'بحث فيسبوك: مطبعة بنها', source_url: 'https://www.facebook.com/search/posts/?q=%D9%85%D8%B7%D8%A8%D8%B9%D8%A9%20%D8%A8%D9%86%D9%87%D8%A7', source_type: 'search', access_mode: 'manual', active: true, refresh_minutes: 30, priority: 'high', last_checked: '', next_check: new Date().toISOString() }
];

const defaultLeads = [
  { lead_id: id('LEAD'), source_name: 'جروب بنها الآن', post_url: 'https://www.facebook.com/search/posts/?q=مطبعة%20بنها', captured_text: 'حد يعرف مطبعة تطبع مجات بسرعة في بنها؟', service: 'مجات', city: 'بنها', lead_score: 91, suggested_reply: buildReply('مجات'), status: 'جديد', assigned_to: 'ضياء', created_at: new Date(Date.now() - 18 * 60000).toISOString(), urgency: 'high', reason: 'كلمات شراء واضحة + خدمة محددة' },
  { lead_id: id('LEAD'), source_name: 'مطبعة المستقبل - بنها', post_url: 'https://www.facebook.com/search/posts/?q=استيكرات%20بنها', captured_text: 'عايز أطبع استيكرات لمنتج جديد، حد يعرف مكان كويس؟', service: 'استيكرات', city: 'بنها', lead_score: 84, suggested_reply: buildReply('استيكرات'), status: 'جديد', assigned_to: 'رحمه', created_at: new Date(Date.now() - 55 * 60000).toISOString(), urgency: 'high', reason: 'نية شراء مباشرة' },
  { lead_id: id('LEAD'), source_name: 'عروض مطابع بنها', post_url: 'https://www.facebook.com/search/posts/?q=فايبر%20ليزر%20بنها', captured_text: 'مطبعة تطبع فايبر ليزر في بنها؟', service: 'حفر ليزر / فايبر', city: 'بنها', lead_score: 80, suggested_reply: buildReply('حفر ليزر / فايبر'), status: 'متابعة', assigned_to: 'ريفان', created_at: new Date(Date.now() - 150 * 60000).toISOString(), urgency: 'medium', reason: 'طلب خدمة ومكان' },
  { lead_id: id('LEAD'), source_name: 'Print & Design Benha', post_url: 'https://www.facebook.com/search/posts/?q=كروت%20شخصية', captured_text: 'محتاج كروت شخصية على وجهين بكرة', service: 'كروت شخصية', city: '', lead_score: 76, suggested_reply: buildReply('كروت شخصية'), status: 'تم الرد', assigned_to: 'ضياء', created_at: new Date(Date.now() - 260 * 60000).toISOString(), urgency: 'medium', reason: 'خدمة محددة وموعد قريب' }
];

const state = {
  sources: load(LS_KEYS.sources, []),
  keywords: load(LS_KEYS.keywords, []),
  leads: load(LS_KEYS.leads, []),
  lastAnalysis: null
};

function id(prefix) { return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`; }
function nowIso() { return new Date().toISOString(); }
function fmtDate(iso) { return iso ? new Date(iso).toLocaleString('ar-EG') : 'لم يراجع'; }
function load(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; } }
function saveLocal() {
  localStorage.setItem(LS_KEYS.sources, JSON.stringify(state.sources));
  localStorage.setItem(LS_KEYS.keywords, JSON.stringify(state.keywords));
  localStorage.setItem(LS_KEYS.leads, JSON.stringify(state.leads));
}
function escapeHtml(text='') { return String(text).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c])); }
function isConfiguredApi() { return CONFIG.API_BASE_URL && CONFIG.API_TOKEN && !CONFIG.LOCAL_ONLY; }

async function api(action, payload = {}, method = 'POST') {
  if (!isConfiguredApi()) throw new Error('API غير مفعّل؛ الواجهة تعمل Local فقط.');
  if (method === 'GET') {
    const url = new URL(CONFIG.API_BASE_URL);
    url.searchParams.set('action', action);
    url.searchParams.set('token', CONFIG.API_TOKEN);
    Object.entries(payload).forEach(([k, v]) => url.searchParams.set(k, v));
    return fetch(url).then(r => r.json());
  }
  const res = await fetch(CONFIG.API_BASE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ action, token: CONFIG.API_TOKEN, ...payload })
  });
  return res.json();
}

function seedIfEmpty() {
  if (!state.keywords.length) state.keywords = defaultKeywords;
  if (!state.sources.length) state.sources = defaultSources;
  if (!state.leads.length) state.leads = defaultLeads;
  saveLocal();
  render();
}

async function syncData() {
  if (!isConfiguredApi()) { seedIfEmpty(); return; }
  try {
    const [sources, keywords, leads] = await Promise.all([
      api('listSources', {}, 'GET'), api('listKeywords', {}, 'GET'), api('listLeads', {}, 'GET')
    ]);
    state.sources = sources.data || [];
    state.keywords = keywords.data || [];
    state.leads = leads.data || [];
    saveLocal();
    render();
  } catch (err) {
    alert('تعذر الاتصال بالـ Backend. سيتم تشغيل البيانات المحلية.\n' + err.message);
    seedIfEmpty();
  }
}

function getDueSources() {
  const now = Date.now();
  return state.sources
    .filter(s => s.active !== false)
    .filter(s => !s.next_check || new Date(s.next_check).getTime() <= now)
    .sort((a,b) => priorityValue(b.priority) - priorityValue(a.priority));
}
function priorityValue(p) { return p === 'high' ? 3 : p === 'medium' ? 2 : 1; }

function renderStats() {
  const due = getDueSources().length;
  const hot = state.leads.filter(l => Number(l.lead_score || 0) >= 75 && l.status !== 'تحول لأوردر').length;
  const newLeads = state.leads.filter(l => l.status === 'جديد').length;
  const converted = state.leads.filter(l => l.status === 'تحول لأوردر').length;
  document.getElementById('statsGrid').innerHTML = [
    ['المصادر النشطة', state.sources.filter(s => s.active !== false).length, '👥'],
    ['مصادر للمراجعة', due, '⏱'],
    ['فرص عالية', hot, '⭐'],
    ['تحولت لأوردر', converted, '✅']
  ].map(([label, value, icon]) => `<div class="stat-card"><em>${icon}</em><b>${value}</b><span>${label}</span></div>`).join('');
}

function buildFacebookSearchUrl(sourceUrl, keyword) {
  const q = encodeURIComponent(keyword);
  // البحث العام في فيسبوك. في حالة المصدر Search يستخدم الرابط الأصلي، وإلا نفتح بحث عام بالكلمة + اسم المصدر.
  return `https://www.facebook.com/search/posts/?q=${q}`;
}

function renderDueSources() {
  const box = document.getElementById('dueSources');
  const due = getDueSources();
  if (!due.length) {
    box.innerHTML = '<div class="empty">لا توجد مصادر مستحقة الآن. اضغط تحديث لاحقًا أو أضف مصدر جديد.</div>';
    return;
  }
  const topKeywords = state.keywords.filter(k => k.active !== false).sort((a,b) => b.score_weight - a.score_weight).slice(0, 8);
  box.innerHTML = due.map(s => `
    <article class="source-card">
      <div>
        <h3>${escapeHtml(s.source_name)}</h3>
        <div class="meta">
          <span class="badge ${s.priority === 'high' ? 'hot' : ''}">${s.priority || 'medium'}</span>
          <span>${s.source_type || 'source'}</span>
          <span>آخر مراجعة: ${fmtDate(s.last_checked)}</span>
        </div>
      </div>
      <div class="actions">
        <a target="_blank" rel="noopener" href="${escapeHtml(s.source_url)}"><button class="primary">فتح المصدر</button></a>
        <button class="ghost" onclick="markChecked('${s.source_id}')">تمت المراجعة</button>
      </div>
      <div class="search-buttons">
        ${topKeywords.map(k => `<a target="_blank" rel="noopener" href="${buildFacebookSearchUrl(s.source_url, k.keyword)}"><button class="secondary">${escapeHtml(k.keyword)}</button></a>`).join('')}
      </div>
    </article>`).join('');
}

async function markChecked(sourceId) {
  const s = state.sources.find(x => x.source_id === sourceId);
  if (!s) return;
  const minutes = Number(s.refresh_minutes || CONFIG.DEFAULT_REFRESH_MINUTES || 30);
  s.last_checked = nowIso();
  s.next_check = new Date(Date.now() + minutes * 60000).toISOString();
  if (isConfiguredApi()) await api('markChecked', { source_id: sourceId });
  saveLocal();
  render();
}
window.markChecked = markChecked;

function renderKeywords() {
  const el = document.getElementById('keywordsList');
  if (!state.keywords.length) { el.innerHTML = '<div class="empty">لا توجد كلمات بعد.</div>'; return; }
  el.innerHTML = state.keywords
    .filter(k => k.active !== false)
    .sort((a,b) => b.score_weight - a.score_weight)
    .map(k => `<span class="chip">${escapeHtml(k.keyword)} <small>${escapeHtml(k.category)} / ${Number(k.score_weight || 0)}</small></span>`).join('');
}

function heuristicAnalyze(text) {
  const normalized = (text || '').toLowerCase();
  let score = 0;
  let matched = [];
  for (const k of state.keywords.filter(x => x.active !== false)) {
    if (normalized.includes(String(k.keyword).toLowerCase())) {
      score += Number(k.score_weight || 0);
      matched.push(k.keyword);
    }
  }
  if (/حد يعرف|عايز|محتاج|فين|سعر|كام|اطبع|طباعة|مطبعة/.test(normalized)) score += 35;
  score = Math.min(100, score);
  const service = detectService(normalized);
  const city = /بنها/.test(normalized) ? 'بنها' : (/القليوبية/.test(normalized) ? 'القليوبية' : '');
  return {
    is_lead: score >= 45,
    lead_score: score,
    service,
    city,
    urgency: score >= 85 ? 'high' : score >= 65 ? 'medium' : 'low',
    suggested_reply: buildReply(service),
    reason: matched.length ? `تم العثور على كلمات: ${matched.join('، ')}` : 'تحليل محلي بناءً على نية الشراء والكلمات المتاحة.',
    next_action: score >= 75 ? 'رد فوري' : score >= 45 ? 'راجع يدويًا' : 'غالبًا غير مناسب'
  };
}

function detectService(text) {
  if (/مجات|مج/.test(text)) return 'مجات';
  if (/استيكر|ستيكر/.test(text)) return 'استيكرات';
  if (/كروت|كارت/.test(text)) return 'كروت شخصية';
  if (/بانر|بنر/.test(text)) return 'بانر';
  if (/فايبر|ليزر|حفر/.test(text)) return 'حفر ليزر / فايبر';
  if (/تصميم/.test(text)) return 'تصميم وطباعة';
  return 'طباعة عامة';
}

function buildReply(service) {
  const brand = CONFIG.BRAND_NAME || 'مطبعجي بنها';
  const replies = {
    'مجات': `أهلاً بحضرتك، ${brand} يقدر ينفذ مجات بتصميم وطباعة وتسليم سريع. ابعتلنا الصورة أو الفكرة والكمية وهنبعتلك السعر والبروفة فورًا.`,
    'استيكرات': `أهلاً بحضرتك، متاح عند ${brand} استيكرات بأحجام وخامات مختلفة. ابعتلنا المقاس والكمية والتصميم أو الفكرة وهنحسبهالك فورًا.`,
    'كروت شخصية': `أهلاً بحضرتك، ${brand} معاك في تصميم وطباعة الكروت الشخصية بجودة ممتازة. ابعتلنا البيانات والكمية وهنجهزلك السعر والبروفة.`,
    'بانر': `أهلاً بحضرتك، متاح طباعة بانرات عند ${brand}. ابعتلنا المقاس والتصميم أو المطلوب وهنقولك السعر وميعاد التسليم.`,
    'حفر ليزر / فايبر': `أهلاً بحضرتك، متاح عندنا حفر فايبر وليزر حسب الخامة والمقاس. ابعتلنا صورة التصميم ونوع الخامة وهنراجع التنفيذ والسعر معاك.`,
    'تصميم وطباعة': `أهلاً بحضرتك، ${brand} يقدر يساعدك في التصميم والطباعة من أول الفكرة لحد التنفيذ. ابعتلنا المطلوب وهنبعتلك السعر والبروفة.`
  };
  return replies[service] || `أهلاً بحضرتك، ${brand} معاك في الطباعة والتصميم والهدايا والاستيكرات والكروت والليزر. ابعتلنا المطلوب أو صورة المثال وهنقولك السعر وميعاد التسليم.`;
}

async function analyzeCurrentText() {
  const text = document.getElementById('capturedText').value.trim();
  if (!text) { alert('حط نص العميل الأول.'); return null; }
  let result;
  if (isConfiguredApi()) {
    try {
      const res = await api('analyzeLead', { text });
      result = res.data || heuristicAnalyze(text);
    } catch (e) { result = heuristicAnalyze(text); }
  } else {
    result = heuristicAnalyze(text);
  }
  state.lastAnalysis = result;
  renderAnalysis(result);
  return result;
}

function renderAnalysis(result) {
  const box = document.getElementById('analysisBox');
  box.classList.remove('hidden');
  const badgeClass = result.lead_score >= 75 ? 'green' : result.lead_score >= 45 ? 'hot' : 'red';
  box.innerHTML = `
    <h3>نتيجة التحليل <span class="badge ${badgeClass}">${result.lead_score}%</span></h3>
    <p><b>الخدمة:</b> ${escapeHtml(result.service || '')}</p>
    <p><b>المدينة:</b> ${escapeHtml(result.city || '-')}</p>
    <p><b>الأولوية:</b> ${escapeHtml(result.urgency || '')}</p>
    <p><b>السبب:</b> ${escapeHtml(result.reason || '')}</p>
    <label>الرد المقترح
      <textarea rows="4" id="suggestedReplyBox">${escapeHtml(result.suggested_reply || '')}</textarea>
    </label>
    <div class="actions">
      <button class="primary" onclick="copySuggestedReply()">نسخ الرد</button>
    </div>`;
}
window.copySuggestedReply = function () {
  const text = document.getElementById('suggestedReplyBox')?.value || state.lastAnalysis?.suggested_reply || '';
  navigator.clipboard.writeText(text);
  alert('تم نسخ الرد.');
};

async function saveLeadFromForm(e) {
  e.preventDefault();
  let analysis = state.lastAnalysis;
  if (!analysis) analysis = await analyzeCurrentText();
  const lead = {
    lead_id: id('LEAD'),
    source_name: document.getElementById('sourceName').value.trim(),
    post_url: document.getElementById('postUrl').value.trim(),
    captured_text: document.getElementById('capturedText').value.trim(),
    service: analysis?.service || '',
    city: analysis?.city || '',
    lead_score: analysis?.lead_score || 0,
    suggested_reply: document.getElementById('suggestedReplyBox')?.value || analysis?.suggested_reply || '',
    status: document.getElementById('status').value,
    assigned_to: document.getElementById('assignedTo').value,
    created_at: nowIso(),
    urgency: analysis?.urgency || '',
    reason: analysis?.reason || ''
  };
  if (!lead.captured_text) { alert('نص العميل مطلوب.'); return; }
  state.leads.unshift(lead);
  if (isConfiguredApi()) await api('saveLead', { lead });
  saveLocal();
  clearLeadForm();
  render();
}

function clearLeadForm() {
  ['postUrl','sourceName','capturedText'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('status').value = 'جديد';
  document.getElementById('analysisBox').classList.add('hidden');
  document.getElementById('analysisBox').innerHTML = '';
  state.lastAnalysis = null;
}

function renderLeads() {
  const tbody = document.getElementById('leadsTbody');
  const search = document.getElementById('leadSearch').value.trim().toLowerCase();
  const status = document.getElementById('leadStatusFilter').value;
  let rows = state.leads;
  if (status) rows = rows.filter(l => l.status === status);
  if (search) rows = rows.filter(l => [l.source_name, l.captured_text, l.service, l.city].join(' ').toLowerCase().includes(search));
  if (!rows.length) { tbody.innerHTML = '<tr><td colspan="7" class="empty">لا توجد فرص مطابقة.</td></tr>'; return; }
  tbody.innerHTML = rows.map(l => {
    const score = Number(l.lead_score || 0);
    const cls = score >= 75 ? 'green' : score >= 45 ? 'hot' : 'red';
    return `<tr>
      <td>${fmtDate(l.created_at)}</td>
      <td>${escapeHtml(l.source_name || '-')}</td>
      <td><div class="lead-text" title="${escapeHtml(l.captured_text)}">${escapeHtml(l.captured_text)}</div></td>
      <td>${escapeHtml(l.service || '-')}</td>
      <td><span class="badge ${cls}">${score}%</span></td>
      <td>${escapeHtml(l.status || 'جديد')}</td>
      <td class="row-actions">
        ${l.post_url ? `<a target="_blank" rel="noopener" href="${escapeHtml(l.post_url)}"><button class="ghost">فتح</button></a>` : ''}
        <button class="secondary" onclick="copyLeadReply('${l.lead_id}')">نسخ الرد</button>
        <button class="primary" onclick="setLeadStatus('${l.lead_id}', 'تم الرد')">تم الرد</button>
        <button class="ghost" onclick="setLeadStatus('${l.lead_id}', 'تحول لأوردر')">تحول لأوردر</button>
      </td>
    </tr>`;
  }).join('');
}
window.copyLeadReply = function (leadId) {
  const lead = state.leads.find(l => l.lead_id === leadId);
  navigator.clipboard.writeText(lead?.suggested_reply || '');
  alert('تم نسخ الرد.');
};
window.setLeadStatus = async function (leadId, status) {
  const lead = state.leads.find(l => l.lead_id === leadId);
  if (!lead) return;
  lead.status = status;
  if (isConfiguredApi()) await api('updateLeadStatus', { lead_id: leadId, status });
  saveLocal();
  render();
};

function render() { renderStats(); renderDueSources(); renderKeywords(); renderLeads(); }


function showToast(message) {
  const old = document.querySelector('.toast');
  if (old) old.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = message;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function downloadText(filename, text, mime = 'text/plain;charset=utf-8') {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function csvEscape(value) {
  const s = String(value ?? '');
  return '"' + s.replace(/"/g, '""') + '"';
}

function exportLeadsCsv() {
  const headers = ['created_at','source_name','post_url','captured_text','service','city','lead_score','status','assigned_to','suggested_reply','reason'];
  const rows = [headers.join(',')].concat(state.leads.map(l => headers.map(h => csvEscape(l[h])).join(',')));
  downloadText('matbaagy-leads.csv', '\ufeff' + rows.join('\n'), 'text/csv;charset=utf-8');
  showToast('تم تصدير ملف CSV للفرص');
}

function backupJson() {
  const payload = {
    app: 'Matbaagy Lead Hunter Standalone',
    version: '1.1.0',
    exported_at: nowIso(),
    sources: state.sources,
    keywords: state.keywords,
    leads: state.leads
  };
  downloadText('matbaagy-lead-hunter-backup.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
  showToast('تم إنشاء نسخة احتياطية JSON');
}

function importJsonFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const payload = JSON.parse(String(reader.result || '{}'));
      if (Array.isArray(payload.sources)) state.sources = payload.sources;
      if (Array.isArray(payload.keywords)) state.keywords = payload.keywords;
      if (Array.isArray(payload.leads)) state.leads = payload.leads;
      saveLocal();
      render();
      showToast('تم استيراد البيانات بنجاح');
    } catch (e) {
      alert('ملف JSON غير صالح: ' + e.message);
    }
  };
  reader.readAsText(file, 'utf-8');
}

function applyCaptureParams() {
  const params = new URLSearchParams(location.search);
  const text = params.get('text') || params.get('selected_text') || '';
  const url = params.get('url') || params.get('post_url') || '';
  const title = params.get('title') || params.get('source') || '';
  if (!text && !url && !title) return;
  const postUrl = document.getElementById('postUrl');
  const sourceName = document.getElementById('sourceName');
  const capturedText = document.getElementById('capturedText');
  if (postUrl) postUrl.value = url;
  if (sourceName) sourceName.value = title;
  if (capturedText) capturedText.value = text;
  if (text) setTimeout(() => analyzeCurrentText(), 100);
  history.replaceState({}, document.title, location.pathname);
  showToast('تم استقبال فرصة من الإضافة');
}

function setupEvents() {
  document.getElementById('btnSeed').addEventListener('click', () => { state.sources = defaultSources; state.keywords = defaultKeywords; state.leads = defaultLeads; saveLocal(); render(); showToast('تم تحميل بيانات التجربة'); });
  document.getElementById('btnExport')?.addEventListener('click', exportLeadsCsv);
  document.getElementById('btnBackup')?.addEventListener('click', backupJson);
  document.getElementById('importFile')?.addEventListener('change', (e) => importJsonFile(e.target.files?.[0]));
  document.getElementById('btnSync').addEventListener('click', syncData);
  document.getElementById('btnAnalyze').addEventListener('click', analyzeCurrentText);
  document.getElementById('leadForm').addEventListener('submit', saveLeadFromForm);
  document.getElementById('btnClearLead').addEventListener('click', clearLeadForm);
  document.getElementById('leadSearch').addEventListener('input', renderLeads);
  document.getElementById('leadStatusFilter').addEventListener('change', renderLeads);

  const sourceDialog = document.getElementById('sourceDialog');
  document.getElementById('btnAddSource').addEventListener('click', () => sourceDialog.showModal());
  document.getElementById('sourceForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const src = {
      source_id: id('SRC'),
      source_name: document.getElementById('newSourceName').value.trim(),
      source_url: document.getElementById('newSourceUrl').value.trim(),
      source_type: document.getElementById('newSourceType').value,
      access_mode: 'manual', active: true,
      refresh_minutes: Number(document.getElementById('newRefreshMinutes').value || 30),
      priority: document.getElementById('newPriority').value,
      last_checked: '', next_check: nowIso()
    };
    state.sources.unshift(src);
    if (isConfiguredApi()) await api('addSource', { source: src });
    saveLocal(); sourceDialog.close(); e.target.reset(); render();
  });

  const keywordDialog = document.getElementById('keywordDialog');
  document.getElementById('btnAddKeyword').addEventListener('click', () => keywordDialog.showModal());
  document.getElementById('keywordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const kw = {
      keyword: document.getElementById('newKeyword').value.trim(),
      category: document.getElementById('newKeywordCategory').value,
      score_weight: Number(document.getElementById('newKeywordWeight').value || 50),
      active: true
    };
    state.keywords.unshift(kw);
    if (isConfiguredApi()) await api('addKeyword', { keyword: kw });
    saveLocal(); keywordDialog.close(); e.target.reset(); render();
  });
}

setupEvents();
seedIfEmpty();
applyCaptureParams();
render();
setInterval(render, 60000);
