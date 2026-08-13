import React from "react";

const skills = ["Figma", "UX Research", "Design Systems", "Prototyping"];
const sample = {
  initials: "CY", name: "CY Applicant", role: "Product Designer", profile: "Profile",
  experience: "Experience", education: "Education", skills: "Skills",
  structured: "ATS structure recognized", design: "Product design", recognized: "Education recognized",
};

function ResumeContent({ structured = false }) {
  return <div className={`ac-scan-content${structured ? " is-structured" : ""}`}>
    <div className="ac-scan-head">
      <span className="ac-scan-avatar">{sample.initials}</span>
      <div><div className="ac-scan-name">{sample.name}</div><div className="ac-scan-role">{sample.role}</div></div>
    </div>
    <div className="ac-scan-rule" />
    <div className="ac-scan-columns">
      <div>
        <div className="ac-scan-label">{sample.experience}</div>
        {structured ? <><div className="ac-scan-tag">{sample.structured}</div><div className="ac-scan-job">{sample.design}</div></> : <><div className="ac-scan-line wide" /><div className="ac-scan-line" /><div className="ac-scan-line short" /></>}
        <div className="ac-scan-label">{sample.education}</div>
        {structured ? <div className="ac-scan-field"><i />{sample.recognized}</div> : <><div className="ac-scan-line wide" /><div className="ac-scan-line short" /></>}
      </div>
      <div>
        <div className="ac-scan-label">{sample.skills}</div>
        {structured ? <div className="ac-scan-skills">{skills.map(skill => <span key={skill}>{skill}</span>)}</div> : <><div className="ac-scan-line wide" /><div className="ac-scan-line" /><div className="ac-scan-line short" /></>}
        <div className="ac-scan-label ac-scan-later">{sample.profile}</div>
        <div className="ac-scan-line wide" /><div className="ac-scan-line" />
      </div>
    </div>
  </div>;
}

