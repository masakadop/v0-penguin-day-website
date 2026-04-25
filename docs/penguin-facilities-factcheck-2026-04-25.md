# ペンギン施設データベース ファクトチェック（2026-04-25）

## 対象
- ファイル: `lib/penguin-facilities.ts`
- 対象項目: 施設の実在性（公式サイトの有無）と `penguinSpecies` の妥当性

## 実施方法
1. `website` に登録されているURLへ `curl` でアクセスし、HTTPステータスを確認。
2. `penguinSpecies` の値を機械的に検査し、`ペンギン` を含まない名称がないか確認。
3. 不一致が見つかった項目は、公式サイトの該当ページで再確認。

## 実行コマンド（抜粋）
```bash
# penguinSpeciesに「ペンギン」を含まない語を検出
node - <<'NODE'
const fs=require('fs');const text=fs.readFileSync('lib/penguin-facilities.ts','utf8');
const arr=[...text.matchAll(/penguinSpecies:\s*(\[[\s\S]*?\])/g)].map(m=>m[1]);
let i=0;for(const a of arr){i++;const species=[...a.matchAll(/"([^"]+)"/g)].map(x=>x[1]);for(const s of species){if(!s.includes('ペンギン')) console.log(i,s)} }
NODE
```
- 検出結果: `6 ゴマフアザラシ`

```bash
# 長崎ペンギン水族館の公式「ペンギン図鑑」から飼育種を確認
curl -L -s https://penguin-aqua.jp/penguin/ | tr -d '\r' | sed 's/<[^>]*>/\n/g' | rg '英名|ペンギン'
```
- 公式ページ上で、キング/ジェンツー/ヒゲ/キタイワトビ/ミナミイワトビ/フンボルト/マゼラン/ケープ/コガタ（Little）の9種を確認。

```bash
# アクアマリンふくしまの展示ガイドでペンギン展示の有無を確認
curl -L -s https://www.aquamarine.or.jp/exhibitions/ | tr -d '\r' | sed 's/<[^>]*>/\n/g' | rg 'ペンギン|アザラシ'
```
- 展示ガイド本文から `ペンギン` は確認できず。

## ファクトチェック結果

### 1) アクアマリンふくしま
- 現状データ: `penguinSpecies: ["ゴマフアザラシ"]`
- 判定: **誤り**（アザラシはペンギン種ではない）
- 対応方針: ペンギン施設データベースから除外（または `penguinSpecies` を空配列に修正）。
- 今回の修正方針: **施設レコードを除外**。

### 2) 長崎ペンギン水族館
- 現状データ: `エンペラーペンギン` を含み、`ヒゲペンギン`・`コガタペンギン`・`キタイワトビペンギン`・`ミナミイワトビペンギン` が欠落。
- 判定: **誤り**（公式ペンギン図鑑の現行飼育種と不一致）
- 対応方針: 公式掲載の9種に合わせて `penguinSpecies` を修正。

## 参考URL（公式）
- 長崎ペンギン水族館 ペンギン図鑑: https://penguin-aqua.jp/penguin/
- 長崎ペンギン水族館について（9種飼育の説明）: https://penguin-aqua.jp/history/
- アクアマリンふくしま 展示ガイド: https://www.aquamarine.or.jp/exhibitions/
