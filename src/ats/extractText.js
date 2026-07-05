// ──────────────────────────────────────────────────────────────────────────
// Client-side text extraction from an uploaded résumé file (PDF / DOCX / TXT).
// This whole module is loaded lazily (dynamic import on user action), so the
// PDF/zip libraries stay out of the main + SSR bundle. Nothing is uploaded —
// the file is read entirely in the browser.
// ──────────────────────────────────────────────────────────────────────────

import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { extractDocxText } from "./docxText.js";
import { textItemsToLines } from "./pdfText.js";

if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

async function extractPdf(buf) {
  const doc = await pdfjsLib.getDocument({ data: new Uint8Array(buf) }).promise;
  const out = [];
  for (let p = 1; p <= doc.numPages; p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    out.push(textItemsToLines(content.items).join("\n"));
  }
  try { doc.destroy(); } catch { /* noop */ }
  return out.join("\n");
}

// Returns the resume's plain text. Throws if the file can't be read.
export async function extractResumeText(file) {
  const name = (file && file.name ? file.name : "").toLowerCase();
  const type = (file && file.type) || "";
  const buf = await file.arrayBuffer();
  if (name.endsWith(".pdf") || type === "application/pdf") return extractPdf(buf);
  if (name.endsWith(".docx") || type.includes("officedocument.wordprocessing")) return extractDocxText(buf);
  // .txt / unknown → decode as UTF-8 text.
  return new TextDecoder().decode(new Uint8Array(buf));
}
