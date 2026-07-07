// ApplyCraft ATS Scoring Engine
// Shared by /ats-checker/, /ats-checker-fr/, /ats-checker-ar/
// Each page defines a global LOCALE object before loading this file.

const STOP = new Set(['and','or','the','a','an','in','on','to','for','of','with','at','by','from','as','is','are','was','were','be','been','have','has','had','do','does','did','will','would','can','could','should','may','might','must','shall','not','but','if','then','than','that','this','these','those','it','its','we','our','you','your','they','their','he','she','him','her','i','me','my','us','any','all','more','most','some','such','own','same','other','also','just','into','over','after','before','during','through','between','each','only','very','too','so','up','out','about','no','new','need','work','experience','years','year','role','team','company','skills','ability','strong','proven','excellent','good','great','well','using','use','used','including','include','includes','within','across','multiple','various','key','core','day','days','time','high','low','able','ensure','provide','provides','provided','making','make','take','takes','help','helps','both','per','etc']);

function tokenize(text) {
  return text.toLowerCase().split(/\W+/).filter(w => w.length > 2 && !STOP.has(w) && isNaN(w));
}

const WEAK_RE = /^(responsible for|helped?( to)?|assisted?( with)?|worked on|was part of|involved in|supported?|participated in|contributed to|did |handled |performed |undertook |was involved)/i;
function isWeakBullet(line) {
  const t = line.trim();
  return t.length >= 10 && WEAK_RE.test(t);
}

// Pure computation — returns structured data, never localized strings.
// Section detection covers EN + FR + AR keywords so scoring works across languages.
function computeATS(text, jdText) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

  const hasEmail    = /\b[\w.+%-]+@[\w.-]+\.[a-z]{2,}\b/i.test(text);
  const hasPhone    = /(\+?\d[\d\s\-().]{6,14}\d)/.test(text);
  const hasLinkedin = /linkedin\.com/i.test(text);

  const hasExperience = /\b(experience|work history|employment|career|exp[eé]rience|parcours|emploi|خبرة|مسيرة|خبرات|التجارب|العمل)\b/i.test(text)
                      || /\b(20\d{2}|19[89]\d)\b/.test(text);
  const hasEducation  = /\b(education|degree|university|college|bachelor|master|phd|mba|diploma|graduate|formation|[eé]tudes?|dipl[oô]me|universit[eé]|licence|doctorat|تعليم|شهادة|جامعة|بكالوريوس|ماجستير|دكتوراه|مؤهل)\b/i.test(text);
  const hasSkills     = /\b(skills|technologies|tools|expertise|tech stack|comp[eé]tences|aptitudes|مهارات|كفاءات|تقنيات)\b/i.test(text);
  const hasSummary    = /\b(summary|profile|objective|about me|r[eé]sum[eé]|profil|synth[eè]se|pr[eé]sentation|ملخص|نبذة|أهداف|مقدمة)\b/i.test(text);
  const hasDates      = /\b(20\d{2}|19[89]\d)\b/.test(text);

  const bulletLines = lines.filter(l => /^[•\-\*▸›>]/.test(l) || (l.length > 20 && l.length < 220));
  const hasNumbers  = bulletLines.some(l => /\d/.test(l));
  const weakLines   = lines.filter(isWeakBullet);
  const longLines   = lines.filter(l => l.length > 180);
  const wordCount   = text.split(/\s+/).filter(Boolean).length;

  let kwGap = null;
  if (jdText && jdText.trim().length > 30) {
    const jdWords = new Set(tokenize(jdText));
    const cvWords = new Set(tokenize(text));
    if (jdWords.size > 3) {
      const present = [...jdWords].filter(w => cvWords.has(w));
      const missing = [...jdWords].filter(w => !cvWords.has(w));
      const pct = Math.round((present.length / jdWords.size) * 100);
      kwGap = { present: present.slice(0, 20), missing: missing.slice(0, 20), pct };
    }
  }

  return {
    flags: { hasEmail, hasPhone, hasLinkedin, hasExperience, hasEducation, hasSkills,
             hasSummary, hasDates, hasNumbers,
             weakLinesCount: weakLines.length, longLinesCount: longLines.length,
             wordCount, kwPct: kwGap ? kwGap.pct : null },
    kwGap,
    wordCount
  };
}

