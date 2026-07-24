import { ViteReactSSG } from "vite-react-ssg";
import { routes } from "./routes.jsx";
import { normalizeInternalUrl } from "./seo/localizedRoutes.js";

if (typeof window !== "undefined") {
  const current = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  const normalized = normalizeInternalUrl(current);
  if (normalized !== current) window.history.replaceState(window.history.state, "", normalized);
}

export const createRoot = ViteReactSSG({ routes });
