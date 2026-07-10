import React, { createContext, useContext } from "react";
import { linkifyText } from "../utils/linkify.js";

const LINK_STYLE = {
  color: "inherit",
  textDecoration: "none",
  borderBottom: "1px solid currentColor",
};

const LinkifyLinksEnabledContext = createContext(true);

export function LinkifyLinksProvider({ enabled = true, children }) {
  return (
    <LinkifyLinksEnabledContext.Provider value={enabled}>
      {children}
    </LinkifyLinksEnabledContext.Provider>
  );
}

/** False inside a non-interactive paper (gallery thumbnails, template previews). */
export function useLinkifyLinksEnabled() {
  return useContext(LinkifyLinksEnabledContext);
}

function renderText(value, keyPrefix) {
  const chunks = String(value || "").split("\n");
  return chunks.flatMap((chunk, index) => (
    index === 0
      ? [chunk]
      : [<br key={`${keyPrefix}-br-${index}`} />, chunk]
  ));
}

export default function LinkifiedText({ text, className, style }) {
  const linksEnabled = useContext(LinkifyLinksEnabledContext);
  return (
    <span
      className={className}
      dir="auto"
      style={{ unicodeBidi: "plaintext", ...style }}
    >
      {linkifyText(text).map((part, index) => {
        if (part.type !== "link" || !linksEnabled) {
          return <React.Fragment key={index}>{renderText(part.text, index)}</React.Fragment>;
        }
        return (
          <a
            key={index}
            href={part.href}
            target={part.external ? "_blank" : undefined}
            rel={part.external ? "noopener noreferrer" : undefined}
            style={LINK_STYLE}
          >
            <bdi dir="auto" style={{ unicodeBidi: "isolate" }}>{part.text}</bdi>
          </a>
        );
      })}
    </span>
  );
}