function buildIssues(flags) {
  const f = flags;
  const issues = [];

  if (!f.hasEmail)      issues.push({ level:'critical', icon:'✉️', code:'NO_EMAIL' });
  if (!f.hasExperience) issues.push({ level:'critical', icon:'📋', code:'NO_EXPERIENCE' });
  if (!f.hasSkills)     issues.push({ level:'critical', icon:'⚡', code:'NO_SKILLS' });

  if (!f.hasPhone)                      issues.push({ level:'warning', icon:'📞', code:'NO_PHONE' });
  if (!f.hasLinkedin)                   issues.push({ level:'warning', icon:'🔗', code:'NO_LINKEDIN' });
  if (!f.hasSummary)                    issues.push({ level:'warning', icon:'📝', code:'NO_SUMMARY' });
  if (f.hasExperience && !f.hasNumbers) issues.push({ level:'warning', icon:'🔢', code:'NO_NUMBERS' });
  if (f.hasExperience && !f.hasDates)   issues.push({ level:'warning', icon:'📅', code:'NO_DATES' });
  if (f.weakLinesCount > 0)             issues.push({ level:'warning', icon:'✍️', code:'WEAK_BULLETS', data:{ count:f.weakLinesCount } });
  if (f.longLinesCount > 0)             issues.push({ level:'warning', icon:'📏', code:'LONG_LINES', data:{ count:f.longLinesCount } });
  if (f.wordCount < 200)                issues.push({ level:'warning', icon:'📄', code:'TOO_SHORT', data:{ words:f.wordCount } });

  if (!f.hasEducation)  issues.push({ level:'info', icon:'🎓', code:'NO_EDUCATION' });
  if (f.wordCount > 1200) issues.push({ level:'info', icon:'📏', code:'TOO_LONG', data:{ words:f.wordCount } });

  if (f.kwPct !== null) {
    if (f.kwPct < 30)       issues.unshift({ level:'critical', icon:'🎯', type:'kw', code:'KW_LOW', data:{ pct:f.kwPct } });
    else if (f.kwPct < 45)  issues.unshift({ level:'warning',  icon:'🎯', type:'kw', code:'KW_MED', data:{ pct:f.kwPct } });
  }

  const score = Math.max(0, 100
    - issues.filter(i => i.level === 'critical').length * 20
    - issues.filter(i => i.level === 'warning').length  * 8
    - issues.filter(i => i.level === 'info').length     * 3);

  return { score, issues };
}

function issueLocaleEntry(issue, locale) {
  const old = locale.issues || {};
  switch (issue.code) {
    case 'NO_EMAIL': return old.noEmail;
    case 'NO_EXPERIENCE': return old.noExperience;
    case 'NO_SKILLS': return old.noSkills;
    case 'NO_PHONE': return old.noPhone;
    case 'NO_LINKEDIN': return old.noLinkedin;
    case 'NO_SUMMARY': return old.noSummary;
    case 'NO_NUMBERS': return old.noNumbers;
    case 'NO_DATES': return old.noDates;
    case 'NO_EDUCATION': return old.noEducation;
    case 'WEAK_BULLETS': return old.weakBullets && old.weakBullets(issue.data && issue.data.count);
    case 'LONG_LINES': return old.longLines && old.longLines(issue.data && issue.data.count);
    case 'TOO_SHORT': return old.tooShort && old.tooShort(issue.data && issue.data.words);
    case 'TOO_LONG': return old.tooLong && old.tooLong(issue.data && issue.data.words);
    case 'KW_LOW': return old.kwLow && old.kwLow(issue.data && issue.data.pct);
    case 'KW_MED': return old.kwMed && old.kwMed(issue.data && issue.data.pct);
    default: return null;
  }
}

function setGauge(score) {
  const arc = document.getElementById('gauge-arc');
  const color = score >= 80 ? '#4ade80' : score >= 60 ? '#fbbf24' : score >= 40 ? '#fb923c' : '#f87171';
  arc.style.strokeDashoffset = 220 - 220 * (score / 100);
  arc.style.stroke = color;
  document.getElementById('score-num').style.color = color;
  document.getElementById('score-label').style.color = color;
  return color;
}

