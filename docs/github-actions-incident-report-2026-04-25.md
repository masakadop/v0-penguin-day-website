# GitHub Actions 障害調査レポート（2026-04-25）

## 1. 調査対象
- 対象ワークフロー: `.github/workflows/deploy-pages.yml`
- 対象ラン: **直近の失敗ラン** `24918041406`
- 実行日時（UTC）: `2026-04-25T00:30:38Z`
- ワークフロー名: `Deploy Next.js site to GitHub Pages`

## 2. 取得方法
`gh` CLI が未導入のため、GitHub REST API と公開 run ページから調査した。

- 実行履歴取得: `GET /repos/{owner}/{repo}/actions/runs`
- ジョブ/ステップ取得: `GET /repos/{owner}/{repo}/actions/runs/{run_id}/jobs`
- run ページ注釈取得: `https://github.com/masakadop/v0-penguin-day-website/actions/runs/24918041406`

## 3. 直近失敗ランのエラーログ

### 3.1 ジョブ結果
- `build`: **failure**
- `deploy`: skipped

### 3.2 失敗ステップ
- `build` ジョブの `Configure Pages` ステップ（step 8）が failure。

### 3.3 run 注釈に表示されたエラーメッセージ
以下は run ページ上に表示されたエラー本文（要点）:

- `Get Pages site failed. Please verify that the repository has Pages enabled and configured to build using GitHub Actions, or consider exploring the enablement parameter for this action.`
- `Error: Resource not accessible by integration`
- 参照 API: `https://docs.github.com/rest/pages/pages#get-a-apiname-pages-site`

### 3.4 補足
- 同 run では `Install dependencies` と `Build static export` は success。
- 失敗はビルド処理ではなく、Pages 設定処理（`actions/configure-pages`）で発生している。

## 4. 原因究明（エラーログ起点）

### 4.1 直接原因
`Configure Pages` が `Resource not accessible by integration` で失敗している。
これは `actions/configure-pages@v5` が内部で Pages API を呼ぶ際に、ジョブの `GITHUB_TOKEN` 権限が不足しているときに発生する代表的な失敗。

### 4.2 ワークフロー定義との照合結果
現行の `build` ジョブ権限は `contents: read` のみで、`Configure Pages` 実行に必要な `pages: write` が付与されていない。

### 4.3 なぜ deploy ジョブ側の `pages: write` では不足か
権限は **ジョブ単位** で評価されるため、`deploy` ジョブで `pages: write` を付与していても、`build` ジョブ内で実行される `Configure Pages` には適用されない。

### 4.4 原因結論
今回の直近失敗ランの主因は、`build` ジョブにおける Pages API 実行権限（`pages: write`）不足。
