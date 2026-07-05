// ──────────────────────────────────────────────────────────────────────────
// Client-side, SSR-safe résumé parser. Turns pasted resume text into a
// structured object the builder can hydrate directly. Pure string logic — no
// network, no DOM. Heuristic and resilient to messy / bilingual (EN/FR) input.
// ──────────────────────────────────────────────────────────────────────────

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+\.?[a-z]{2,}/i;
const PHONE_RE = /(\+?\d[\d\s().\-]{7,}\d)/;
const LINKEDIN_RE = /((https?:\/\/)?(www\.)?linkedin\.com\/[^\s|,]+)/i;
const GITHUB_RE = /((https?:\/\/)?(www\.)?github\.com\/[^\s|,]+)/i;
const URL_RE = /((https?:\/\/)?(www\.)?[\w-]+\.(com|io|dev|net|org|me|co|fr|ma|ca|design|portfolio)(\/[^\s|,]*)?)/i;
const PAGE_RE = /^\s*(page\s*)?\d+\s*[\/of]+\s*\d+\s*$/i;            // "1 / 7", "Page 1 of 3"
const DATE_TOKEN = "(?:\\d{1,2}[\\/.]\\d{4}|[A-Za-zéûôàèç]{3,9}\\.?\\s?\\d{4}|\\d{4})";
const PRESENT = "(?:present|présent|présente|actuel|actuelle|en\\s?cours|now|today|aujourd['’]?hui|à\\s?ce\\s?jour)";
const DATE_ANY = new RegExp(`(${DATE_TOKEN}|${PRESENT})`, "gi");
const DATE_RANGE = new RegExp(`(${DATE_TOKEN})\\s*(?:[–—\\-]|to|à|au)\\s*(${DATE_TOKEN}|${PRESENT})`, "i");
const BULLET_RE = /^\s*[•·▸◦‣*►-]\s+/;
const DEGREE_RE = /(diplom|degree|bachelor|master|licence|baccalaur|bac\b|bts|dut|phd|doctor|mba|ing[eé]nieur|technician|technicien)/i;

// Section header keywords → builder section key (EN + FR).
const HEADER_MAP = [
  [/^(work\s+)?experien|^professional experience|^employment|^expérien|^parcours|^exp[ée]rience profession/i, "experience"],
  [/^educat|^[ée]ducat|^formation|^studies|^acad[eé]mique|^scolarit/i, "education"],
  [/^skills|^technical skills|^comp[ée]tences|^aptitudes|^technologies|^strengths|^points forts/i, "skills"],
  [/^certificat/i, "certifications"],
  [/^projects?$|^projets?$|^projects|^projets/i, "projects"],
  [/^languages?$|^langues?$/i, "languages"],
  [/^awards|^achievements|^honors|^honours|^r[ée]compenses|^distinctions|^prix/i, "awards"],
  [/^volunteer|^b[ée]n[ée]vol/i, "volunteer"],
  [/^extra[\s-]?curric|^activit/i, "extracurricular"],
  [/^summary|^profile|^about( me)?$|^objective|^profil|^[àa]\s?propos|^r[ée]sum[ée] profession|^pr[ée]sentation/i, "summary"],
];

const stripAccentsLower = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

function classifyHeader(line) {
  const t = line.trim().replace(/[:：]\s*$/, "");
  if (!t || t.length > 40) return null;
  const words = t.split(/\s+/);
  if (words.length > 5) return null;
  // Headers are usually uppercase or title-ish and short; accept keyword match.
  for (const [re, key] of HEADER_MAP) if (re.test(t)) return key;
  return null;
}

function extractDates(line) {
  const range = line.match(DATE_RANGE);
  let start = "", end = "", matched = "";
  if (range) { start = range[1].trim(); end = range[2].trim(); matched = range[0]; }
  else {
    const all = line.match(DATE_ANY);
    if (all && all.length) { start = all[0].trim(); end = all[1] ? all[all.length - 1].trim() : ""; matched = all.join("|"); }
  }
  const normPresent = (d) => (new RegExp(`^${PRESENT}$`, "i").test(d) ? "Present" : d);
  let rest = line;
  if (range) rest = line.replace(range[0], " ");
  else if (start) (line.match(DATE_ANY) || []).forEach((m) => { rest = rest.replace(m, " "); });
  rest = rest.replace(/\(\s*\)/g, " ").replace(/\s*[–—|·]\s*$/, "").replace(/^\s*[–—|·,]\s*/, "")
    .replace(/\s{2,}/g, " ").trim();
  return { start: normPresent(start), end: normPresent(end), rest, hasDate: !!start };
}

