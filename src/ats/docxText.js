import { unzipSync, strFromU8 } from "fflate";

const decodeEntities = (s) =>
  s.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));

export function extractDocxText(buf) {
  const files = unzipSync(new Uint8Array(buf));
  const docXml = files["word/document.xml"];
  if (!docXml) return "";
  const xml = strFromU8(docXml);
  return xml.split(/<\/w:p>/).map((para) => {
    const runs = [...para.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) => m[1]);
    const isListItem = /<w:numPr\b/.test(para);
    const text = decodeEntities(runs.join("")).trim();
    return text && isListItem && !/^[•·▸◦‣*►-]\s+/.test(text) ? `• ${text}` : text;
  }).join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
