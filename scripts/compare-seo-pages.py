#!/usr/bin/env python3
from html.parser import HTMLParser
from itertools import combinations
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[1]
BASE = ROOT / "dist" if (ROOT / "dist" / "index.html").exists() else ROOT / "public"
STOPWORDS = {
    "applycraft", "resume", "builder", "free", "your", "with", "that", "this",
    "from", "have", "will", "download", "template", "templates", "page",
    "build", "building", "start", "required", "minutes", "professional",
}


class VisibleTextParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.skip_stack = []
        self.parts = []

    def handle_starttag(self, tag, attrs):
        if tag in {"script", "style", "nav", "footer", "noscript", "svg"}:
            self.skip_stack.append(tag)

    def handle_endtag(self, tag):
        if self.skip_stack and self.skip_stack[-1] == tag:
            self.skip_stack.pop()

    def handle_data(self, data):
        if not self.skip_stack:
            self.parts.append(data)

    def text(self):
        return " ".join(self.parts)


def html_files():
    if BASE.name == "dist":
        return sorted(BASE.glob("**/index.html"))
    return sorted((ROOT / "public").glob("**/index.html")) + [ROOT / "index.html"]


def route_for(path):
    if path == ROOT / "index.html" or path == BASE / "index.html":
        return "/"
    rel = path.relative_to(BASE if BASE.name == "dist" else ROOT / "public")
    return "/" + str(rel.parent).replace(".", "").strip("/") + "/"


def tokens(path):
    parser = VisibleTextParser()
    parser.feed(path.read_text(encoding="utf-8", errors="ignore"))
    words = re.findall(r"[a-z0-9]+", parser.text().lower())
    return {word for word in words if len(word) > 3 and word not in STOPWORDS}


def jaccard(a, b):
    if not a and not b:
        return 0
    return len(a & b) / len(a | b)


pages = [(route_for(path), tokens(path)) for path in html_files()]
threshold = float(sys.argv[1]) if len(sys.argv) > 1 else 0.32
matches = []

for (route_a, tokens_a), (route_b, tokens_b) in combinations(pages, 2):
    score = jaccard(tokens_a, tokens_b)
    if score >= threshold:
        matches.append((score, route_a, route_b))

if not matches:
    print(f"No unusually similar page pairs found at threshold {threshold:.2f}.")
    sys.exit(0)

print(f"Unusually similar page pairs at threshold {threshold:.2f}:")
for score, route_a, route_b in sorted(matches, reverse=True):
    print(f"{score:.3f}\t{route_a}\t{route_b}")
