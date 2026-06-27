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

function buildIssues(flags, locale) {
  const f = flags;
  const issues = [];

  if (!f.hasEmail)      issues.push({ level:'critical', icon:'✉️', ...locale.issues.noEmail });
  if (!f.hasExperience) issues.push({ level:'critical', icon:'📋', ...locale.issues.noExperience });
  if (!f.hasSkills)     issues.push({ level:'critical', icon:'⚡', ...locale.issues.noSkills });

  if (!f.hasPhone)                      issues.push({ level:'warning', icon:'📞', ...locale.issues.noPhone });
  if (!f.hasLinkedin)                   issues.push({ level:'warning', icon:'🔗', ...locale.issues.noLinkedin });
  if (!f.hasSummary)                    issues.push({ level:'warning', icon:'📝', ...locale.issues.noSummary });
  if (f.hasExperience && !f.hasNumbers) issues.push({ level:'warning', icon:'🔢', ...locale.issues.noNumbers });
  if (f.hasExperience && !f.hasDates)   issues.push({ level:'warning', icon:'📅', ...locale.issues.noDates });
  if (f.weakLinesCount > 0)             issues.push({ level:'warning', icon:'✍️', ...locale.issues.weakBullets(f.weakLinesCount) });
  if (f.longLinesCount > 0)             issues.push({ level:'warning', icon:'📏', ...locale.issues.longLines(f.longLinesCount) });
  if (f.wordCount < 200)                issues.push({ level:'warning', icon:'📄', ...locale.issues.tooShort(f.wordCount) });

  if (!f.hasEducation)  issues.push({ level:'info', icon:'🎓', ...locale.issues.noEducation });
  if (f.wordCount > 1200) issues.push({ level:'info', icon:'📏', ...locale.issues.tooLong(f.wordCount) });

  if (f.kwPct !== null) {
    if (f.kwPct < 30)       issues.unshift({ level:'critical', icon:'🎯', type:'kw', ...locale.issues.kwLow(f.kwPct) });
    else if (f.kwPct < 45)  issues.unshift({ level:'warning',  icon:'🎯', type:'kw', ...locale.issues.kwMed(f.kwPct) });
  }

  const score = Math.max(0, 100
    - issues.filter(i => i.level === 'critical').length * 20
    - issues.filter(i => i.level === 'warning').length  * 8
    - issues.filter(i => i.level === 'info').length     * 3);

  return { score, issues };
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

function runCheck(locale) {
  const text   = document.getElementById('resume-text').value.trim();
  const jdText = document.getElementById('jd-text').value.trim();
  if (text.length < 40) { alert(locale.emptyAlert); return; }

  const btn = document.getElementById('check-btn');
  btn.disabled = true;
  btn.textContent = locale.analysing;

  setTimeout(() => {
    const { flags, kwGap } = computeATS(text, jdText);
    const { score, issues } = buildIssues(flags, locale);

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
    document.getElementById('summary-pills').innerHTML = [
      critCount ? `<span class="pill pill-red">${critCount} ${locale.pills.critical}</span>`   : '',
      warnCount ? `<span class="pill pill-amber">${warnCount} ${locale.pills.warning}</span>` : '',
      infoCount ? `<span class="pill pill-blue">${infoCount} ${locale.pills.info}</span>`     : '',
      !critCount && !warnCount ? `<span class="pill" style="background:#14532d44;color:#4ade80;border-color:#16a34a44">${locale.pills.allGood}</span>` : '',
    ].join('');

    if (kwGap) {
      document.getElementById('kw-section').style.display = 'block';
      document.getElementById('kw-pct').textContent = kwGap.pct + '%';
      document.getElementById('kw-present-count').textContent = kwGap.present.length;
      document.getElementById('kw-missing-count').textContent = kwGap.missing.length;
      setTimeout(() => { document.getElementById('kw-fill').style.width = kwGap.pct + '%'; }, 100);
      document.getElementById('kw-present-tags').innerHTML =
        `<span style="font-size:12px;font-weight:700;color:#64748B;text-transform:uppercase;letter-spacing:1px;display:block;margin-bottom:8px">${locale.matchedKw}</span>` +
        kwGap.present.map(w => `<span class="tag-present">✓ ${w}</span>`).join('');
      document.getElementById('kw-missing-tags').innerHTML =
        kwGap.missing.map(w => `<span class="tag-missing">✗ ${w}</span>`).join('') ||
        `<span style="color:#4ade80;font-size:13px">${locale.noMissingKw}</span>`;
    } else {
      document.getElementById('kw-section').style.display = 'none';
    }

    const nonKwIssues = issues.filter(i => i.type !== 'kw');
    const list = document.getElementById('issues-list');
    if (nonKwIssues.length === 0) {
      list.innerHTML = '';
      const ac = document.getElementById('all-clear');
      ac.style.display = 'block';
      ac.textContent = locale.allClear;
    } else {
      document.getElementById('all-clear').style.display = 'none';
      list.innerHTML = nonKwIssues.map(issue => `
        <div class="issue-card">
          <div class="issue-icon">${issue.icon}</div>
          <div class="issue-body">
            <div class="issue-title">
              <span>${issue.title}</span>
              <span class="badge badge-${issue.level}">${locale.badgeLabels[issue.level]}</span>
            </div>
            <div class="issue-detail">${issue.detail}</div>
          </div>
        </div>`).join('');
    }

    try { localStorage.setItem('ac_ats_text', text); } catch(e) {}
    btn.disabled = false;
    btn.textContent = locale.recheck;
  }, 320);
}

function openInBuilder() {
  try { localStorage.setItem('ac_ats_text', document.getElementById('resume-text').value.trim()); } catch(e) {}
  window.location.href = '/';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && e.ctrlKey && typeof LOCALE !== 'undefined') { runCheck(LOCALE); }
});
