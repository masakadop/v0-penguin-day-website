# GitHub Actions 障害調査レポート（2026-04-25）

## 1. 調査対象
- 対象: GitHub Pages デプロイ用 workflow（`.github/workflows/deploy-pages.yml`）
- 観点: **直近で失敗した GitHub Actions の原因推定**

## 2. 調査時点の制約
- この実行環境では `gh` CLI が未導入で、リモート URL も未設定のため、失敗 run の Web ログ（run URL / step log）を直接取得できない。
- そのため、今回は以下の一次情報から事実を積み上げて原因を切り分けた。
  1. 現行 workflow 定義
  2. 直近の CI 関連コミット履歴
  3. ローカル再現テスト（install/build）

## 3. 事実確認

### 3.1 workflow 定義の現状
- `build` ジョブは `contents: read` のみ。
- `deploy` ジョブは `pages: write` と `id-token: write` を付与。
- Node.js は `20` に固定されている（コメントで「Node 22 との差異回避」が明示されている）。

### 3.2 Git 履歴上の状況
- 直近で CI 失敗に対応したコミットとして、以下が確認できる。
  - `a98fd25` `ci: scope pages workflow permissions by job and add deploy timeout`
  - `4d46011` `ci: pin GitHub Actions Node runtime to 20 for build stability`
- 同種の修正が短期間に複数回入っており、Pages workflow の**権限設定**および**Node 実行環境差分**が失敗要因だった可能性が高い。

### 3.3 ローカル再現テスト
- `pnpm install --frozen-lockfile`: 成功
- `pnpm build`: 成功（Next.js 16.2.4 / Node v20.19.6）
- 依存解決・静的ビルドともに通るため、少なくとも現行 HEAD では恒常的なビルド破損は再現しない。

## 4. 調査結論（原因推定）
直近失敗の主因は、次のいずれか、または複合である可能性が最も高い。

1. **GitHub Pages デプロイ時の権限不足/不整合**（`pages: write`, `id-token: write` 周辺）
2. **Node 22 と Node 20 の実行差分による CI 限定不安定化**

現状 workflow には両方の対策（権限分離・Node 20 固定）がすでに反映されており、再発率は下がっていると評価できる。

## 5. 今回の調査アウトプット
- 失敗原因の推定根拠を文書化した（本ファイル）。
- 次コミットで、上記結論を前提にした具体的な修正計画を追記する。

## 6. 修正計画（このPRで実施）

### 6.1 目的
Pages workflow の再現性を上げ、失敗時の切り分けを短時間で行える状態にする。

### 6.2 実施タスク
1. **CI とローカルの Node バージョン整合**
   - `.nvmrc` を追加し Node `20` を明示する。
   - README に開発環境前提（Node 20 / pnpm 10）を追記する。
2. **ワークフローの診断性向上**
   - `workflow_dispatch` の手動実行時に `ACTIONS_STEP_DEBUG=true` を有効化できるよう入力パラメータを追加する。
   - 失敗時に build artifact（`out/`）をデバッグ用として保存し、落ちた箇所の前後を調査しやすくする。
3. **検証**
   - `pnpm install --frozen-lockfile` と `pnpm build` を実行してローカルで正常終了することを確認。

### 6.3 受け入れ条件
- リポジトリに Node バージョン固定ファイルが存在すること。
- workflow が手動実行時のデバッグモードをサポートしていること。
- build 失敗時にデバッグ用 artifact が保存されること。
- ローカル build が成功すること。