export default function HeroResumeScanner({ copy, rtl = false }) {
  const notes = copy?.notes || [];
  return <section className="ac-hero-preview ac-resume-scanner" dir={rtl ? "rtl" : "ltr"}>
    <style>{`
      .ac-resume-scanner{position:relative;width:min(100%,500px);height:540px;margin:auto;isolation:isolate}
      .ac-scan-glow{position:absolute;inset:12% 8% 5%;background:radial-gradient(circle,#7048e844,transparent 68%);filter:blur(20px)}
      .ac-scan-back,.ac-scan-paper{position:absolute;width:330px;height:448px;border-radius:14px;background:#fff}
      .ac-scan-back{inset:48px auto auto 50%;transform:translateX(-45%) rotate(6deg);opacity:.3;border:1px solid #818cf866;box-shadow:0 28px 80px #02061799}
      .ac-scan-paper{inset:30px auto auto 50%;transform:translateX(-55%);overflow:hidden;color:#182238;border:1px solid #dbe4f0;box-shadow:0 30px 80px #020617b8}
      .ac-scan-content{position:absolute;inset:0;padding:28px;background:#fff}
      .ac-scan-content.is-structured{clip-path:inset(0 0 100%);background:linear-gradient(180deg,#fff,#f8f7ff);animation:acReveal 6.6s linear infinite}
      .ac-scan-head{display:flex;align-items:center;gap:13px}.ac-scan-avatar{display:grid;place-items:center;width:50px;height:50px;border-radius:50%;background:linear-gradient(135deg,#7c3aed,#2563eb);color:#fff;font-size:17px;font-weight:900;letter-spacing:.5px}
      .ac-scan-name{font-size:19px;font-weight:900;letter-spacing:-.3px}.ac-scan-role{margin-top:3px;color:#64748b;font-size:11px;font-weight:700}.ac-scan-rule{height:2px;margin:18px 0;background:linear-gradient(90deg,#7c3aed,#2563eb 48%,#e2e8f0 48%)}
      .ac-scan-columns{display:grid;grid-template-columns:1.25fr .9fr;gap:22px}.ac-scan-label{margin:7px 0 11px;color:#5b21b6;font-size:9px;font-weight:900;letter-spacing:1.2px;text-transform:uppercase}.ac-scan-later{margin-top:28px}
      .ac-scan-line{height:6px;margin:0 0 9px;border-radius:4px;background:#d8e0eb;width:78%}.ac-scan-line.wide{width:100%}.ac-scan-line.short{width:55%;margin-bottom:27px}
      .ac-scan-tag{display:inline-block;margin-bottom:12px;padding:5px 7px;border:1px solid #8b5cf644;border-radius:5px;background:#ede9fe;color:#5b21b6;font-size:8px;font-weight:900}.ac-scan-job{height:34px;border-inline-start:3px solid #7c3aed;padding:5px 8px;color:#475569;font-size:9px;font-weight:800}
      .ac-scan-field{display:flex;gap:6px;align-items:center;color:#475569;font-size:9px;font-weight:800}.ac-scan-field i{width:6px;height:6px;border-radius:50%;background:#2563eb}.ac-scan-skills{display:flex;flex-wrap:wrap;gap:6px}.ac-scan-skills span{padding:5px 7px;border-radius:5px;background:#e0e7ff;color:#3730a3;font-size:8px;font-weight:900}
      .ac-scan-beam{position:absolute;z-index:4;inset-inline:0;top:0;height:2px;background:#a78bfa;box-shadow:0 0 7px 2px #8b5cf6,0 0 24px 5px #2563eb88;animation:acBeam 6.6s linear infinite}
      .ac-scan-notes{position:absolute;inset:0;z-index:5;pointer-events:none}.ac-scan-note{position:absolute;max-width:160px;padding:9px 12px;border:1px solid #a78bfa55;border-radius:10px;background:#11182ddd;box-shadow:0 14px 34px #02061788;backdrop-filter:blur(10px);color:#e9e7ff;font-size:11px;font-weight:750;opacity:0;animation:acNote 6.6s ease infinite}.ac-scan-note:before{content:'✓';margin-inline-end:6px;color:#a78bfa}.ac-scan-note:nth-child(1){top:26%;inset-inline-end:0}.ac-scan-note:nth-child(2){top:49%;inset-inline-start:0;animation-delay:1.15s}.ac-scan-note:nth-child(3){top:71%;inset-inline-end:2%;animation-delay:2.3s}
      .ac-scan-orbit{position:absolute;inset:80px 22px 30px;border:1px solid #818cf833;border-radius:50%;animation:acOrbit 5s ease-in-out infinite}.ac-scan-orbit:before,.ac-scan-orbit:after{content:'';position:absolute;width:7px;height:7px;border-radius:50%;background:#818cf8;box-shadow:0 0 14px #818cf8}.ac-scan-orbit:before{top:12%;left:8%}.ac-scan-orbit:after{right:5%;bottom:18%;background:#38bdf8}
      @keyframes acReveal{0%,8%{clip-path:inset(0 0 100%)}70%,84%{clip-path:inset(0)}100%{clip-path:inset(0 0 100%)}}
      @keyframes acBeam{0%,8%{top:0;opacity:0}10%{opacity:1}70%,84%{top:calc(100% - 2px);opacity:1}92%,100%{top:0;opacity:0}}
      @keyframes acNote{0%,20%,38%,100%{opacity:0;transform:translateY(7px)}24%,34%{opacity:1;transform:none}}
      @keyframes acOrbit{50%{opacity:.5}}
      @media(max-width:600px){.ac-resume-scanner{height:445px}.ac-scan-back,.ac-scan-paper{width:276px;height:375px}.ac-scan-back{top:42px}.ac-scan-paper{top:20px}.ac-scan-content{padding:22px}.ac-scan-avatar{width:43px;height:43px}.ac-scan-name{font-size:16px}.ac-scan-columns{gap:15px}.ac-scan-note{max-width:132px;padding:7px 9px;font-size:9px}.ac-scan-orbit{inset:62px 8px 28px}}
      @media(max-width:340px){.ac-resume-scanner{height:410px}.ac-scan-back,.ac-scan-paper{width:244px;height:350px}.ac-scan-content{padding:19px}.ac-scan-note{max-width:112px}.ac-scan-orbit{inset:55px 5px 24px}}
      @media(prefers-reduced-motion:reduce){.ac-scan-content.is-structured{clip-path:inset(0);animation:none}.ac-scan-beam{top:calc(100% - 2px);opacity:.45;animation:none}.ac-scan-note{opacity:1;transform:none;animation:none}.ac-scan-orbit{animation:none}}
    `}</style>
    <div role="img" aria-label={copy?.aria}>
      <div className="ac-scan-glow" aria-hidden="true" /><div className="ac-scan-orbit" aria-hidden="true" /><div className="ac-scan-back" aria-hidden="true" />
      <div className="ac-scan-paper" aria-hidden="true"><ResumeContent /><ResumeContent structured /><div className="ac-scan-beam" /></div>
      <div className="ac-scan-notes" aria-hidden="true">{notes.slice(0, 3).map((note) => <div className="ac-scan-note" key={note}>{note}</div>)}</div>
    </div>
  </section>;
}
