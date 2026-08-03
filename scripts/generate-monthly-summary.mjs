// reports/search-console/*.json を集計し、reports/monthly/YYYY-MM.md として
// 月次サマリーレポートを生成するスクリプト。データが1件もない場合は、
// その旨を明記したレポートを出力する（Search Console未連携でも安全に実行できる）。
import { readdirSync, readFileSync, mkdirSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const scDir = join(ROOT, "reports", "search-console");
const monthlyDir = join(ROOT, "reports", "monthly");
mkdirSync(monthlyDir, { recursive: true });

const now = new Date();
const yyyyMm = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
const outPath = join(monthlyDir, `${yyyyMm}.md`);

const files = existsSync(scDir)
  ? readdirSync(scDir).filter((f) => f.endsWith(".json"))
  : [];

if (files.length === 0) {
  writeFileSync(
    outPath,
    `# 月次サマリー ${yyyyMm}\n\n` +
      `Search Console連携が未設定のため、アクセスデータはまだありません。\n` +
      `README.mdの「Search Console連携」手順を完了すると、次回以降ここに流入データが集計されます。\n`,
    "utf-8"
  );
  console.log(`データなしのレポートを出力しました: ${outPath}`);
  process.exit(0);
}

const pageTotals = new Map();

for (const file of files) {
  const data = JSON.parse(readFileSync(join(scDir, file), "utf-8"));
  for (const row of data.rows || []) {
    const page = row.keys?.[0] || "unknown";
    const prev = pageTotals.get(page) || { clicks: 0, impressions: 0 };
    prev.clicks += row.clicks || 0;
    prev.impressions += row.impressions || 0;
    pageTotals.set(page, prev);
  }
}

const sorted = [...pageTotals.entries()].sort((a, b) => b[1].clicks - a[1].clicks);

let md = `# 月次サマリー ${yyyyMm}\n\n`;
md += `集計対象ファイル数: ${files.length}\n\n`;
md += `| ページ | クリック数 | 表示回数 |\n|---|---|---|\n`;
for (const [page, totals] of sorted) {
  md += `| ${page} | ${totals.clicks} | ${totals.impressions} |\n`;
}

writeFileSync(outPath, md, "utf-8");
console.log(`月次サマリーを出力しました: ${outPath}`);
