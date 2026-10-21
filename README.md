# 異能コード — INOU CODE (v0.2.0)

Floot版の「異能コード」から移植した**同一ゲームのGitHub Pages用プロジェクト**です。Flootの元プロジェクトは変更していません。

## 収録内容
- 性格診断10問と固有能力6種類
- 異能力図鑑60種類
- シナリオ3話、分岐、ターン制戦闘、HP/EN、リトライ
- スマホ縦画面UI、専用背景7素材、自動セーブ（端末内LocalStorage）
- キャラクター造形は仮デザインのまま。未変更。

## GitHub Pages への公開
1. **公開 (Public)** リポジトリを新規作成（推奨名：`inou-code`）。既存リポジトリへ上書きしないでください。
2. このZIPの**中身**をリポジトリのルートにアップロードします。ZIPファイルだけを置いてもゲームは動きません。
3. GitHub の `Settings → Pages → Build and deployment → Source` を `GitHub Actions` に設定します。
4. `Actions` で `Deploy Inou Code` の実行成功を確認します。
5. `https://<ユーザー名>.github.io/inou-code/` にアクセスします（名前を変えた場合はURLも変わります）。

通常はChatGPTからGitHubへの書き込みでファイルを一括移行できます。リポジトリが作成されたら、追加の手動アップロードは不要になる想定です。

## ローカル開発
Node.js 22 以上：
```bash
npm install
npm run dev
npm run build
```

## 制約
GitHub Pages は静的サイトの公開用です。オンライン対戦やサーバーデータ保存は含まれていません。画像・コードはこのリポジトリ内で保全するのでFloot画像URLに依存しません。GitHub・Actions・ChatGPTの利用制限はそれぞれあります。

## v0.3.0 UI POLISH
- キャラクターの外見に変更なし。
- 診断/能力覚醒/物語/戦闘/章間/結果/図鑑を同じUI体系に統一。
- 図鑑の能力カードをタップで展開可能。
- Mobile viewport + safe area最適化、キーボードフォーカスとアクセシビリティ強化。
