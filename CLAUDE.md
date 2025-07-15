# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

SilhouetteはObsidianプラグインで、Daily Noteでのシンプルなタスク管理を実現するためのツールです。TypeScriptで書かれており、Svelteを使用してUIを構築しています。

## 開発環境とツール

### 必要なコマンド

```bash
# 開発環境の開始 (ファイル監視とビルド)
bun dev

# 本番ビルド
bun build

# テスト実行
bun test

# TypeScript型チェック
tsc -noEmit -skipLibCheck

# プリプッシュチェック (型チェック + テスト)
bun run pre:push

# 全体のCIプロセス
bun run ci
```

### 開発用設定

- `esbuild.config.mts`の`VAULT_DIR`を自分のVaultパスに変更する必要があります
- 開発時は`bun dev`を実行し、プラグインディレクトリにファイルを自動コピーします

## アーキテクチャ

### レイヤー構成

```
src/
├── main.ts                 # プラグインエントリポイント
├── app/                    # アプリケーション層
│   ├── TaskService.ts      # タスク管理サービス
│   ├── TimerService.ts     # タイマー管理サービス
│   └── *Impl.ts           # 各種実装
├── repository/             # データアクセス層
│   ├── TaskRepository.ts   # タスクデータアクセス
│   └── TimerRepository.ts  # タイマーデータアクセス
├── domain/                 # ドメイン層
│   └── vo/                 # Value Objects
├── ui/                     # UI層
├── utils/                  # ユーティリティ
├── component/              # Svelteコンポーネント
└── settings.ts             # 設定管理
```

### 主要コンポーネント

- **TaskService**: 繰り返しタスクの管理とDaily Noteへの挿入
- **TimerService**: タスクの時間計測機能
- **AppHelper**: Obsidian APIのラッパー
- **RepetitionTaskView**: タスク表示用のUI

### 外部依存関係

- `@tadashi-aikawa/silhouette-core`: タスク処理のコアロジック
- `owlelia`: 日時処理とエラーハンドリング
- `obsidian`: ObsidianプラグインAPI

## コミット規約

以下のフォーマットに従います：

```
type(scope): description
```

- **type**: feat, fix, style, docs, refactor, test, ci, build, dev, chore
- **scope**: task, time (または空)
- **description**: 変更内容の説明

## テストについて

- Jestを使用してテストを実行
- `esbuild-jest`でTypeScriptをトランスパイル
- ユーティリティ関数（`src/utils/`）を中心にテストが書かれています

## 特殊な設定

### Git hooks

- `hooks/commit-msg`: コミットメッセージの形式チェック
- `hooks/pre-push`: src配下に変更がある場合のみ型チェックとテストを実行

### 開発時の注意点

- 型チェックは`skipLibCheck`を使用
- Svelteコンポーネントは`component/`に配置
- 設定ファイルは`src/settings.ts`で管理
- プラグインのマニフェストは`manifest.json`と`manifest-beta.json`の両方を更新

## ビルドプロセス

esbuildを使用してバンドルを作成し、以下のファイルが生成されます：

- `main.js`: メインバンドルファイル
- `manifest.json`: プラグインマニフェスト
- `styles.css`: スタイルシート

## 計測時間表示の実装

### 表示形式と実装場所

計測時間は以下の形式で表示されます：
- **計測中**: `` `⏳` ``
- **計測済**: `` `⏲️HH:mm:ss` ``

### 主要な実装ファイル

**`src/domain/vo/TimerStatus.ts`**
- 正規表現パターンの定義（pattern object）
- 文字列生成・解析ロジック
- 計測状態の管理

**重要な実装箇所**:
- `pattern.recording`: 計測中タスクの正規表現パターン
- `pattern.recorded`: 計測済タスクの正規表現パターン
- `getNextStatusLine()`: 各状態での文字列生成メソッド

### 表示形式を変更する際の注意点

1. **正規表現パターンの更新**: `pattern` オブジェクトの `recording` と `recorded` パターンを更新
2. **文字列生成の更新**: 各Statusクラスの `getNextStatusLine()` メソッドを更新
3. **文字列解析の更新**: 既存の計測済タスクを計測中に戻す際の正規表現も更新
4. **ドキュメント更新**: README.mdの該当箇所をすべて更新（複数箇所あり）
5. **互換性の考慮**: 既存の計測中・計測済タスクは新しい形式で再計測が必要