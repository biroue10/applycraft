import React, { useEffect, useMemo, useState } from "react";
import { decodeShare, fetchShortSharedDocument, normalizeSharedDocument, SHARE_ID_RE } from "./share.js";
import { isRtlLang } from "./i18n/languages.js";
import { ResumePaper, CoverLetterPaper } from "./documents/DocumentPapers.jsx";
import { getResumeTemplateById, getCoverTemplateById } from "./documents/templateRegistry.js";
import { AppShell, SITE_COLORS } from "./siteChrome.jsx";

// Public viewer for a shared resume / cover letter. The encoded payload lives
// entirely in the URL fragment, so no resume content is uploaded to ApplyCraft.

const TEXT1 = SITE_COLORS.text1;
const TEXT2 = SITE_COLORS.text2;
const TEXT3 = SITE_COLORS.text3;
const GRAD = SITE_COLORS.grad;

const ERROR_COPY = {
  en: {
    loading: "Loading...",
    invalidTitle: "This shared link is empty or invalid.",
    invalidBody: "Ask the sender for a fresh link, or build your own resume for free.",
    notFoundTitle: "This shared link was not found.",
    notFoundBody: "It may have been deleted, expired, or copied incorrectly.",
    expiredTitle: "This shared link has expired.",
    expiredBody: "Ask the sender for a fresh link.",
    networkTitle: "The document could not be loaded.",
    networkBody: "Check your connection and try again.",
    renderTitle: "This shared résumé could not be displayed.",
    renderBody: "Ask the sender for a fresh link, or build your own resume for free.",
    cta: "Build my resume - free",
  },
  fr: {
    loading: "Chargement...",
    invalidTitle: "Ce lien partagé est vide ou invalide.",
    invalidBody: "Demandez un nouveau lien à l'expéditeur ou créez votre CV gratuitement.",
    notFoundTitle: "Ce lien partagé est introuvable.",
    notFoundBody: "Il a peut-être été supprimé, expiré ou copié incorrectement.",
    expiredTitle: "Ce lien partagé a expiré.",
    expiredBody: "Demandez un nouveau lien à l'expéditeur.",
    networkTitle: "Le document n'a pas pu être chargé.",
    networkBody: "Vérifiez votre connexion puis réessayez.",
    renderTitle: "Ce CV partagé n’a pas pu être affiché.",
    renderBody: "Demandez un nouveau lien à l'expéditeur ou créez votre CV gratuitement.",
    cta: "Créer mon CV gratuitement",
  },
  ar: {
    loading: "جار التحميل...",
    invalidTitle: "رابط المشاركة فارغ أو غير صالح.",
    invalidBody: "اطلب من المرسل رابطًا جديدًا أو أنشئ سيرتك الذاتية مجانًا.",
    notFoundTitle: "لم يتم العثور على رابط المشاركة.",
    notFoundBody: "ربما تم حذفه أو انتهت صلاحيته أو تم نسخه بشكل غير صحيح.",
    expiredTitle: "انتهت صلاحية رابط المشاركة.",
    expiredBody: "اطلب من المرسل رابطًا جديدًا.",
    networkTitle: "تعذر تحميل المستند.",
    networkBody: "تحقق من اتصالك ثم حاول مرة أخرى.",
    renderTitle: "تعذر عرض السيرة الذاتية المشتركة.",
    renderBody: "اطلب من المرسل رابطًا جديدًا أو أنشئ سيرتك الذاتية مجانًا.",
    cta: "إنشاء سيرتي الذاتية مجانًا",
  },
};

function browserCopy() {
  if (typeof navigator === "undefined") return ERROR_COPY.en;
  const code = String(navigator.language || "en").toLowerCase().split("-")[0];
  return ERROR_COPY[code] || ERROR_COPY.en;
}

function shareIdFromPath(pathname) {
  const match = String(pathname || "").match(/^\/r\/([^/]+)$/);
  const id = match?.[1] || "";
  return SHARE_ID_RE.test(id) ? id : "";
}

function SharedStyles({ pageSize }) {
  const size = pageSize === "letter" ? "Letter" : "A4";
  return (
    <style>{`
      .ac-shared-document-wrap {
        width: min(100%, 900px);
        margin: 0 auto;
        overflow-wrap: anywhere;
      }
      .ac-shared-document-wrap bdi,
      .ac-shared-document-wrap a {
        overflow-wrap: anywhere;
        word-break: break-word;
      }
      .ac-shared-stage {
        max-width: 1120px;
        margin: 0 auto;
        padding: calc(76px + 2rem) 1rem 3rem;
        display: flex;
        justify-content: center;
      }
      @media (max-width: 720px) {
        .ac-shared-main { padding: 0 !important; }
        .ac-shared-stage { padding: calc(60px + 1rem) 0.75rem 2rem !important; }
        .ac-shared-document-wrap { width: 100%; }
      }
      @media print {
        @page { size: ${size}; margin: 14mm; }
        html, body, #root {
          background: #fff !important;
        }
        .ac-site-header,
        .ac-site-footer {
          display: none !important;
        }
        .ac-shared-main {
          padding: 0 !important;
          background: #fff !important;
        }
        .ac-shared-document-wrap {
          width: 100% !important;
          margin: 0 !important;
          box-shadow: none !important;
          overflow: visible !important;
        }
        .ac-shared-document-wrap > article > div {
          box-shadow: none !important;
        }
        * {
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
      }
    `}</style>
  );
}

class SharedDocumentErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    // Keep the public shared viewer on a friendly fallback instead of React's crash page.
  }

  render() {
    if (!this.state.failed) return this.props.children;
    const copy = this.props.copy || ERROR_COPY.en;
    return (
      <div dir={copy === ERROR_COPY.ar ? "rtl" : "ltr"} style={{ color: TEXT2, textAlign: "center", padding: 60, maxWidth: 460, margin: "0 auto" }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: TEXT1, marginBottom: 8 }}>{copy.renderTitle}</div>
        <div style={{ fontSize: 14, marginBottom: 20 }}>{copy.renderBody}</div>
        <a href="/resume/templates/" style={{ background: GRAD, color: "#fff", textDecoration: "none",
          borderRadius: 3, padding: "11px 22px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
          {copy.cta}
        </a>
      </div>
    );
  }
}

export default function SharedResume() {
  const [doc, setDoc] = useState(null);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    let cancelled = false;
    async function load() {
      const shareId = shareIdFromPath(window.location.pathname);
      try {
        if (shareId) {
          const loaded = await fetchShortSharedDocument(shareId);
          if (!cancelled) setDoc(loaded);
        } else {
          const frag = window.location.hash.replace(/^#/, "");
          if (!cancelled) setDoc(frag ? normalizeSharedDocument(decodeShare(frag)) : null);
        }
      } catch (err) {
        if (!cancelled) setLoadError(err?.code || "network_error");
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const resolved = useMemo(() => {
    if (!doc) return null;
    const rtl = isRtlLang(doc.l);
    const template = doc.k === "cover" ? getCoverTemplateById(doc.t) : getResumeTemplateById(doc.t);
    return { rtl, template };
  }, [doc]);

  const copy = doc?.l && ERROR_COPY[doc.l] ? ERROR_COPY[doc.l] : browserCopy();
  const errorTitle = loadError === "expired"
    ? copy.expiredTitle
    : loadError === "not_found"
      ? copy.notFoundTitle
      : loadError
        ? copy.networkTitle
        : copy.invalidTitle;
  const errorBody = loadError === "expired"
    ? copy.expiredBody
    : loadError === "not_found"
      ? copy.notFoundBody
      : loadError
        ? copy.networkBody
        : copy.invalidBody;

  return (
    <AppShell lang={doc?.l || "en"}>
      <SharedStyles pageSize={doc?.p || "a4"} />

      <main className="ac-shared-main" style={{ flex: 1 }}>
        {!ready ? (
          <div style={{ color: TEXT3, textAlign: "center", padding: 60 }}>{copy.loading}</div>
        ) : !doc || !resolved ? (
          <div dir={copy === ERROR_COPY.ar ? "rtl" : "ltr"} style={{ color: TEXT2, textAlign: "center", padding: 60, maxWidth: 460, margin: "0 auto" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: TEXT1, marginBottom: 8 }}>{errorTitle}</div>
            <div style={{ fontSize: 14, marginBottom: 20 }}>{errorBody}</div>
            <a href="/resume/templates/" style={{ background: GRAD, color: "#fff", textDecoration: "none",
              borderRadius: 3, padding: "11px 22px", fontSize: 14, fontWeight: 700, display: "inline-block" }}>
              {copy.cta}
            </a>
          </div>
        ) : (
          <SharedDocumentErrorBoundary copy={copy}>
            <div className="ac-shared-stage">
              <div className="ac-shared-document-wrap">
                <article lang={doc.l} dir={resolved.rtl ? "rtl" : "ltr"} data-share-kind={doc.k} data-template-id={resolved.template.id}>
                  {doc.k === "cover" ? (
                    <CoverLetterPaper tpl={resolved.template} data={doc.d || {}} rtl={resolved.rtl} lang={doc.l} preview={false} />
                  ) : (
                    <ResumePaper tpl={resolved.template} result={doc.d || {}} rtl={resolved.rtl} lang={doc.l} placeholder={false} preview={false} />
                  )}
                </article>
              </div>
            </div>
          </SharedDocumentErrorBoundary>
        )}
      </main>
    </AppShell>
  );
}
