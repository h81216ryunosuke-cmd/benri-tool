# べんりツール

`fully_automated_stock_income_plan.md` のビジネスプランに基づいて構築した、日本語ニッチ単機能ツールサイトです。
ビルドステップ不要の静的HTML/CSS/JSのみで構成されており、Cloudflare Pagesにそのままデプロイできます。

## 現在の状態

- サイト本体（トップページ、ツール一覧、about/privacy/contact/404、ツール10個）：実装済み
- SEO用meta/schema.org・サイトマップ：実装済み
- GitHub Actions雛形（リンクチェック・Search Console取得・月次レポート）：作成済み（未検証、GitHub連携後に動作）
- GitHubリポジトリ作成・push・Cloudflare Pages連携・AdSense申請：**未実施（このREADMEの手順に沿ってユーザーが行う）**

このPC環境には `gh`（GitHub CLI）が入っていないため、GitHubへのリポジトリ作成・pushは手動で行ってください。

## セットアップ手順

### 1. GitHubリポジトリを作成する

1. https://github.com/new を開き、新しいリポジトリを作成する（例: `benri-tool`）。Public/Privateはどちらでも可（Cloudflare Pagesと連携するだけならPublicで問題なし）。
2. READMEやライセンスなど初期ファイルは追加しない（このフォルダに既にファイル一式があるため）。

### 2. ローカルのコードをpushする

このフォルダで以下を実行します（`<あなたのGitHubユーザー名>` と `<リポジトリ名>` は作成したものに置き換えてください）。

```bash
git remote add origin https://github.com/<あなたのGitHubユーザー名>/<リポジトリ名>.git
git branch -M main
git push -u origin main
```

すでに `git init` と初回コミットは完了しています（`git log` で確認できます）。

### 3. Cloudflare Pagesと連携する

1. https://dash.cloudflare.com/ にログイン → 「Workers & Pages」→「Create」→「Pages」→「Connect to Git」
2. 手順1で作成したリポジトリを選択
3. ビルド設定は以下のとおり（ビルド不要な静的サイトのため）
   - Framework preset: **None**
   - Build command: **（空欄のまま）**
   - Build output directory: **/**
4. 「Save and Deploy」を実行すると `https://<プロジェクト名>.pages.dev` が発行されます

### 4. デプロイ確認

発行されたURLにアクセスし、トップページ・ツール一覧・各ツールが正しく表示・動作するか確認してください。

### 5. サイト内のプレースホルダを実際のURLに置き換える

現在、全ページのcanonical/OGP/schema.org/sitemap.xml/robots.txtには仮のドメイン `https://example.com` が入っています。実際のURL（`https://<プロジェクト名>.pages.dev` または独自ドメイン）が決まったら、リポジトリ全体で一括置換してください。

```bash
# 例（Git Bash）: https://example.com を実際のURLに置換
grep -rl "https://example.com" --include="*.html" --include="*.xml" --include="*.txt" . | xargs sed -i "s|https://example.com|https://実際のURL|g"
```

`contact.html` の `contact@example.com` も、実際に使う連絡先メールアドレスに置き換えてください。

### 6. （任意）独自ドメインを設定する

Cloudflare Pagesの「Custom domains」からドメインを追加します。取得済みのドメインがない場合は、Cloudflare Registrar等で年1,000〜2,000円程度で取得できます（プラン内で唯一の課金推奨ポイント）。更新料の払い忘れに注意し、年1回のリマインダーを設定しておくことを推奨します。

### 7. GitHub Actions用のSecrets/Variablesを設定する

リポジトリの Settings → Secrets and variables → Actions で以下を設定します。**すべて未設定のままでもワークフローはエラーにならず安全にスキップされます**（必要になった時点で設定すればOK）。

| 種別 | 名前 | 用途 |
|---|---|---|
| Variable | `SITE_URL` | 本番サイトURL。`link-check.yml` のライブチェックで使用 |
| Secret | `GSC_SERVICE_ACCOUNT_JSON` | Search Console APIのサービスアカウントJSON鍵（手順8参照） |
| Variable | `GSC_SITE_URL` | Search Consoleに登録したプロパティURL |

### 8. Google Search Consoleと連携する

1. https://search.google.com/search-console でプロパティを登録（手順3で確認したURLを使用）
2. Google Cloud Consoleで新規プロジェクトを作成し、「Search Console API」を有効化
3. サービスアカウントを作成し、JSON鍵をダウンロード
4. Search Consoleの「設定」→「ユーザーと権限」で、サービスアカウントのメールアドレスを閲覧者として追加
5. ダウンロードしたJSONファイルの中身をそのまま `GSC_SERVICE_ACCOUNT_JSON` シークレットに登録

### 9. Google AdSenseに申請する

1. `privacy.html` と `contact.html` が正しく機能していることを確認（手順5で連絡先を実際のものに更新済みであること）
2. https://www.google.com/adsense/ から申請
3. 審査には数週間〜1ヶ月程度かかる場合があります。承認前は収益は発生しません（プランのKPIどおり、最初の1〜2ヶ月は収益ゼロが前提です）
4. 承認後、発行された `ads.txt` の内容を `ads.txt` ファイルの `pub-XXXXXXXXXXXXXXXX` 部分に反映してください

### 10. 月次レポートの確認方法

`monthly-summary.yml` が毎月1日に自動実行され、`reports/monthly/YYYY-MM.md` としてレポートがコミットされます。GitHub上でそのファイルを開くだけで確認できます。月1回、このレポートを見て「新しいツールを追加するか」「このまま放置するか」を判断する運用です（プランのPhase 3）。

## 今後、新しいツールを追加する場合

1. `docs/niche-tool-ideas.md` の候補リストから優先度Aのものを選ぶ（または新規候補を追記する）
2. `docs/tool-page-template.html` をコピーして `tools/<slug>/index.html` を作成し、プレースホルダを埋める
3. `index.html` と `tools/index.html` にツールカードを追加する
4. `node scripts/generate-sitemap.mjs` を実行して `sitemap.xml` を更新する（初回は `cd scripts && npm install` が必要）
5. `docs/niche-tool-ideas.md` の該当行のステータスを「実装済み」に更新する

Claude Codeにこの作業を依頼する場合は「`docs/niche-tool-ideas.md` の#11〜#20から3件選んで、既存ツールと同じ構成で実装して」のように具体的に指示すると、既存の実装パターン（`tools/warikan/index.html` 等）を踏襲した実装になります。

## ディレクトリ構成

```
/
├── index.html, about.html, privacy.html, contact.html, 404.html
├── sitemap.xml, robots.txt, ads.txt
├── assets/css/style.css, assets/img/favicon.svg
├── tools/                  … 各ツール（tools/<slug>/index.html）
├── docs/                   … ニッチツール候補リスト、新規ツール用テンプレート
├── scripts/                … GitHub Actions用のNode.jsスクリプト（サイト本体とは依存分離）
├── reports/                … Search Console週次データ・月次サマリーの出力先
└── .github/workflows/      … リンクチェック・週次レポート・月次サマリーの自動化
```
