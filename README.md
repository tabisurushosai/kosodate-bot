# Kosodate Bot

保護者・支援者向けの週次AI相談ボットです。不登校や発達特性に関する悩みを、教育心理・発達心理の視点で整理し、具体的な声かけや次の行動につながる相談体験を提供します。

## 技術スタック

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- shadcn/ui
- Supabase
- Anthropic Claude
- Stripe
- NextAuth.js

## セットアップ

依存関係はこのリポジトリではインストール済みです。通常の初期セットアップでは次の順で進めます。

```bash
cp .env.local.example .env.local
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

## 環境変数

`.env.local.example` を `.env.local` にコピーし、以下の値を実際の開発用キーに置き換えてください。`.env.local` は Git にコミットしません。

### アプリ・認証

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`
- `CRON_SECRET`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `EMAIL_SERVER_HOST`
- `EMAIL_SERVER_PORT`
- `EMAIL_SERVER_USER`
- `EMAIL_SERVER_PASSWORD`
- `EMAIL_FROM`

### AI

- `ANTHROPIC_API_KEY`
- `CLAUDE_MODEL`（任意。未設定時は `claude-sonnet-4-6`）

### Supabase

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### Vercel KV

- `KV_REST_API_URL`
- `KV_REST_API_TOKEN`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

## 開発コマンド

```bash
npm run dev
npm run lint
npm run build
```

## 実装予定の主要機能

- 無料プランは月3回まで相談可能
- 有料プランは月30回まで相談可能
- 子どもプロファイルを相談コンテキストに反映
- 相談履歴の保存、タグ検索
- 毎週月曜の「今週の声かけのヒント」生成
- Stripe による月額サブスクリプション

## デプロイ

Vercel へのデプロイを想定しています。先に Vercel プロジェクトを作成し、GitHub リポジトリまたはローカル CLI からこのリポジトリを紐づけてください。

### Vercel プロジェクト作成

Vercel ダッシュボードから作成する場合:

1. Vercel の New Project で `kosodate-bot` リポジトリを Import します。
2. Framework Preset は `Next.js` を選びます。
3. Project Name は `kosodate-bot` にします。
4. Build Command は `npm run build`、Output Directory は `.next` のままにします。

Vercel CLI から紐づける場合:

```bash
vercel link --yes --project kosodate-bot
```

### 環境変数の設定

ローカルの `.env.local` に実値を入れて動作確認してから、同じ値を Vercel に登録します。値は `.env.local.example` のキー名と一致させてください。

Vercel ダッシュボードから設定する場合:

1. Vercel の Project Settings を開きます。
2. Environment Variables を選びます。
3. `.env.local` の各行を `Name` と `Value` にコピーします。
4. Environment はまず `Production`、必要に応じて `Preview` と `Development` も選びます。
5. Save 後、再デプロイします。

Vercel CLI から設定する場合:

```bash
vercel env add NEXTAUTH_URL production
vercel env add NEXTAUTH_SECRET production
vercel env add CRON_SECRET production
vercel env add GOOGLE_CLIENT_ID production
vercel env add GOOGLE_CLIENT_SECRET production
vercel env add EMAIL_SERVER_HOST production
vercel env add EMAIL_SERVER_PORT production
vercel env add EMAIL_SERVER_USER production
vercel env add EMAIL_SERVER_PASSWORD production
vercel env add EMAIL_FROM production
vercel env add ANTHROPIC_API_KEY production
vercel env add CLAUDE_MODEL production
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add KV_REST_API_URL production
vercel env add KV_REST_API_TOKEN production
vercel env add STRIPE_SECRET_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add STRIPE_PRICE_ID production
vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
```

本番で使う主な値の取得元:

- `NEXTAUTH_URL`: Vercel の本番 URL。独自ドメイン設定後は独自ドメインに変更します。
- `NEXTAUTH_SECRET`: `openssl rand -base64 32` で生成します。
- `CRON_SECRET`: `openssl rand -base64 32` などで生成し、Cron API 保護用に使います。
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`: Google Cloud Console の OAuth クライアントから取得します。承認済みリダイレクト URI に `https://<本番ドメイン>/api/auth/callback/google` を追加します。
- `EMAIL_*`: メールログインに使う SMTP プロバイダーの値を設定します。
- `ANTHROPIC_API_KEY`: Anthropic Console で発行した API キーを設定します。
- `CLAUDE_MODEL`: 未設定時は `claude-sonnet-4-6` を使います。
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`: Supabase Project Settings の API から取得します。
- `KV_REST_API_URL` / `KV_REST_API_TOKEN`: Vercel Storage の KV 接続情報から取得します。
- `STRIPE_SECRET_KEY` / `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe Dashboard の API keys から取得します。
- `STRIPE_PRICE_ID`: 月額980円サブスクリプション商品の Price ID を設定します。
- `STRIPE_WEBHOOK_SECRET`: Stripe Webhook エンドポイントを `https://<本番ドメイン>/api/stripe/webhook` で作成し、署名シークレットを設定します。

登録後は必要に応じて Vercel 側の値をローカルへ同期できます。

```bash
vercel env pull .env.local
```

本番デプロイ後のログイン、相談、課金までの確認手順は `DEPLOYMENT_CHECK.md` にまとめています。実キーを設定した Production 環境で実施してください。
