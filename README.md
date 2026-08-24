# PokerNest（α版・Sprint 1）

身内のポーカーホームゲームの成績・精算を管理するPWA。現在は **キャッシュゲームのコアフロー** のみ実装（トーナメントは別スプリントで追加予定）。

## 今のスプリントでできること

- ゲーム設定（単位名・換算率・スタートチップ）
- 参加者選択（グループメンバーはFirestoreに保存・同期）
- バイイン記録／追加バイイン
- 最終チップカウント入力
- 収支の自動計算・表示
- Firebase Firestoreへのデータ保存（リアルタイム同期）
- 匿名認証で自動サインイン（メールログインは次スプリントで実装予定）

## セットアップ手順（初回のみ）

### 1. 依存パッケージのインストール

```bash
npm install
```

### 2. Firebaseプロジェクトを作る（ブラウザ操作のみ・コード不要）

1. https://console.firebase.google.com/ を開き、Googleアカウントでログイン
2. 「プロジェクトを追加」→ プロジェクト名を入力（例：pokernest）→ 作成
3. 左メニュー「構築」→「Firestore Database」→「データベースの作成」
   - ロケーションは `asia-northeast1`（東京）を推奨
   - モードは「テストモード」でOK（本番前にセキュリティルールを見直します）
4. 左メニュー「構築」→「Authentication」→「始める」
   - 「Sign-in method」タブで **匿名** を有効化
5. 左メニュー「プロジェクトの概要」の歯車アイコン→「プロジェクトの設定」
6. 下にスクロールして「マイアプリ」→ `</>`（ウェブ）アイコンをクリック
   - アプリのニックネームを入力（例：pokernest-web）→ アプリを登録
   - 表示される `firebaseConfig` の値をコピー

### 3. 環境変数を設定

`.env.example` を `.env.local` にコピーし、手順2でコピーした値を貼り付ける。

```bash
cp .env.example .env.local
```

### 4. 起動

```bash
npm run dev
```

ブラウザで `http://localhost:5173` を開く。

## 次のスプリント予定

1. ~~Firebase接続~~ ← 完了
2. 認証（メールログイン）
3. グループ管理・テンプレート保存
4. UI/UXの洗練

## ディレクトリ構成

```
src/
  firebase.ts        Firebase初期化・匿名サインイン
  types.ts            型定義
  lib/settlement.ts   収支計算ロジック（純粋関数）
  hooks/useMembers.ts    グループメンバーの読み書き
  hooks/useCashGame.ts   キャッシュゲームの読み書き
  App.tsx             画面遷移・UI一式
```
