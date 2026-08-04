// tools/ 配下と主要ページをスキャンして sitemap.xml を再生成するスクリプト。
// 依存パッケージなしで動作（node scripts/generate-sitemap.mjs で実行可能）。
import { readdirSync, existsSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SITE_URL = process.env.SITE_URL || "https://benri-tool.pages.dev";

const staticPages = ["/", "/tools/", "/about.html", "/privacy.html", "/contact.html"];

const toolsDir = join(ROOT, "tools");
const toolSlugs = existsSync(toolsDir)
  ? readdirSync(toolsDir, { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
  : [];

const toolPages = toolSlugs.map((slug) => `/tools/${slug}/`);
const urls = [...staticPages, ...toolPages];

const xml =
  `<?xml version="1.0" encoding="UTF-8"?>\n` +
  `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((path) => `  <url><loc>${SITE_URL}${path}</loc></url>`).join("\n") +
  `\n</urlset>\n`;

writeFileSync(join(ROOT, "sitemap.xml"), xml, "utf-8");
console.log(`sitemap.xml を更新しました（${urls.length}件のURL、SITE_URL=${SITE_URL}）`);