// Split a header line's non-date remainder into [primary, secondary, location].
// Strips any stray separator chars left behind after date removal.
function splitHeaderParts(rest) {
  return rest.split(/\s+[—–|·]\s+|\s+[-]\s+|,\s+| at | chez /i)
    .map((p) => p.replace(/^[\s—–|·,\-]+|[\s—–|·,\-]+$/g, "").trim())
    .filter(Boolean);
}

function hasMeaningfulEntry(entry, key) {
  if (!entry) return false;
  if (key === "experience") {
    return Boolean(entry.title || entry.company || entry.startDate || entry.endDate || entry.bullets?.length);
  }
  return Boolean(entry.school || entry.degree || entry.location || entry.startDate || entry.endDate || entry.bullets?.length);
}

function nextContentLine(lines, index) {
  for (let i = index + 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line) return line;
  }
  return "";
}

function isStandaloneTitleLine(line, nextLine) {
  if (!line || BULLET_RE.test(line) || extractDates(line).hasDate) return false;
  if (classifyHeader(line)) return false;
  if (line.length > 90 || /[.!?]$/.test(line)) return false;
  const nextDates = extractDates(nextLine || "");
  return Boolean(nextDates.hasDate || /\s[—–|·]\s| at | chez |,\s/.test(nextLine || ""));
}

function parseExperienceEntries(body) {
  const entries = [];
  let cur = null;
  const finish = () => {
    if (!hasMeaningfulEntry(cur, "experience")) return;
    cur.bullets = [...new Set((cur.bullets || []).map((b) => b.trim()).filter(Boolean))];
    entries.push(cur);
  };

  for (let i = 0; i < body.length; i++) {
    const raw = body[i];
    const line = raw.trim();
    if (!line) continue;
    const bullet = BULLET_RE.test(raw);
    const cleanBullet = raw.replace(BULLET_RE, "").trim();
    const dates = extractDates(line);
    const nextLine = nextContentLine(body, i);

    if (bullet) {
      if (!cur) cur = { title: "", company: "", location: "", startDate: "", endDate: "", bullets: [] };
      if (cleanBullet) cur.bullets.push(cleanBullet);
      continue;
    }

    if (isStandaloneTitleLine(line, nextLine)) {
      finish();
      cur = { title: line, company: "", location: "", startDate: "", endDate: "", bullets: [] };
      continue;
    }

    if (dates.hasDate) {
      const parts = splitHeaderParts(dates.rest);
      if (cur?.title && !cur.company && !cur.startDate && !cur.endDate) {
        cur.company = parts[0] || cur.company || "";
        cur.location = parts.slice(1).join(" · ");
        cur.startDate = dates.start;
        cur.endDate = dates.end;
      } else {
        finish();
        cur = {
          title: parts[0] || "",
          company: parts[1] || "",
          location: parts.slice(2).join(" · "),
          startDate: dates.start,
          endDate: dates.end,
          bullets: [],
        };
      }
      continue;
    }

    if (!cur) {
      cur = { title: line, company: "", location: "", startDate: "", endDate: "", bullets: [] };
    } else if (!cur.title) {
      cur.title = line;
    } else {
      cur.bullets.push(line);
    }
  }

  finish();
  return entries;
}

