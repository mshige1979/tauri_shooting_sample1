# Tauri + React + TypeScript

このプロジェクトは、Tauri、React、TypeScriptを使用して構築されたアプリケーションテンプレートです。Viteを使用して高速な開発環境を提供します。

## 特徴
- **Tauri**: 軽量でセキュアなデスクトップアプリケーションを構築可能。
- **React**: モダンなUIライブラリで効率的なフロントエンド開発。
- **TypeScript**: 型安全なコードで開発効率と保守性を向上。
- **Vite**: 高速なビルドとホットリロードを提供。

## プロジェクト構造
 ├── public/          # 静的ファイル
 ├── src/             # フロントエンドのソースコード
 │   ├── components/  # Reactコンポーネント
 │   ├── constants/   # 定数
 │   ├── hooks/       # カスタムフック
 │   ├── styles/      # スタイル関連
 │   ├── types/       # 型定義
 │   └── utils/       # ユーティリティ関数
 ├── src-tauri/       # Tauri関連のソースコード
 │   ├── src/         # Rustソースコード
 │   ├── icons/       # アイコン
 │   └── tauri.conf.json # Tauri設定ファイル
 ├── package.json     # npmスクリプトと依存関係
 ├── tsconfig.json    # TypeScript設定
 └── vite.config.ts   # Vite設定

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

## 使用方法
- フロントエンドのコードは`src/`ディレクトリ内に配置します。
- Tauriの設定やRustコードは`src-tauri/`ディレクトリ内で管理します。
- ビルド済みのアプリケーションを生成するには以下を実行します:
  ```bash
  npm run tauri build
  ```

## ライセンス
このプロジェクトはMITライセンスの下で公開されています。