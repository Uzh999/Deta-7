import { readFileSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

import { SUPPORTED_LANGUAGES } from "./src/app/languages";
import { OG_LOCALES, SITE_URL } from "./src/app/site";

function escapeAttr(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

/** Replaces one attribute on the single tag matched by `tagPattern`. */
function setTagAttr(
  html: string,
  tagPattern: RegExp,
  attr: "content" | "href",
  value: string,
): string {
  let matched = false;
  const result = html.replace(tagPattern, (tag) => {
    matched = true;
    return tag.replace(
      new RegExp(`${attr}="[^"]*"`),
      `${attr}="${escapeAttr(value)}"`,
    );
  });

  if (!matched) {
    throw new Error(`localizedPages: tag not found in index.html: ${tagPattern}`);
  }
  return result;
}

/**
 * Writes dist/<lang>/index.html with that language's <html lang>, title,
 * description, canonical and Open Graph tags. The page is still the same SPA;
 * this only means crawlers and link previews that do not run JavaScript see
 * the right language instead of the Polish defaults.
 */
function localizedPages(): Plugin {
  return {
    name: "localized-pages",
    apply: "build",
    writeBundle(options, bundle) {
      const outDir = options.dir ?? "dist";
      const entry = bundle["index.html"];
      if (!entry || entry.type !== "asset") return;

      const template = String(entry.source);

      for (const lang of SUPPORTED_LANGUAGES) {
        const locale = JSON.parse(
          readFileSync(`src/i18n/locales/${lang}.json`, "utf8"),
        ) as { seo: { title: string; description: string } };

        const { title, description } = locale.seo;
        const url = `${SITE_URL}/${lang}`;

        let html = template
          .replace(/<html lang="[^"]*">/, `<html lang="${lang}">`)
          .replace(/<title>[^<]*<\/title>/, `<title>${escapeAttr(title)}</title>`);

        html = setTagAttr(html, /<meta name="description"[^>]*>/, "content", description);
        html = setTagAttr(html, /<link rel="canonical"[^>]*>/, "href", url);
        html = setTagAttr(html, /<meta property="og:title"[^>]*>/, "content", title);
        html = setTagAttr(html, /<meta property="og:description"[^>]*>/, "content", description);
        html = setTagAttr(html, /<meta property="og:url"[^>]*>/, "content", url);
        html = setTagAttr(html, /<meta property="og:locale"[^>]*>/, "content", OG_LOCALES[lang]);

        const dir = join(outDir, lang);
        mkdirSync(dir, { recursive: true });
        writeFileSync(join(dir, "index.html"), html);
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), localizedPages()],
  build: {
    // MapLibre is loaded as its own lazy chunk by the Location section, so the
    // default 500 kB warning only fires for that expected chunk.
    chunkSizeWarningLimit: 1200,
  },
});
