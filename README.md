# スクロールシューティングゲーム - Tauri + React + TypeScript

このプロジェクトは、Tauri、React、TypeScriptを使用して構築されたスクロールシューティングゲームです。Viteを使用して高速な開発環境を提供します。

## ゲーム概要
シンプルで楽しいシューティングゲームです。プレイヤーが操作する宇宙船で敵を倒し、ステージをクリアしていきます。

### ゲーム機能
- 複数のステージと難易度進行システム
- スコアと高得点記録
- パワーアップシステム
- 残機システム
- ステージクリア条件

### 操作方法
- 矢印キー: 移動
- スペースキー: 射撃
- ESCキー: 一時停止

## 技術的特徴
- **Tauri**: 軽量でセキュアなデスクトップアプリケーションフレームワーク
- **React**: UIコンポーネントの構築と状態管理
- **TypeScript**: 型安全なコード開発
- **カスタムフック**: ゲームロジックのモジュール化（衝突検出、エンティティ管理、ステージ管理など）

## プロジェクト構造
```
 ├── public/          # 静的ファイル
 ├── src/             # フロントエンドのソースコード
 │   ├── components/  # Reactコンポーネント (Game, Player, Enemy など)
 │   ├── constants/   # ゲーム定数 (STAGE_SETTINGS, POWERUP_TYPES など)
 │   ├── hooks/       # カスタムフック (useGameEntities, useStageManagement など)
 │   ├── styles/      # スタイル関連
 │   ├── types/       # 型定義 (GameStateInterface, Entity型 など)
 │   └── utils/       # ユーティリティ関数
 ├── src-tauri/       # Tauri関連のソースコード
 │   ├── src/         # Rustソースコード
 │   ├── icons/       # アイコン
 │   └── tauri.conf.json # Tauri設定ファイル
 ├── package.json     # npmスクリプトと依存関係
 ├── tsconfig.json    # TypeScript設定
 └── vite.config.ts   # Vite設定
```

## セットアップ
1. リポジトリをクローンします:
   ```bash
   git clone <リポジトリURL>
   cd <プロジェクトディレクトリ>
   ```

2. 必要な依存関係をインストールします:
   ```bash
   npm install
   ```

3. 開発サーバーを起動します:
   ```bash
   npm run dev
   ```

4. デスクトップアプリケーションを起動します:
   ```bash
   npm run tauri dev
   ```

## ゲーム開発
- 新しい敵タイプを追加するには `src/constants/gameConstants.ts` の敵設定を編集します
- ステージの難易度を調整するには `STAGE_SETTINGS` を編集します
- 新しいパワーアップタイプは `POWERUP_TYPES` に追加できます

## ビルド方法
ビルド済みのアプリケーションを生成するには以下を実行します:
```bash
npm run tauri build
```

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。