#!/usr/bin/env node
// Builder section smoke guard (browser-free).
//
// Regression net for the crash where opening the cover letter "Closing &
// signature" section threw "Cannot read properties of undefined (reading
// 'style')" and took down the whole app. Root cause: <IconInput> clones a SINGLE
// child (React.cloneElement(children, { style: { ...children.props.style }})),
// but was given an <input> plus a sibling <datalist>, so `children` became an
// array and `children.props` was undefined.
//
// This asserts the single-child contract statically (no browser needed, runs in
// the normal CI pipeline). The full mount-and-open-every-section coverage lives
// in tests/e2e/smoke.spec.js ("Cover letter builder sections").
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "@babel/parser";
import _traverse from "@babel/traverse";

const traverse = _traverse.default || _traverse;
const ROOT = process.cwd();
const FILE = join(ROOT, "src", "ResumeGenerator.jsx");

// Components that clone a single child and therefore must never receive more than
// one element child in JSX (else `children.props` is undefined and reading a prop
// off it crashes). Add any future single-child cloner here.
const SINGLE_CHILD_CLONERS = new Set(["IconInput"]);

const code = readFileSync(FILE, "utf8");
const ast = parse(code, { sourceType: "module", plugins: ["jsx"] });

const failures = [];

// Count children that render as elements (JSX elements, and expression containers
// that aren't pure whitespace/comments). Whitespace-only JSXText is ignored.
function elementChildCount(node) {
  let count = 0;
  for (const child of node.children) {
    if (child.type === "JSXText") {
      if (child.value.trim() !== "") count += 1; // stray text is also a 2nd child
    } else if (child.type === "JSXElement" || child.type === "JSXFragment") {
      count += 1;
    } else if (child.type === "JSXExpressionContainer") {
      // {expr} that isn't an empty/comment container counts as a rendered child.
      if (child.expression && child.expression.type !== "JSXEmptyExpression") count += 1;
    }
  }
  return count;
}

traverse(ast, {
  JSXElement(path) {
    const opening = path.node.openingElement;
    const name = opening.name && opening.name.name;
    if (!SINGLE_CHILD_CLONERS.has(name)) return;
    const n = elementChildCount(path.node);
    if (n !== 1) {
      failures.push({ name, line: opening.loc.start.line, count: n });
    }
  },
});

// Sanity: the cover letter builder must still declare all five section cards, so
// this guard stays meaningful if the sections are renamed/refactored.
const REQUIRED_SECTION_TITLE_KEYS = ["cardRecipient", "cardYourInfo", "cardOpening", "cardBody", "cardClosing"];
for (const key of REQUIRED_SECTION_TITLE_KEYS) {
  if (!code.includes(`cu.${key}`)) {
    failures.push({ name: `cover section cu.${key}`, line: 0, count: 0, missing: true });
  }
}

if (failures.length) {
  console.error("\n✖ builder-section guard failed:\n");
  for (const f of failures) {
    if (f.missing) {
      console.error(`  Missing expected cover-letter section title: ${f.name}`);
    } else {
      console.error(`  <${f.name}> at ResumeGenerator.jsx:${f.line} has ${f.count} element children; it clones a single child and must wrap exactly one (move siblings like <datalist> outside).`);
    }
  }
  console.error("");
  process.exit(1);
}

console.log("✓ builder-section guard: IconInput single-child contract holds; all 5 cover sections present.");