function parseEducationEntries(body) {
  const entries = [];
  let cur = null;
  const finish = () => {
    if (!hasMeaningfulEntry(cur, "education")) return;
    const seen = new Set([cur.startDate, cur.endDate].filter(Boolean).map((item) => item.trim()));
    cur.bullets = (cur.bullets || [])
      .map((b) => b.trim())
      .filter(Boolean)
      .filter((b) => {
        const dates = extractDates(b);
        if (dates.hasDate && !dates.rest && seen.has(dates.start)) return false;
        if (seen.has(b)) return false;
        return true;
      });
    cur.bullets = [...new Set(cur.bullets)];
    entries.push(cur);
  };

  for (let i = 0; i < body.length; i++) {
    const raw = body[i];
    const line = raw.trim();
    if (!line) continue;
    const bullet = BULLET_RE.test(raw);
    const cleanBullet = raw.replace(BULLET_RE, "").trim();
    const dates = extractDates(cleanBullet || line);
    const nextLine = nextContentLine(body, i);

    if (bullet) {
      if (!cur) cur = { school: "", degree: "", location: "", startDate: "", endDate: "", bullets: [] };
      if (cleanBullet) cur.bullets.push(cleanBullet);
      continue;
    }

    if (isStandaloneTitleLine(line, nextLine) || (!dates.hasDate && DEGREE_RE.test(line))) {
      finish();
      cur = { school: "", degree: line, location: "", startDate: "", endDate: "", bullets: [] };
      continue;
    }

    if (dates.hasDate) {
      const parts = splitHeaderParts(dates.rest);
      if (cur && !cur.startDate && !cur.endDate) {
        if (!cur.school && parts[0]) cur.school = parts[0];
        else if (!cur.degree && parts[0] && DEGREE_RE.test(parts[0])) cur.degree = parts[0];
        cur.location = parts.slice(cur.school ? 1 : 0).join(" · ") || cur.location;
        cur.startDate = dates.start;
        cur.endDate = dates.end;
      } else {
        finish();
        cur = { school: "", degree: "", location: "", startDate: dates.start, endDate: dates.end, bullets: [] };
        if (parts[0] && DEGREE_RE.test(parts[0])) { cur.degree = parts[0]; cur.school = parts[1] || ""; cur.location = parts.slice(2).join(" · "); }
        else { cur.school = parts[0] || ""; cur.degree = parts[1] || ""; cur.location = parts.slice(2).join(" · "); }
      }
      continue;
    }

    if (!cur) cur = { school: "", degree: line, location: "", startDate: "", endDate: "", bullets: [] };
    else cur.bullets.push(line);
  }

  finish();
  return entries;
}

