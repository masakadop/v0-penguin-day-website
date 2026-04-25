# GitHub Actions 障害調査レポート（2026-04-25）

## 1. 調査目的
直近の GitHub Actions 失敗について、再現可能な事実ベースで原因を切り分け、修正方針を定義する。

## 2. 事実確認（ローカル）
- 対象ワークフロー: `.github/workflows/deploy-pages.yml`
- ローカルで `pnpm install --frozen-lockfile` は成功。
- ローカルで `pnpm build`（Next.js static export）は成功。
- `out/` ディレクトリは生成され、`upload-pages-artifact` の入力前提は満たせる。

## 3. 調査結果（原因の評価）
### 3.1 直接原因（最有力）
**Pages デプロイ時の権限/実行コンテキスト依存エラー**の可能性が最も高い。

理由:
1. Build と artifact 生成の前提はローカル検証で満たしており、ビルド失敗起因の可能性が低い。
2. GitHub Pages 公式ドキュメントでは `deploy-pages` ジョブに `pages: write` と `id-token: write` が必須で、権限の過不足・スコープ不整合が失敗要因になりやすい。
3. 直近の履歴でも workflow 権限修正が繰り返し入っており、同領域で不安定性が発生している。

### 3.2 副次要因（再発リスク）
- ワークフロー全体に権限が広く付与されており、**build/deploy の責務分離が弱い**。
- 失敗時に「どの段で落ちたか」が見えにくく、調査コストが高い（デバッグ情報不足）。

## 4. 対応方針（修正計画）

### 4.1 今回PRで実施する修正
1. `permissions` を**ジョブ単位に分離**し最小権限化する。  
   - `build`: `contents: read` のみ  
   - `deploy`: `pages: write`, `id-token: write`（必要に応じて `contents: read`）
2. `deploy` ジョブに `timeout-minutes` を設定し、ハング時の失敗判定を明確化する。
3. 失敗分析しやすいよう、ワークフロー定義を整理（コメント追加/責務明確化）。

### 4.2 追加運用（次フェーズ）
- GitHub リポジトリ Settings > Pages の publishing source が Actions になっていることを確認。
- 必要なら `workflow_dispatch` で再実行し、失敗時に run URL を本レポートへ追記する。

## 5. 受け入れ基準
- `pnpm install --frozen-lockfile` が成功する。
- `pnpm build` が成功し `out/` が生成される。
- workflow YAML の権限が build/deploy で分離されている。

## 6. 実施ステータス
- [x] 原因切り分け
- [x] 修正計画作成
- [x] 修正反映
- [x] 修正後検証
