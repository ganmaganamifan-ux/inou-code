# Floot → GitHub 移行記録
- 移行元プロジェクト: c908e696-38f7-477e-9b88-0311fe38d51f
- 正本: v0.2.0 (キャラクターデザイン未確定)
- コード: Flootから読み取ったGameData、IndexPage、CSS、Buttonを保持
- 静的画像: 7点をFlootストレージからバイナリで取得し同梱
- 動作: GitHub PagesのViteビルドに移植。ゲームの進行・セーブキーは維持。
- 移行による既存Flootプロジェクトの削除・変更なし。
- GitHub PagesとFlootは別オリジンのため、Floot側のブラウザセーブは自動移行しません。新規プレイで確認します。