export function parseResume(rawText) {
  const empty = {
    name: "", title: "", email: "", phone: "", location: "", linkedin: "", website: "",
    summary: "", experience: [], education: [], skills: [], languages: [],
    certifications: [], projects: [], awards: [], volunteer: [], extracurricular: [],
  };
  if (!rawText || typeof rawText !== "string" || !rawText.trim()) return empty;

  // 1) Normalize lines, drop PDF artifacts (page numbers + repeated header/footer).
  let lines = rawText.replace(/\r/g, "").split("\n").map((l) => l.replace(/\s+$/, ""));
  const emailEarly = (rawText.match(EMAIL_RE) || [])[0] || "";
  const freq = {};
  lines.forEach((l) => { const k = l.trim(); if (k) freq[k] = (freq[k] || 0) + 1; });
  lines = lines.filter((l) => {
    const t = l.trim();
    if (!t) return true; // keep blanks as paragraph separators
    if (PAGE_RE.test(t)) return false;
    if (/\b\d+\s*\/\s*\d+\b/.test(t) && (emailEarly && t.includes(emailEarly))) return false; // "Name email 1/7"
    if (freq[t] >= 3 && t.length < 80) return false; // repeated running header/footer
    return true;
  });

  const out = { ...empty };

  // 2) Find section header positions.
  const marks = [];
  lines.forEach((l, i) => { const key = l.trim() ? classifyHeader(l) : null; if (key) marks.push({ i, key }); });

  const headerBlockEnd = marks.length ? marks[0].i : lines.length;
  const headerBlock = lines.slice(0, headerBlockEnd);

  // 3) Personal info + summary from the top block.
  const contactConsumed = new Set();
  const fullText = headerBlock.join("\n");
  out.email = (fullText.match(EMAIL_RE) || [""])[0];
  const li = fullText.match(LINKEDIN_RE); if (li) out.linkedin = li[1];
  const gh = fullText.match(GITHUB_RE); if (gh) out.website = gh[1];
  headerBlock.forEach((l, idx) => {
    const t = l.trim();
    if (!t) return;
    const isContact = EMAIL_RE.test(t) || PHONE_RE.test(t) || LINKEDIN_RE.test(t) || GITHUB_RE.test(t) || URL_RE.test(t);
    if (PHONE_RE.test(t) && !out.phone) { const m = t.match(PHONE_RE); if (m) out.phone = m[1].trim(); }
    if (!out.website && !LINKEDIN_RE.test(t) && URL_RE.test(t) && !EMAIL_RE.test(t)) {
      const m = t.match(URL_RE); if (m && !/@/.test(m[1])) out.website = m[1];
    }
    if (isContact) contactConsumed.add(idx);
  });

  // Name = first non-contact, letter-only line. Title = next such line.
  const nameCandidates = headerBlock
    .map((l, idx) => ({ t: l.trim(), idx }))
    .filter(({ t, idx }) => t && !contactConsumed.has(idx) && !/[@\d]/.test(t) && /[A-Za-zÀ-ɏ]/.test(t) && t.split(/\s+/).length <= 6);
  if (nameCandidates.length) { out.name = nameCandidates[0].t; contactConsumed.add(nameCandidates[0].idx); }
  if (nameCandidates.length > 1) {
    const cand = nameCandidates[1];
    // A title is short and not a full sentence (no trailing period / few words).
    if (cand.t.split(/\s+/).length <= 7 && !/[.!?]$/.test(cand.t)) { out.title = cand.t; contactConsumed.add(cand.idx); }
  }
  // Location: a "City, Country"-ish standalone line OR a segment inside a
  // multi-field contact line (e.g. "email | phone | Casablanca, Morocco").
  const LOC_RE = /^[A-Za-zÀ-ɏ .''\-]{2,},\s*[A-Za-zÀ-ɏ .''\-]{2,}$/;
  headerBlock.forEach((l, idx) => {
    const t = l.trim();
    if (!t || out.location) return;
    if (!contactConsumed.has(idx) && LOC_RE.test(t) && t.length < 40) { out.location = t; contactConsumed.add(idx); return; }
    for (const seg of t.split(/[|·•]/).map((s) => s.trim())) {
      if (!seg || EMAIL_RE.test(seg) || PHONE_RE.test(seg) || URL_RE.test(seg)) continue;
      if (LOC_RE.test(seg) && seg.length < 40) { out.location = seg; break; }
    }
  });
  // Remaining prose in the header block → summary (captured once).
  const summaryLines = headerBlock.filter((l, idx) => l.trim() && !contactConsumed.has(idx));
  if (summaryLines.length) out.summary = summaryLines.join(" ").replace(/\s{2,}/g, " ").trim();

  // 4) Walk each section's lines.
  const sectionLines = (start) => {
    const end = marks.find((m) => m.i > start)?.i ?? lines.length;
    return lines.slice(start + 1, end).map((l) => l).filter((l, i, a) => !(l.trim() === "" && (i === 0 || a[i - 1].trim() === "")));
  };

  for (let mi = 0; mi < marks.length; mi++) {
    const { i, key } = marks[mi];
    const body = sectionLines(i);
    if (key === "summary") {
      const para = body.filter((l) => l.trim()).join(" ").replace(/\s{2,}/g, " ").trim();
      if (para && !out.summary) out.summary = para;            // never duplicate
      else if (para && out.summary.length < 30) out.summary = para;
    } else if (key === "experience" || key === "education") {
      const entries = key === "experience" ? parseExperienceEntries(body) : parseEducationEntries(body);
      if (key === "experience") out.experience = entries.map((e) => ({ title: e.title, company: e.company, location: e.location, startDate: e.startDate, endDate: e.endDate, bullets: e.bullets.filter(Boolean) }));
      else out.education = entries.map((e) => ({ school: e.school || "", degree: e.degree || "", location: e.location || "", startDate: e.startDate, endDate: e.endDate, description: e.bullets.filter(Boolean).join("\n") }));
    } else if (key === "skills") {
      const items = [];
      for (const raw of body) {
        const line = raw.replace(BULLET_RE, "").trim();
        if (!line) continue;
        const afterColon = line.includes(":") ? line.slice(line.indexOf(":") + 1) : line;
        afterColon.split(/[,;•·|]/).map((s) => s.trim()).filter(Boolean).forEach((s) => { if (s.length < 40) items.push(s); });
      }
      out.skills = [...new Set(items)];
    } else if (key === "languages") {
      const items = [];
      for (const raw of body) {
        const line = raw.replace(BULLET_RE, "").trim();
        if (!line) continue;
        (line.includes(",") ? line.split(/[,;]/) : [line]).map((s) => s.trim()).filter(Boolean).forEach((s) => items.push(s));
      }
      out.languages = [...new Set(items)];
    } else {
      // certifications / projects / awards / volunteer / extracurricular → discrete items.
      const items = [];
      for (const raw of body) {
        const line = raw.replace(BULLET_RE, "").trim();
        if (!line) continue;
        const parts = line.split(/\s+[—–|·]\s+|\s+[-]\s+/).map((p) => p.trim()).filter(Boolean);
        items.push({ title: parts[0] || line, subtitle: parts[1] || "", description: parts.slice(2).join(" ") });
      }
      out[key] = items;
    }
  }

  return out;
}