function clearNode(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function appendPill(parent, text, className, styleText) {
  const pill = document.createElement('span');
  pill.className = className;
  if (styleText) pill.setAttribute('style', styleText);
  pill.textContent = text;
  parent.appendChild(pill);
}

function appendKeywordTag(parent, text, className) {
  const tag = document.createElement('span');
  tag.className = className;
  tag.textContent = text;
  parent.appendChild(tag);
}

function runCheck(locale) {
  const text   = document.getElementById('resume-text').value.trim();
  const jdText = document.getElementById('jd-text').value.trim();
  if (text.length < 40) { alert(locale.emptyAlert); return; }

  const btn = document.getElementById('check-btn');
  btn.disabled = true;
  btn.textContent = locale.analysing;

  setTimeout(() => {
    const { flags, kwGap } = computeATS(text, jdText);
    const { score, issues } = buildIssues(flags);

    const results = document.getElementById('results');
    results.style.display = 'block';
    results.scrollIntoView({ behavior: 'smooth', block: 'start' });

    setGauge(score);
    document.getElementById('score-num').textContent = score;
    const labelEntry = Object.entries(locale.scoreLabels).reverse().find(([k]) => score >= +k);
    document.getElementById('score-label').textContent = labelEntry ? labelEntry[1] : locale.scoreLabels[0];

    const critCount = issues.filter(i => i.level === 'critical').length;
    const warnCount = issues.filter(i => i.level === 'warning').length;
    const infoCount = issues.filter(i => i.level === 'info').length;
    const summaryPills = document.getElementById('summary-pills');
    clearNode(summaryPills);
    if (critCount) appendPill(summaryPills, `${critCount} ${locale.pills.critical}`, 'pill pill-red');
    if (warnCount) appendPill(summaryPills, `${warnCount} ${locale.pills.warning}`, 'pill pill-amber');
    if (infoCount) appendPill(summaryPills, `${infoCount} ${locale.pills.info}`, 'pill pill-blue');
    if (!critCount && !warnCount) appendPill(summaryPills, locale.pills.allGood, 'pill', 'background:#14532d44;color:#4ade80;border-color:#16a34a44');

    if (kwGap) {
      document.getElementById('kw-section').style.display = 'block';
      document.getElementById('kw-pct').textContent = kwGap.pct + '%';
      document.getElementById('kw-present-count').textContent = kwGap.present.length;
      document.getElementById('kw-missing-count').textContent = kwGap.missing.length;
      setTimeout(() => { document.getElementById('kw-fill').style.width = kwGap.pct + '%'; }, 100);
      const presentTags = document.getElementById('kw-present-tags');
      const missingTags = document.getElementById('kw-missing-tags');
      clearNode(presentTags);
      clearNode(missingTags);
      const label = document.createElement('span');
      label.setAttribute('style', 'font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px');
      label.textContent = locale.matchedKw;
      presentTags.appendChild(label);
      kwGap.present.forEach(w => appendKeywordTag(presentTags, `✓ ${w}`, 'tag-present'));
      if (kwGap.missing.length) {
        kwGap.missing.forEach(w => appendKeywordTag(missingTags, `✗ ${w}`, 'tag-missing'));
      } else {
        const ok = document.createElement('span');
        ok.setAttribute('style', 'color:#4ade80;font-size:13px');
        ok.textContent = locale.noMissingKw;
        missingTags.appendChild(ok);
      }
    } else {
      document.getElementById('kw-section').style.display = 'none';
    }

    const nonKwIssues = issues.filter(i => i.type !== 'kw');
    const list = document.getElementById('issues-list');
    if (nonKwIssues.length === 0) {
      clearNode(list);
      const ac = document.getElementById('all-clear');
      ac.style.display = 'block';
      ac.textContent = locale.allClear;
    } else {
      document.getElementById('all-clear').style.display = 'none';
      clearNode(list);
      nonKwIssues.forEach(issue => {
        const localizedIssue = issueLocaleEntry(issue, locale) || { title: issue.code || '', detail: '' };
        const card = document.createElement('div');
        card.className = 'issue-card';
        const icon = document.createElement('div');
        icon.className = 'issue-icon';
        icon.textContent = issue.icon;
        const body = document.createElement('div');
        body.className = 'issue-body';
        const title = document.createElement('div');
        title.className = 'issue-title';
        const titleText = document.createElement('span');
        titleText.textContent = localizedIssue.title;
        const badge = document.createElement('span');
        badge.className = `badge badge-${issue.level}`;
        badge.textContent = locale.badgeLabels[issue.level];
        const detail = document.createElement('div');
        detail.className = 'issue-detail';
        detail.textContent = localizedIssue.detail;
        title.append(titleText, badge);
        body.append(title, detail);
        card.append(icon, body);
        list.appendChild(card);
      });
    }

    btn.disabled = false;
    btn.textContent = locale.recheck;
  }, 320);
}

let atsAutoCheckTimer = null;
function scheduleAutoCheck(locale, options = {}) {
  const resume = document.getElementById('resume-text');
  if (!resume || resume.value.trim().length < 40) return;
  if (options.requireVisibleResults) {
    const results = document.getElementById('results');
    if (!results || results.style.display !== 'block') return;
  }
  clearTimeout(atsAutoCheckTimer);
  atsAutoCheckTimer = setTimeout(() => runCheck(locale), options.delay || 420);
}

function setImportStatus(message, kind = 'info') {
  const status = document.getElementById('import-status');
  if (!status) return;
  status.textContent = message || '';
  status.style.display = message ? 'block' : 'none';
  status.dataset.kind = kind;
}

let atsImportPromise = null;
function loadATSImport(locale) {
  if (window.ApplyCraftATSImport && typeof window.ApplyCraftATSImport.extractResumeText === 'function') {
    return Promise.resolve(window.ApplyCraftATSImport);
  }
  if (atsImportPromise) return atsImportPromise;
  atsImportPromise = import('/ats-import.js').then((mod) => {
    const helper = window.ApplyCraftATSImport || mod;
    if (helper && typeof helper.extractResumeText === 'function') return helper;
    throw new Error('ATS import helper did not initialize');
  }).catch((error) => {
    atsImportPromise = null;
    setImportStatus(locale.importError, 'error');
    throw error;
  });
  return atsImportPromise;
}

async function importResumeFile(file, locale) {
  const input = document.getElementById('resume-import');
  const button = document.getElementById('import-btn');
  const resume = document.getElementById('resume-text');
  if (!file || !resume) return;

  const resetInput = () => { if (input) input.value = ''; };
  const restoreButton = () => {
    if (!button) return;
    button.disabled = false;
    button.textContent = `📎 ${locale.uploadBtn}`;
  };

  if (button) {
    button.disabled = true;
    button.textContent = locale.reading;
  }
  setImportStatus(locale.reading, 'info');

  try {
    const helper = await loadATSImport(locale);
    const text = await helper.extractResumeText(file);
    const clean = String(text || '').replace(/\n{3,}/g, '\n\n').trim();
    if (!clean) {
      setImportStatus(locale.importNoReadable, 'error');
      return;
    }
    resume.value = clean;
    resume.dispatchEvent(new Event('input', { bubbles: true }));
    setImportStatus(locale.importSuccess, 'success');
    if (clean.length >= 40) {
      clearTimeout(atsAutoCheckTimer);
      runCheck(locale);
    }
  } catch (error) {
    console.error('ATS import failed', error);
    setImportStatus(locale.importError, 'error');
  } finally {
    restoreButton();
    resetInput();
  }
}

function setupImport(locale) {
  const input = document.getElementById('resume-import');
  const button = document.getElementById('import-btn');
  if (!input || !button) return;
  button.addEventListener('click', () => input.click());
  input.addEventListener('change', (event) => {
    const file = event.target.files && event.target.files[0];
    if (file) importResumeFile(file, locale);
  });
}

function setupAutoAnalysis(locale) {
  const resume = document.getElementById('resume-text');
  const jd = document.getElementById('jd-text');
  if (resume) {
    resume.addEventListener('input', () => scheduleAutoCheck(locale));
  }
  if (jd) {
    jd.addEventListener('input', () => scheduleAutoCheck(locale, { requireVisibleResults: true }));
  }
}

function openInBuilder() {
  window.location.href = '/';
}

if (typeof LOCALE !== 'undefined') {
  setupImport(LOCALE);
  setupAutoAnalysis(LOCALE);
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey && typeof LOCALE !== 'undefined') { runCheck(LOCALE); }
});
