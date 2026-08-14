import React from "react";

export default function LandingStats({ colors, items, ariaLabel, className = "" }) {
  return (
    <section className={className} aria-label={ariaLabel} style={{ background: colors.surface, padding: "28px 24px" }}>
      <div style={{
        maxWidth: 900,
        margin: "0 auto",
        display: "flex",
        justifyContent: "space-around",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "16px 32px",
      }}>
        {items.map((item) => (
          <div key={item.label} style={{ textAlign: "center", minWidth: 80 }}>
            <div style={{
              fontSize: "clamp(22px, 3vw, 32px)",
              fontWeight: 800,
              lineHeight: 1,
              background: colors.grad,
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}>
              {item.value}
            </div>
            <div style={{
              fontSize: 11.5,
              color: colors.text3,
              marginTop: 5,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              fontWeight: 600,
            }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
