// Google Search Console API から直近7日間の流入データを取得し、
// reports/search-console/YYYY-MM-DD.json として保存するスクリプト。
//
// 必要な環境変数（GitHub Actions Secrets/Variablesとして設定）:
//   GSC_SERVICE_ACCOUNT_JSON : サービスアカウントのJSON鍵（文字列そのまま）
//   GSC_SITE_URL             : Search Consoleに登録済みのプロパティURL（例: https://benri-tool.pages.dev/）
//
// どちらか未設定の場合は何もせず正常終了する（README.mdのセットアップ手順を参照）。
import { google } from "googleapis";
import { mkdirSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

const serviceAccountJson = process.env.GSC_SERVICE_ACCOUNT_JSON;
const siteUrl = process.env.GSC_SITE_URL;

if (!serviceAccountJson || !siteUrl) {
  console.log(
    "GSC_SERVICE_ACCOUNT_JSON または GSC_SITE_URL が未設定のため、Search Console連携をスキップします。" +
      "（README.mdの「Search Console連携」手順を参照してください）"
  );
  process.exit(0);
}

const credentials = JSON.parse(serviceAccountJson);
const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ["https://www.googleapis.com/auth/webmasters.readonly"],
});

const searchconsole = google.searchconsole({ version: "v1", auth });

const endDate = new Date();
const startDate = new Date();
startDate.setDate(endDate.getDate() - 7);
const fmt = (d) => d.toISOString().slice(0, 10);

const res = await searchconsole.searchanalytics.query({
  siteUrl,
  requestBody: {
    startDate: fmt(startDate),
    endDate: fmt(endDate),
    dimensions: ["page"],
    rowLimit: 200,
  },
});

const outDir = join(ROOT, "reports", "search-console");
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, `${fmt(endDate)}.json`);

writeFileSync(
  outPath,
  JSON.stringify(
    {
      fetchedAt: new Date().toISOString(),
      period: { start: fmt(startDate), end: fmt(endDate) },
      siteUrl,
      rows: res.data.rows || [],
    },
    null,
    2
  ),
  "utf-8"
);

console.log(`Search Consoleデータを保存しました: ${outPath}`);
