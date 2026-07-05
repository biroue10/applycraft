const BULLET_MARKER_RE = /^\s*(?:[•\-–▪●*]|\d+[.)])\s+/;
const DATE_META_RE = /\b(?:janvier|février|fevrier|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre|january|february|march|april|may|june|july|august|september|october|november|december|\d{4}|aujourd['’]?hui|present)\b/i;
const TERMINAL_RE = /[.!?…:؛。]$/;
const SECTION_HEADER_RE = /^(profil|profile|summary|expérience|experience|formation|education|langues|languages|compétences|skills)$/i;

function lineText(items) {
  return items
    .sort((a, b) => a.x - b.x)
    .map((item) => item.str)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim();
}

function isBlockBoundary(line, nextLine = "") {
  const text = String(line?.text || "").trim();
  if (!text || BULLET_MARKER_RE.test(text)) return false;
  if (DATE_META_RE.test(text) && /[—–·|-]/.test(text)) return true;
  if (text.length <= 90 && !TERMINAL_RE.test(text) && nextLine && DATE_META_RE.test(nextLine.text || "")) return true;
  return false;
}

function shouldMergeWithPrevious(previous, current, nextLine) {
  if (!previous || !current) return false;
  const prevText = previous.text.trim();
  const currentText = current.text.trim();
  if (!prevText || !currentText) return false;
  if (BULLET_MARKER_RE.test(currentText)) return false;
  if (isBlockBoundary(current, nextLine)) return false;
  if (!previous.isBullet) return false;

  const continuationIndent = Math.abs(current.x - previous.textX) <= 12 || current.x > previous.markerX + 8;
  const grammaticalContinuation = /^[a-zàâäçéèêëîïôöùûüÿ]/.test(currentText) && !TERMINAL_RE.test(prevText);
  return continuationIndent || grammaticalContinuation || !TERMINAL_RE.test(prevText);
}

export function mergePdfTextLines(physicalLines) {
  const splitPhysicalLines = [];
  for (const line of physicalLines || []) {
    const text = String(line.text || "").replace(/\s+/g, " ").trim();
    const match = text.match(/^(.*?[.!?])\s+(Profil|Profile|Summary|Expérience|Experience|Formation|Education|Langues|Languages|Compétences|Skills)$/i);
    if (match) {
      splitPhysicalLines.push({ ...line, text: match[1].trim() });
      splitPhysicalLines.push({ ...line, text: match[2].trim() });
    } else {
      splitPhysicalLines.push(line);
    }
  }

  const lines = splitPhysicalLines
    .map((line) => ({
      text: String(line.text || "").replace(/\s+/g, " ").trim(),
      x: Number.isFinite(line.x) ? line.x : 0,
    }))
    .filter((line) => line.text);

  const logical = [];
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const marker = line.text.match(BULLET_MARKER_RE)?.[0] || "";
    const current = {
      ...line,
      isBullet: Boolean(marker),
      markerX: line.x,
      textX: line.x + (marker ? Math.max(8, marker.length * 4) : 0),
    };
    const previous = logical[logical.length - 1];
    if (SECTION_HEADER_RE.test(current.text)) {
      logical.push(current);
      continue;
    }
    if (shouldMergeWithPrevious(previous, current, lines[i + 1])) {
      previous.text = `${previous.text.replace(/\s+$/, "")} ${current.text}`.replace(/\s+/g, " ").trim();
      continue;
    }
    logical.push(current);
  }
  return logical.map((line) => line.text);
}

export function textItemsToLines(items) {
  const physical = [];
  let current = [];
  let lastY = null;

  for (const item of items || []) {
    if (!item || typeof item.str !== "string" || !item.str.trim()) continue;
    const x = Number(item.transform?.[4] || 0);
    const y = Math.round(Number(item.transform?.[5] || 0));
    if (lastY !== null && Math.abs(y - lastY) > 3) {
      if (current.length) physical.push({ text: lineText(current), x: Math.min(...current.map((entry) => entry.x)) });
      current = [];
    }
    current.push({ str: item.str, x });
    lastY = y;
  }
  if (current.length) physical.push({ text: lineText(current), x: Math.min(...current.map((entry) => entry.x)) });
  return mergePdfTextLines(physical);
}
