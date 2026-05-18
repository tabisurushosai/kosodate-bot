# Deployment Verification

T039 is the production smoke test for the Kosodate Bot release. Run it after the Vercel Production deployment has real environment variables, because `.env.local` in this workspace uses dummy placeholders and cannot verify Google, Claude, Supabase, Vercel KV, or Stripe end to end.

## Prerequisites

- Vercel Production deployment is built from `main`.
- `NEXTAUTH_URL` is the production URL, for example `https://kosodate-bot.vercel.app`.
- Google OAuth has `https://<production-url>/api/auth/callback/google` in the authorized redirect URIs.
- Stripe has a monthly 980 yen subscription Price ID in `STRIPE_PRICE_ID`.
- Stripe webhook endpoint is `https://<production-url>/api/stripe/webhook`, with events:
  - `checkout.session.completed`
  - `customer.subscription.created`
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
- The webhook signing secret is saved as `STRIPE_WEBHOOK_SECRET`.
- Vercel KV and Supabase production credentials are saved in Vercel Environment Variables.
- Anthropic production API key is saved as `ANTHROPIC_API_KEY`.

## Smoke Test Checklist

1. Open the production URL.
   - Expected: landing page loads without a server error.
   - Expected: service description, plan information, and signup/login entry points are visible.

2. Open `/login` and sign in with Google.
   - Expected: Google OAuth completes and redirects into the app.
   - Expected: unauthenticated visits to `/dashboard`, `/chat`, `/history`, `/profile`, and `/settings` redirect to `/login`.

3. Open `/dashboard`.
   - Expected: remaining consultation count is visible.
   - Expected: free plan starts with 3 monthly consultations remaining.

4. Open `/profile` and save a child profile.
   - Test values:
     - Age: `10`
     - Notes: `学校に行きしぶる日がある`
     - Interests: `工作、ゲーム`
     - Difficulties: `朝の支度、集団活動`
   - Expected: profile saves successfully and remains visible after reload.

5. Open `/chat` and send a consultation.
   - Test message: `朝になると学校に行きたくないと泣きます。どう声をかけるとよいですか？`
   - Expected: Claude returns a Japanese response with concrete support suggestions.
   - Expected: response includes the configured 1,500 token limit behavior and does not crash.
   - Expected: remaining count decreases by 1.

6. Open `/history`.
   - Expected: the consultation appears in chronological order.
   - Expected: generated tags appear.
   - Expected: filtering by a displayed tag narrows the list.

7. Repeat `/chat` until the free plan reaches the monthly limit.
   - Expected: the fourth free-plan consultation returns a friendly limit error.
   - Expected: dashboard shows 0 remaining consultations.

8. Open `/settings` and start the paid plan checkout.
   - Expected: Stripe Checkout opens for the configured 980 yen monthly subscription.
   - In Stripe test mode, use card `4242 4242 4242 4242`, any future expiry, any CVC.
   - Expected: successful checkout redirects to `/settings?checkout=success`.

9. Confirm Stripe webhook plan update.
   - Expected: after `checkout.session.completed`, the user plan changes to paid.
   - Expected: dashboard/settings show paid plan limits.
   - Expected: paid plan allows up to 30 monthly consultations.

10. Trigger or wait for weekly hints.
    - Vercel cron schedule in `vercel.json` is `0 23 * * 0`, which is Monday 08:00 JST.
    - Expected: `/api/cron/weekly-hints` creates this week's hint when called by Vercel Cron with the configured secret.
    - Expected: dashboard displays the saved weekly hint.

## Result Record

Fill this section during the production release.

- Production URL:
- Vercel deployment id:
- Verified by:
- Verification date:
- Login:
- Consultation:
- History/tag search:
- Free usage limit:
- Stripe checkout:
- Stripe webhook plan update:
- Weekly hint:
- Notes:
