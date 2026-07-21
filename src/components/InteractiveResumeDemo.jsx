import React, { useEffect, useRef, useState } from "react";
import { LANDING2_UI } from "../i18n/index.js";
import { COLORS, accentOnPaper } from "../theme/colors.js";

const C = { ...COLORS, gradHov: "linear-gradient(135deg,#5254CC 0%,#2563EB 100%)",
  glow: "rgba(99,102,241,0.14)", glowBlue: "rgba(59,130,246,0.10)",
  radiusSm: 6, radiusMd: 10, radiusLg: 14 };

function FadeIn({ children, delay = 0, style = {}, as: Tag = "div" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return undefined;
    if (!("IntersectionObserver" in window)) { setVisible(true); return undefined; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { threshold: 0.1 });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return <Tag ref={ref} style={{
    transform: visible ? "none" : "translateY(22px)",
    transition: `transform 0.6s cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
    willChange: "transform", ...style }}>{children}</Tag>;
}

function LineIcon({ name, size = 18, color = "currentColor", style = {} }) {
  const paths = {
    check: <path d="M20 6 9 17l-5-5" />,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18" /><path d="M12 3c2.5 2.7 3.7 5.7 3.7 9S14.5 18.3 12 21" /><path d="M12 3c-2.5 2.7-3.7 5.7-3.7 9S9.5 18.3 12 21" /></>,
    spark: <><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="m5.6 5.6 2.8 2.8" /><path d="m15.6 15.6 2.8 2.8" /><path d="m5.6 18.4 2.8-2.8" /><path d="m15.6 8.4 2.8-2.8" /></>,
    document: <><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v5h5" /><path d="M9 13h6" /><path d="M9 17h6" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color}
    strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"
    style={{ display: "block", flexShrink: 0, ...style }}>{paths[name] || paths.document}</svg>;
}

function InlineList({ items, color = "inherit", separator = " · ", justifyContent = "flex-start", fontSize }) {
  const values = (Array.isArray(items) ? items : []).filter(Boolean);
  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "0.2rem 0.5rem", alignItems: "center",
      justifyContent, color, fontSize, lineHeight: 1.35 }}>
      {values.map((item, index) => (
        <React.Fragment key={`${item}-${index}`}>
          {index > 0 && <span aria-hidden="true" style={{ opacity: 0.72 }}>{separator}</span>}
          <bdi dir="auto" style={{ unicodeBidi: "isolate", overflowWrap: "anywhere" }}>{item}</bdi>
        </React.Fragment>
      ))}
    </span>
  );
}
const DEMO_TEMPLATES = [
  { id: "modern", name: "Atlas", accent: "#6366F1", side: "#f8f8fd", layout: "split", font: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif" },
  { id: "pulse", name: "Pulse", accent: "#2563EB", side: "#eff6ff", layout: "bar", font: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif" },
  { id: "minimal", name: "Nova", accent: "#7C3AED", side: "#f5f3ff", layout: "minimal", font: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif" },
  { id: "sharp", name: "Slate", accent: "#334155", side: "#f8fafc", layout: "rule", font: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif" },
  { id: "bold", name: "Ember", accent: "#DC2626", side: "#fef2f2", layout: "band", font: "'IBM Plex Sans', 'IBM Plex Sans Arabic', system-ui, sans-serif" },
];

const DEMO_COLORS = [
  { name: "Indigo", value: "#6366F1" },
  { name: "Blue", value: "#2563EB" },
  { name: "Violet", value: "#7C3AED" },
  { name: "Emerald", value: "#0F766E" },
  { name: "Amber", value: "#D97706" },
  { name: "Red", value: "#DC2626" },
];

const DEMO_LANGUAGES = {
  en: { name: "English", dir: "ltr", summary: "Summary", skills: "Skills", experience: "Experience", education: "Education", languages: "Languages" },
  fr: { name: "Français", dir: "ltr", summary: "Profil", skills: "Compétences", experience: "Expérience", education: "Formation", languages: "Langues" },
  de: { name: "Deutsch", dir: "ltr", summary: "Profil", skills: "Kenntnisse", experience: "Berufserfahrung", education: "Ausbildung", languages: "Sprachen" },
  es: { name: "Español", dir: "ltr", summary: "Perfil", skills: "Habilidades", experience: "Experiencia", education: "Educación", languages: "Idiomas" },
  ar: { name: "العربية", dir: "rtl", summary: "الملخص", skills: "المهارات", experience: "الخبرة", education: "التعليم", languages: "اللغات" },
};

const DEMO_INITIAL = { name: "", title: "", achievement: "", template: 0, color: "#6366F1", lang: "en", aiAccepted: false };
const DEMO_SAMPLE = {
  name: "Sarah Okonkwo",
  title: "Senior Product Designer",
  achievement: "Redesigned the checkout experience, increasing conversion by 23%",
  template: 1,
  color: "#2563EB",
  lang: "en",
  aiAccepted: false,
};
const DEMO_AI_SUGGESTION = "Redesigned the checkout experience, increasing conversion by 23% and reducing customer drop-off.";

function formatDemoText(template, values = {}) {
  return String(template || "").replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
}

function demoAtsScore({ name, title, achievement, aiAccepted }) {
  const text = achievement.trim();
  const strongVerb = /^(redesigned|improved|launched|built|led|increased|reduced|created|delivered|optimized|managed)\b/i.test(text);
  const measurable = /(\d+|%|\$|revenue|conversion|users|customers|hours|days|drop-off|reduced|increased)/i.test(text);
  return Math.min(94,
    55 +
    (name.trim() ? 5 : 0) +
    (title.trim() ? 8 : 0) +
    (text ? 8 : 0) +
    (strongVerb ? 6 : 0) +
    (measurable ? 7 : 0) +
    (aiAccepted ? 3 : 0)
  );
}

function InteractiveResumeDemo({ isMobile, onContinue, copy, closeLabel }) {
  const [demo, setDemo] = useState(DEMO_INITIAL);
  const [activeField, setActiveField] = useState("");
  const [view, setView] = useState("edit");
  const [aiState, setAiState] = useState("idle");
  const [aiDraft, setAiDraft] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState(false);
  const [exportMessage, setExportMessage] = useState("");
  const [autoDone, setAutoDone] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const sectionRef = useRef(null);
  const timersRef = useRef([]);
  const ctaRef = useRef(null);
  const dialogRef = useRef(null);
  const lastFocusRef = useRef(null);
  const tpl = DEMO_TEMPLATES[demo.template] || DEMO_TEMPLATES[0];
  const lang = DEMO_LANGUAGES[demo.lang] || DEMO_LANGUAGES.en;
  const accent = demo.color || tpl.accent;
  const score = demoAtsScore(demo);
  const completed = Boolean(demo.name.trim() && demo.title.trim() && demo.achievement.trim());
  const progress = Math.round(([demo.name, demo.title, demo.achievement].filter(v => v.trim()).length / 3) * 100);
  const reduceMotion = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  const text = { ...(LANDING2_UI.en.demo || {}), ...(copy || {}) };

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };
  const touchDemo = () => {
    setUserTouched(true);
    clearTimers();
  };
  const updateDemo = (patch, field = "") => {
    touchDemo();
    setDemo(d => ({ ...d, ...patch }));
    if (field) {
      setActiveField(field);
      window.setTimeout(() => setActiveField(""), 260);
    }
  };

  useEffect(() => {
    if (autoDone || userTouched || typeof window === "undefined") return;
    const root = sectionRef.current;
    if (!root) return;
    const run = () => {
      if (reduceMotion) {
        setDemo({ ...DEMO_SAMPLE, aiAccepted: true });
        setMessage("Demo ready. Explore the controls or continue to the full builder.");
        setAutoDone(true);
        return;
      }
      const steps = [
        [350, () => setActiveField("name")],
        [850, () => setDemo(d => ({ ...d, name: "Sarah Okonkwo" }))],
        [1600, () => setActiveField("title")],
        [2150, () => setDemo(d => ({ ...d, title: "Senior Product Designer" }))],
        [3000, () => setActiveField("achievement")],
        [3600, () => setDemo(d => ({ ...d, achievement: "Helped improve the checkout process." }))],
        [5000, () => { setAiState("loading"); setMessage("Creating a demo suggestion..."); }],
        [6100, () => { setAiDraft(DEMO_AI_SUGGESTION); setAiState("ready"); setMessage("Demo suggestion ready."); }],
        [7200, () => { setDemo(d => ({ ...d, achievement: DEMO_AI_SUGGESTION, aiAccepted: true })); setAiState("accepted"); setActiveField("achievement"); setMessage("Suggestion accepted. ATS estimate improved."); }],
        [8500, () => setDemo(d => ({ ...d, template: 1, color: "#2563EB" }))],
        [9500, () => { setActiveField("cta"); setMessage("Your draft is ready to continue."); }],
        [10400, () => { setActiveField(""); setAutoDone(true); }],
      ];
      steps.forEach(([delay, fn]) => timersRef.current.push(setTimeout(() => {
        if (!userTouched) fn();
      }, delay)));
    };
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        observer.disconnect();
        run();
      }
    }, { threshold: 0.35 });
    observer.observe(root);
    return () => { observer.disconnect(); clearTimers(); };
  }, [autoDone, userTouched, reduceMotion]);

  useEffect(() => {
    if (!expanded || typeof document === "undefined") return;
    lastFocusRef.current = document.activeElement;
    const focusables = () => dialogRef.current
      ? Array.from(dialogRef.current.querySelectorAll('button:not([disabled]), [href], textarea, input, select, [tabindex]:not([tabindex="-1"])'))
      : [];
    setTimeout(() => focusables()[0]?.focus(), 30);
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); setExpanded(false); return; }
      if (e.key === "Tab") {
        const items = focusables();
        if (!items.length) return;
        const i = items.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); items[items.length - 1].focus(); }
        if (!e.shiftKey && (i === items.length - 1 || i === -1)) { e.preventDefault(); items[0].focus(); }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      lastFocusRef.current?.focus?.();
    };
  }, [expanded]);

  const inputStyle = (field) => ({
    width: "100%",
    background: "#ffffff0d",
    border: `1.5px solid ${activeField === field ? accent : "#ffffff1f"}`,
    borderRadius: 10,
    padding: "11px 13px",
    fontSize: 14,
    color: C.text1,
    fontFamily: "inherit",
    outline: "none",
    boxSizing: "border-box",
    boxShadow: activeField === field ? `0 0 0 3px ${accent}24` : "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  });

  const handleAi = () => {
    touchDemo();
    setAiState("loading");
    setMessage(text.creatingSuggestion);
    window.setTimeout(() => {
      setAiDraft(DEMO_AI_SUGGESTION);
      setAiState("ready");
      setMessage(text.suggestionReady);
    }, 650);
  };

  const acceptAi = () => {
    updateDemo({ achievement: aiDraft, aiAccepted: true }, "achievement");
    setAiState("accepted");
    setMessage(text.suggestionAccepted);
  };
  const undoAi = () => {
    updateDemo({ achievement: "Helped improve the checkout process.", aiAccepted: false }, "achievement");
    setAiState("ready");
    setMessage(text.suggestionUndone);
  };
  const useSample = () => {
    updateDemo(DEMO_SAMPLE, "achievement");
    setAiState("idle");
    setAiDraft("");
    setMessage(text.sampleLoaded);
  };
  const resetDemo = () => {
    touchDemo();
    setDemo(DEMO_INITIAL);
    setActiveField("");
    setAiState("idle");
    setAiDraft("");
    setMessage(text.demoReset);
    setExportMessage("");
    setView("edit");
  };
  const demoExport = (format) => {
    touchDemo();
    setExportMessage(formatDemoText(text.exportReady, { format }));
    setMessage(formatDemoText(text.exportAvailable, { format }));
    setActiveField("cta");
    window.setTimeout(() => ctaRef.current?.focus?.(), 80);
  };
  const continueDemo = () => {
    touchDemo();
    onContinue({
      name: demo.name,
      title: demo.title,
      achievement: demo.achievement,
      templateId: tpl.id,
      langCode: demo.lang,
    });
  };

  const editor = (
    <DemoEditor
      demo={demo}
      setDemo={updateDemo}
      activeField={activeField}
      setActiveField={setActiveField}
      inputStyle={inputStyle}
      tpl={tpl}
      accent={accent}
      progress={progress}
      completed={completed}
      aiState={aiState}
      aiDraft={aiDraft}
      onAi={handleAi}
      onAcceptAi={acceptAi}
      onUndoAi={undoAi}
      onSample={useSample}
      onReset={resetDemo}
      copy={text}
    />
  );
  const preview = (
    <div style={isMobile ? {} : { position: "sticky", top: 96 }}>
      <ResumePreviewActions onExport={demoExport} onExpand={() => { touchDemo(); setExpanded(true); }} accent={accent} copy={text} />
      <ResumeLivePreview demo={demo} tpl={tpl} lang={lang} accent={accent} activeField={activeField} compact={isMobile} copy={text} />
      {exportMessage && <div role="status" style={{ marginTop: 12, padding: "10px 12px", borderRadius: 10,
        background: `${accent}14`, border: `1px solid ${accent}34`, color: C.text2, fontSize: 12.5, lineHeight: 1.5 }}>{exportMessage}</div>}
      <ATSCompatibilityCard score={score} demo={demo} accent={accent} copy={text} />
      <DemoFeatureList copy={text} />
    </div>
  );

  return (
    <section ref={sectionRef} aria-labelledby="interactive-demo-title"
      onPointerDownCapture={touchDemo} onKeyDownCapture={touchDemo}
      style={{ padding: "78px 24px 84px", background: `linear-gradient(180deg, ${C.accent}08, transparent 78%)`, overflowX: "clip" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <FadeIn style={{ textAlign: "center", marginBottom: 42 }}>
          <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "2px", color: C.accent2, marginBottom: 14 }}>{text.eyebrow}</p>
          <h2 id="interactive-demo-title" style={{ fontSize: "clamp(24px, 3.4vw, 40px)", fontWeight: 800,
            letterSpacing: "-0.8px", color: C.text1, margin: "0 0 12px" }}>
            {text.title}
          </h2>
          <p style={{ fontSize: 15.5, color: C.text2, margin: "0 auto", maxWidth: 660, lineHeight: 1.65 }}>
            {text.desc}
          </p>
        </FadeIn>

        {isMobile && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
            {["edit", "preview"].map(mode => (
              <button key={mode} type="button" aria-pressed={view === mode} onClick={() => { touchDemo(); setView(mode); }}
                style={{ minHeight: 44, borderRadius: 10, border: `1.5px solid ${view === mode ? accent : C.border}`,
                  background: view === mode ? `${accent}18` : C.surface, color: view === mode ? C.text1 : C.text2,
                  fontWeight: 800, fontFamily: "inherit", cursor: "pointer" }}>
                {mode === "edit" ? text.edit : text.preview}
              </button>
            ))}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "0.92fr 1.08fr",
          gap: isMobile ? 18 : 28, alignItems: "start" }}>
          {(!isMobile || view === "edit") && <FadeIn delay={80}>{editor}</FadeIn>}
          {(!isMobile || view === "preview") && <FadeIn delay={150}>{preview}</FadeIn>}
        </div>

        <div style={{ marginTop: 22, display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
          <button ref={ctaRef} type="button" onClick={continueDemo}
            style={{ background: completed ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : C.grad,
              color: "#fff", border: "none", borderRadius: 10, padding: "14px 30px",
              fontSize: 15, fontWeight: 800, cursor: "pointer", fontFamily: "inherit",
              boxShadow: activeField === "cta" ? `0 0 0 4px ${accent}24, 0 14px 40px ${accent}32` : `0 12px 32px ${accent}24`,
              transition: "box-shadow 0.22s, transform 0.22s" }}>
            {completed ? text.continueResume : text.continueBuilder}
          </button>
          <p style={{ margin: 0, color: completed ? "#86efac" : C.text3, fontSize: 12.5 }}>
            {completed ? text.noSignupSaveExport : text.fullBuilderExportAvailable}
          </p>
        </div>
        <div aria-live="polite" aria-atomic="true" className="sr-only">{message}</div>
      </div>
      {expanded && (
        <div onClick={() => setExpanded(false)}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "rgba(0,0,0,0.72)",
            display: "flex", justifyContent: "center", alignItems: isMobile ? "flex-end" : "center", padding: isMobile ? 0 : 24 }}>
          <div ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="demo-preview-dialog-title"
            onClick={e => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 760, maxHeight: isMobile ? "92vh" : "88vh", overflow: "auto",
              background: C.surface, border: `1px solid ${C.border}`, borderRadius: isMobile ? "18px 18px 0 0" : 18,
              padding: isMobile ? 14 : 20, boxShadow: "0 28px 80px rgba(0,0,0,0.55)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, gap: 12 }}>
              <h3 id="demo-preview-dialog-title" style={{ margin: 0, fontSize: 18, color: C.text1 }}>{text.expandedPreview}</h3>
              <button type="button" onClick={() => setExpanded(false)} aria-label={closeLabel}
                style={{ minWidth: 44, minHeight: 44, borderRadius: 10, border: `1px solid ${C.border}`,
                  background: C.elevated, color: C.text1, cursor: "pointer", fontSize: 22 }}>×</button>
            </div>
            <ResumeLivePreview demo={demo} tpl={tpl} lang={lang} accent={accent} activeField={activeField} compact={false} expanded copy={text} />
          </div>
        </div>
      )}
    </section>
  );
}

// The demo is one of the heaviest landing-page subtrees (editor controls,
// preview, ATS card, and modal). It is below the fold, so hydrating all of it
// during first paint creates avoidable DOM and main-thread work. Keep its
// crawlable introduction in the prerendered HTML and mount the interactive
// controls shortly before they enter the viewport.
function DemoEditor({ demo, setDemo, activeField, setActiveField, inputStyle, tpl, accent, progress,
  completed, aiState, aiDraft, onAi, onAcceptAi, onUndoAi, onSample, onReset, copy }) {
  const steps = [
    { id: "identity", label: copy.identity, done: demo.name.trim() && demo.title.trim() },
    { id: "achievement", label: copy.achievement, done: demo.achievement.trim() },
    { id: "customize", label: copy.customize, done: demo.template >= 0 && demo.color && demo.lang },
  ];
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 22,
      boxShadow: "0 18px 54px rgba(0,0,0,0.22)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center", marginBottom: 18 }}>
        <div>
          <div style={{ color: C.text3, fontSize: 11, fontWeight: 800, letterSpacing: "1.4px", textTransform: "uppercase" }}>{copy.guidedDraft}</div>
          <div style={{ color: C.text2, fontSize: 13, marginTop: 4 }}>{formatDemoText(copy.stepOf, { step: progress < 34 ? 1 : progress < 67 ? 2 : 3 })}</div>
        </div>
        <div aria-label={formatDemoText(copy.complete, { progress })} style={{ width: 84, height: 84, borderRadius: "50%",
          background: `conic-gradient(${accent} ${progress}%, ${C.elevated} 0)`, display: "grid", placeItems: "center", flexShrink: 0 }}>
          <div style={{ width: 68, height: 68, borderRadius: "50%", background: C.surface, display: "grid", placeItems: "center",
            color: completed ? "#86efac" : C.text1, fontSize: 18, fontWeight: 900 }}>{progress}%</div>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 22 }}>
        {steps.map(step => (
          <div key={step.id} style={{ border: `1px solid ${step.done ? accent : C.border}`, borderRadius: 10,
            padding: "8px 9px", background: step.done ? `${accent}12` : C.elevated, color: step.done ? C.text1 : C.text3,
            fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden>{step.done ? "✓" : "○"}</span>{step.label}
          </div>
        ))}
      </div>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px" }}>
        <legend style={{ color: C.text1, fontSize: 15, fontWeight: 900, marginBottom: 12 }}>1. {copy.identity}</legend>
        <DemoField id="demo-name" label={copy.fullName} help={copy.fullNameHelp}>
          <input id="demo-name" value={demo.name} placeholder="Sarah Okonkwo"
            onFocus={() => setActiveField("name")}
            onChange={e => setDemo({ name: e.target.value }, "name")}
            style={inputStyle("name")} />
        </DemoField>
        <DemoField id="demo-title" label={copy.jobTitle} help={copy.jobTitleHelp}>
          <input id="demo-title" value={demo.title} placeholder="Senior Product Designer"
            onFocus={() => setActiveField("title")}
            onChange={e => setDemo({ title: e.target.value }, "title")}
            style={inputStyle("title")} />
        </DemoField>
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: "0 0 20px" }}>
        <legend style={{ color: C.text1, fontSize: 15, fontWeight: 900, marginBottom: 12 }}>2. {copy.achievement}</legend>
        <DemoField id="demo-achievement" label={copy.oneAchievement} help={copy.achievementHelp}>
          <textarea id="demo-achievement" value={demo.achievement}
            placeholder="Redesigned the checkout flow and increased conversion by 23%."
            rows={3}
            onFocus={() => setActiveField("achievement")}
            onChange={e => setDemo({ achievement: e.target.value, aiAccepted: false }, "achievement")}
            style={{ ...inputStyle("achievement"), resize: "vertical", lineHeight: 1.55 }} />
        </DemoField>
        <div style={{ marginTop: 10, padding: 12, borderRadius: 12, background: C.elevated, border: `1px solid ${C.border}` }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.text1, fontSize: 13, fontWeight: 900 }}>
              <LineIcon name="spark" size={15} color={accent} /> {copy.demoSuggestion}
            </div>
            <button type="button" disabled={!demo.achievement.trim() || aiState === "loading"} onClick={onAi}
              style={{ minHeight: 38, borderRadius: 9, border: `1px solid ${accent}55`,
                background: demo.achievement.trim() ? `${accent}18` : "transparent", color: demo.achievement.trim() ? C.text1 : C.text3,
                fontWeight: 800, fontSize: 12, cursor: demo.achievement.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", padding: "0 12px" }}>
              {aiState === "loading" ? copy.improving : copy.improveWithAi}
            </button>
          </div>
          {aiDraft && (
            <div style={{ marginTop: 10, color: C.text2, fontSize: 12.5, lineHeight: 1.55 }}>
              <div style={{ color: "#86efac", fontWeight: 800, marginBottom: 4 }}>{copy.suggestedRewrite}</div>
              <div style={{ padding: 10, borderRadius: 9, background: "#ffffff0a", border: `1px solid ${C.border}` }}>{aiDraft}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                <button type="button" onClick={onAcceptAi} style={miniBtn(accent, true)}>{copy.accept}</button>
                <button type="button" onClick={onUndoAi} style={miniBtn(accent, false)}>{copy.undo}</button>
              </div>
            </div>
          )}
          <p style={{ margin: "9px 0 0", color: C.text3, fontSize: 11.5, lineHeight: 1.45 }}>
            {copy.deterministicNote}
          </p>
        </div>
      </fieldset>

      <fieldset style={{ border: "none", padding: 0, margin: 0 }}>
        <legend style={{ color: C.text1, fontSize: 15, fontWeight: 900, marginBottom: 12 }}>3. {copy.customize}</legend>
        <TemplateSelector value={demo.template} onChange={i => setDemo({ template: i }, "template")} accent={accent} copy={copy} />
        <AccentColorSelector value={demo.color} onChange={color => setDemo({ color }, "theme")} copy={copy} />
        <LanguageSelector value={demo.lang} onChange={code => setDemo({ lang: code }, "language")} copy={copy} />
      </fieldset>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 20 }}>
        <button type="button" onClick={onSample} style={miniBtn(accent, true)}>{copy.trySampleProfile}</button>
        <button type="button" onClick={onReset} style={miniBtn(accent, false)}>{copy.resetDemo}</button>
      </div>
    </div>
  );
}

function DemoField({ id, label, help, children }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={id} style={{ display: "block", color: C.text2, fontSize: 12.5, fontWeight: 800, marginBottom: 5 }}>{label}</label>
      {children}
      <div id={`${id}-help`} style={{ color: C.text3, fontSize: 11.5, marginTop: 5 }}>{help}</div>
    </div>
  );
}

function miniBtn(accent, primary) {
  return {
    minHeight: 38,
    borderRadius: 9,
    border: `1px solid ${primary ? accent : C.border}`,
    background: primary ? `${accent}20` : "transparent",
    color: primary ? C.text1 : C.text2,
    fontWeight: 800,
    fontSize: 12,
    cursor: "pointer",
    fontFamily: "inherit",
    padding: "0 12px",
  };
}

function TemplateSelector({ value, onChange, accent, copy }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: C.text3, fontSize: 11, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 9 }}>{copy.resumeTemplate}</div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(118px, 1fr))", gap: 8 }}>
        {DEMO_TEMPLATES.map((tpl, i) => (
          <button key={tpl.name} type="button" aria-pressed={value === i} onClick={() => onChange(i)}
            style={{ minHeight: 58, borderRadius: 10, border: `1.5px solid ${value === i ? accent : C.border}`,
              background: value === i ? `${accent}16` : C.elevated, color: C.text1, cursor: "pointer",
              fontFamily: "inherit", padding: 9, textAlign: "left", display: "flex", gap: 9, alignItems: "center" }}>
            <span aria-hidden style={{ width: 28, height: 34, borderRadius: 4, background: "#fff",
              border: "1px solid #dbe5f2", display: "grid", gridTemplateRows: "8px 1fr", overflow: "hidden", flexShrink: 0 }}>
              <span style={{ background: tpl.accent }} />
              <span style={{ margin: 4, borderLeft: tpl.layout === "bar" ? `5px solid ${tpl.accent}` : "none",
                borderTop: tpl.layout === "rule" ? `2px solid ${tpl.accent}` : "none" }} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: "block", fontSize: 12.5, fontWeight: 900 }}>{tpl.name}</span>
              <span style={{ display: "block", color: C.text3, fontSize: 10.5 }}>{value === i ? copy.selected : copy.atsFriendly}</span>
            </span>
            {value === i && <LineIcon name="check" size={15} color={accent} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function AccentColorSelector({ value, onChange, copy }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: C.text3, fontSize: 11, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 9 }}>{copy.accentColor}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {DEMO_COLORS.map(color => (
          <button key={color.value} type="button" aria-label={formatDemoText(copy.useAccent, { color: color.name })} aria-pressed={value === color.value}
            onClick={() => onChange(color.value)}
            style={{ minWidth: 44, minHeight: 44, borderRadius: 999, border: `2px solid ${value === color.value ? color.value : C.border}`,
              background: C.elevated, cursor: "pointer", display: "grid", placeItems: "center" }}>
            <span aria-hidden style={{ width: 22, height: 22, borderRadius: "50%", background: color.value,
              display: "grid", placeItems: "center", color: "#fff", fontSize: 12, fontWeight: 900 }}>
              {value === color.value ? "✓" : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

function LanguageSelector({ value, onChange, copy }) {
  return (
    <div>
      <div style={{ color: C.text3, fontSize: 11, fontWeight: 800, letterSpacing: "1.2px", textTransform: "uppercase", marginBottom: 9 }}>{copy.language}</div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {Object.entries(DEMO_LANGUAGES).map(([code, lang]) => (
          <button key={code} type="button" aria-pressed={value === code} onClick={() => onChange(code)}
            style={{ minHeight: 40, borderRadius: 9, border: `1.5px solid ${value === code ? C.accent2 : C.border}`,
              background: value === code ? `${C.accent}18` : C.elevated, color: value === code ? C.text1 : C.text2,
              fontWeight: 800, fontSize: 12, cursor: "pointer", fontFamily: "inherit", padding: "0 11px" }}>
            {value === code ? "✓ " : ""}{lang.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function ResumePreviewActions({ onExport, onExpand, accent, copy }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, color: C.text2, fontSize: 12, fontWeight: 900, letterSpacing: "1px", textTransform: "uppercase" }}>
        <span aria-hidden style={{ width: 8, height: 8, borderRadius: "50%", background: "#22c55e", boxShadow: "0 0 14px #22c55e" }} />
        {copy.livePreview}
      </div>
      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", justifyContent: "flex-end" }}>
        {["PDF", "DOCX"].map(format => (
          <button key={format} type="button" onClick={() => onExport(format)}
            style={{ minHeight: 38, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface,
              color: C.text2, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 11.5, padding: "0 10px",
              display: "inline-flex", alignItems: "center", gap: 5 }}>
            <LineIcon name="document" size={13} color={accent} />{format}
          </button>
        ))}
        <button type="button" onClick={onExpand}
          style={{ minHeight: 38, borderRadius: 9, border: `1px solid ${C.border}`, background: C.surface,
            color: C.text2, cursor: "pointer", fontFamily: "inherit", fontWeight: 800, fontSize: 11.5, padding: "0 10px" }}>
          {copy.expand}
        </button>
      </div>
    </div>
  );
}

function ResumeLivePreview({ demo, tpl, lang, accent, activeField, compact, expanded = false, copy }) {
  accent = accentOnPaper(accent, 5);
  const name = demo.name.trim() || "Sarah Okonkwo";
  const title = demo.title.trim() || "Senior Product Designer";
  const achievement = demo.achievement.trim() || "Redesigned onboarding research into three product experiments, improving activation by 18%.";
  const highlight = (field) => activeField === field ? `0 0 0 3px ${accent}30, 0 0 34px ${accent}20` : "none";
  const isRTL = lang.dir === "rtl";
  const bodyColumns = compact ? "1fr" : tpl.layout === "minimal" ? "1fr" : "0.84fr 1.36fr";
  return (
    <article dir={lang.dir} aria-label={copy.livePreviewAria}
      style={{ background: "#fff", borderRadius: 14, overflow: "hidden", color: "#172033",
        fontFamily: tpl.font, boxShadow: expanded ? "none" : "0 26px 70px rgba(0,0,0,0.42)",
        border: `1px solid ${activeField ? accent : "#dbe5f2"}`, transition: "border-color 0.2s, box-shadow 0.2s" }}>
      <header style={{ padding: expanded ? "28px 34px 22px" : "22px 26px 18px",
        background: tpl.layout === "band" ? `linear-gradient(135deg, ${accent}, ${accent}cc)` : "#fff",
        color: tpl.layout === "band" ? "#fff" : "#172033",
        borderBottom: `4px solid ${accent}`,
        boxShadow: highlight("name") || highlight("title"),
        transition: "box-shadow 0.22s, background 0.22s" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "flex-start", flexDirection: isRTL ? "row-reverse" : "row" }}>
          <div>
            <h3 style={{ margin: 0, fontSize: expanded ? 32 : compact ? 23 : 28, lineHeight: 1.05, color: "inherit", fontWeight: 900, letterSpacing: "0" }}>{name}</h3>
            <p style={{ margin: "6px 0 11px", color: tpl.layout === "band" ? "rgba(255,255,255,0.86)" : accent,
              fontSize: expanded ? 15 : 12.5, fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.8px" }}>{title}</p>
            <InlineList items={["sarah@email.com", "London, UK", "linkedin.com/in/sarahokonkwo"]}
              color={tpl.layout === "band" ? "rgba(255,255,255,0.82)" : "#64748b"}
              fontSize={expanded ? 12.5 : 10.5}
              justifyContent={isRTL ? "flex-end" : "flex-start"} />
          </div>
          <div aria-hidden style={{ width: expanded ? 64 : 52, height: expanded ? 64 : 52, borderRadius: "50%",
            background: `linear-gradient(135deg, ${accent}22, ${tpl.side})`, border: `2px solid ${accent}55`, flexShrink: 0,
            display: "grid", placeItems: "center", color: accent, fontWeight: 900 }}>SO</div>
        </div>
      </header>
      <div style={{ display: "grid", gridTemplateColumns: bodyColumns, minHeight: compact ? 430 : 480 }}>
        {tpl.layout !== "minimal" && (
          <aside style={{ background: tpl.side, padding: expanded ? "24px 26px" : "18px 18px",
            borderRight: isRTL ? "none" : "1px solid #e5edf7", borderLeft: isRTL ? "1px solid #e5edf7" : "none" }}>
            <PreviewSection title={lang.summary} accent={accent}>
              Product designer with 8+ years turning complex workflows into clear, accessible SaaS experiences.
            </PreviewSection>
            <PreviewSection title={lang.skills} accent={accent}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: isRTL ? "flex-end" : "flex-start" }}>
                {["UX Strategy", "Figma", "Research", "A/B Testing", "Design Systems"].map(skill => (
                  <span key={skill} style={{ color: accentOnPaper(accent), background: `${accent}12`, border: `1px solid ${accent}24`,
                    borderRadius: 999, padding: "3px 8px", fontSize: expanded ? 12 : 10.5, fontWeight: 800 }}>{skill}</span>
                ))}
              </div>
            </PreviewSection>
            <PreviewSection title={lang.languages} accent={accent}>
              <InlineList items={["English", "French", "Arabic"]} color="#4f5f73"
                fontSize={expanded ? 12 : 10.8} justifyContent={isRTL ? "flex-end" : "flex-start"} />
            </PreviewSection>
          </aside>
        )}
        <main style={{ padding: expanded ? "24px 30px" : "18px 22px" }}>
          {tpl.layout === "minimal" && (
            <PreviewSection title={lang.summary} accent={accent}>
              Product designer with 8+ years turning complex workflows into clear, accessible SaaS experiences.
            </PreviewSection>
          )}
          <PreviewSection title={lang.experience} accent={accent}>
            <PreviewRole title={title} company="Northstar Commerce · 2021-Present" bullets={[
              achievement,
              "Led design critiques and user testing across a 7-person product squad.",
            ]} accent={accent} active={activeField === "achievement"} expanded={expanded} />
            <PreviewRole title="Product Designer" company="BrightCart · 2018-2021" bullets={[
              "Built a reusable checkout component system adopted by four product teams.",
            ]} accent={accent} expanded={expanded} />
          </PreviewSection>
          <PreviewSection title={lang.education} accent={accent}>
            M.A. Human-Computer Interaction, University College London<br />Certified Scrum Product Owner
          </PreviewSection>
        </main>
      </div>
    </article>
  );
}

function PreviewSection({ title, accent, children }) {
  return (
    <section style={{ marginBottom: 16 }}>
      <h4 style={{ margin: "0 0 8px", color: accent, fontSize: 10, lineHeight: 1,
        textTransform: "uppercase", letterSpacing: "1.3px", fontWeight: 900,
        borderBottom: `1.5px solid ${accent}25`, paddingBottom: 5 }}>{title}</h4>
      <div style={{ color: "#4f5f73", fontSize: 12, lineHeight: 1.58 }}>{children}</div>
    </section>
  );
}

function PreviewRole({ title, company, bullets, accent, active, expanded }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ color: "#172033", fontWeight: 900, fontSize: expanded ? 14 : 12.5 }}>{title}</div>
      <div style={{ color: "#64748b", fontWeight: 800, fontSize: expanded ? 12 : 10.5, margin: "2px 0 5px" }}>{company}</div>
      <ul style={{ margin: 0, paddingLeft: 17 }}>
        {bullets.map((bullet, i) => (
          <li key={bullet} style={{ marginBottom: 4, color: "#4f5f73", fontSize: expanded ? 12.5 : 11.2, lineHeight: 1.5,
            background: active && i === 0 ? `${accent}12` : "transparent", borderRadius: 6, padding: active && i === 0 ? "3px 5px" : 0,
            transition: "background 0.22s" }}>{bullet}</li>
        ))}
      </ul>
    </div>
  );
}

function ATSCompatibilityCard({ score, demo, accent, copy }) {
  const text = demo.achievement.trim();
  const suggestion = !demo.name.trim()
    ? copy.atsSuggestionName
    : !demo.title.trim()
      ? copy.atsSuggestionTitle
      : !text
        ? copy.atsSuggestionAchievement
        : !/(\d+|%|\$|revenue|conversion|users|customers|hours|days|drop-off)/i.test(text)
          ? copy.atsSuggestionMetric
          : !/^(redesigned|improved|launched|built|led|increased|reduced|created|delivered|optimized|managed)\b/i.test(text)
            ? copy.atsSuggestionVerb
            : copy.atsSuggestionReady;
  const title = copy.atsEstimateTitle || "";
  return (
    <aside aria-label={`${title} ${score}%`} style={{ marginTop: 14, background: C.surface,
      border: `1px solid ${C.border}`, borderRadius: 14, padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ color: C.text1, fontSize: 13.5, fontWeight: 900 }}>{title}</div>
        <div style={{ color: score >= 82 ? "#86efac" : C.accent2, fontSize: 20, fontWeight: 900 }}>{score}%</div>
      </div>
      <div style={{ height: 8, background: C.elevated, borderRadius: 999, overflow: "hidden", marginBottom: 9 }}>
        <div style={{ width: `${score}%`, height: "100%", background: `linear-gradient(90deg, ${accent}, #22c55e)`,
          borderRadius: 999, transition: "width 0.26s ease" }} />
      </div>
      <p style={{ margin: 0, color: C.text3, fontSize: 12.2, lineHeight: 1.5 }}>{suggestion}</p>
      <p style={{ margin: "8px 0 0", color: C.text3, fontSize: 11 }}>{copy.atsEstimateDisclaimer}</p>
    </aside>
  );
}

function DemoFeatureList({ copy }) {
  const featureCopy = copy.featureChips || [];
  const fallbacks = [
    ["check", "", ""],
    ["globe", "", ""],
    ["spark", "", ""],
    ["document", "", ""],
  ];
  const items = fallbacks.map(([icon, fallbackTitle, fallbackBody], index) => {
    const item = featureCopy[index] || [];
    const itemTitle = item[0];
    const itemBody = item[1];
    return [icon, itemTitle || fallbackTitle, itemBody || fallbackBody];
  });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 8, marginTop: 14 }}>
      {items.map(([icon, title, body]) => (
        <div key={title} title={body} style={{ display: "flex", gap: 9, alignItems: "flex-start",
          background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 11px",
          color: C.text2 }}>
          <LineIcon name={icon} size={15} color={C.accent2} style={{ marginTop: 1 }} />
          <div>
            <div style={{ fontSize: 12.2, fontWeight: 900, color: C.text1 }}>{title}</div>
            <div style={{ fontSize: 11.2, color: C.text3, lineHeight: 1.35, marginTop: 2 }}>{body}</div>
          </div>
        </div>
      ))}
    </div>
  );
}


export default InteractiveResumeDemo;
