# Kosodate Bot - 保護者・支援者向け週次AI相談ボット 仕様書 v1_0

## ゴール
不登校児・発達特性児の保護者が、子どもの悩みをいつでもAIに相談できるWebサービス。
教育心理・発達心理ベースで、24時間いつでも具体的なアドバイスを得られる。

## アーキテクチャ
- **フレームワーク**: Next.js 14 (App Router) + TypeScript
- **ホスティング**: Vercel
- **AI**: Anthropic Claude API (claude-sonnet-4-6 をデフォルト)
- **DB**: Vercel KV (Redis、相談履歴保存)
- **認証**: NextAuth.js (Google/メール認証)
- **課金**: Stripe (月額サブスク)
- **UI**: Tailwind CSS + shadcn/ui
- **言語**: 日本語が基本、UIも日本語

## 機能仕様

### 無料プラン
- 月3回まで相談可能
- 相談履歴は7日間保存
- 1回の返答は1,500トークン以内

### 有料プラン (月額980円)
- 月30回まで相談可能
- 相談履歴は無期限保存
- 過去の相談履歴を参照したコンテキスト付き相談
- 「子どものプロファイル」を保存(年齢・特性・興味など)
- 毎週月曜にAIからの「今週の声かけのヒント」自動配信

### コア機能: AI相談
- 入力: 自由テキスト (例: 「うちの子が学校に行きたくないと言った。どう声かけしたら？」)
- AI: 教育心理・発達心理の知見をベースに具体的な声かけ例を3パターン提示
- システムプロンプト: 「あなたは不登校児・発達特性児の保護者の相談相手です。批判せず、寄り添いながら、具体的な行動につながるアドバイスを提示してください。」

### 子どもプロファイル機能
- 年齢、性別、診断名(任意)、興味、苦手、最近の変化
- 相談時に自動でコンテキストに加える

### 履歴・検索
- 過去の相談を時系列・タグで検索
- AIが自動でタグ付け(例: #癇癪 #学校復帰 #友達関係)

### ダッシュボード
- 今月の残り相談回数
- よく相談しているテーマのワードクラウド
- 子どもの「いいこと記録」を自分で書き溜める日記機能

## 技術設計

### ディレクトリ構成
```
kosodate-bot/
├── app/
│   ├── api/
│   │   ├── chat/route.ts        # AI相談エンドポイント
│   │   ├── stripe/webhook/      # Stripe webhook
│   │   └── auth/                # NextAuth
│   ├── (auth)/login/page.tsx
│   ├── (main)/
│   │   ├── chat/page.tsx        # 相談画面
│   │   ├── history/page.tsx     # 履歴
│   │   ├── profile/page.tsx     # 子どもプロファイル
│   │   └── settings/page.tsx
│   └── layout.tsx
├── lib/
│   ├── claude.ts                # Claude API クライアント
│   ├── prompts.ts               # システムプロンプト集
│   ├── stripe.ts
│   └── db.ts                    # Vercel KV
├── components/
└── package.json
```

### API設計
- POST /api/chat : { message, profileId } → { response, usageRemaining }
- レート制限: プラン別・月次でカウント
- 1回の応答トークン上限: 1,500

### 環境変数 (.env.local)
```
ANTHROPIC_API_KEY=
NEXTAUTH_SECRET=
NEXTAUTH_URL=
KV_REST_API_URL=
KV_REST_API_TOKEN=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

## デプロイ
- Vercelに `vercel` コマンド一発でデプロイ
- ドメイン: 後で取得(仮: kosodate-bot.vercel.app)
- 環境変数はVercelダッシュボードで設定

## 触ってはいけない範囲
- GAME_SPEC.md的な仕様書は読むだけ
- 他リポジトリには触れない

## 完了条件
- `npm run dev` でローカル起動できる
- Vercelにデプロイ可能
- 無料プランの相談3回まで動作確認できる

## 禁止事項
- 勝手な仕様追加
- 依存パッケージの過剰追加(必要最低限)
- ネット外部APIの追加(Claude/Stripe/Google認証以外)
