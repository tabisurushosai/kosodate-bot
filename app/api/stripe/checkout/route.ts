import { getServerSession } from "next-auth";

import {
  apiErrorResponse,
  unexpectedApiErrorResponse
} from "@/lib/api-errors";
import { authOptions } from "@/lib/auth";
import { getUserById } from "@/lib/users";

export const runtime = "nodejs";

type StripeCheckoutSession = {
  id: string;
  url: string | null;
};

type StripeErrorResponse = {
  error?: {
    message?: string;
  };
};

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const createCheckoutSession = async ({
  email,
  userId
}: {
  email: string;
  userId: string;
}) => {
  const appUrl = requiredEnv("NEXTAUTH_URL").replace(/\/$/, "");
  const stripeSecretKey = requiredEnv("STRIPE_SECRET_KEY");
  const priceId = requiredEnv("STRIPE_PRICE_ID");
  const params = new URLSearchParams({
    mode: "subscription",
    "line_items[0][price]": priceId,
    "line_items[0][quantity]": "1",
    customer_email: email,
    success_url: `${appUrl}/settings?checkout=success`,
    cancel_url: `${appUrl}/settings?checkout=cancelled`,
    client_reference_id: userId,
    "subscription_data[metadata][userId]": userId,
    "metadata[userId]": userId
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecretKey}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: params.toString(),
    cache: "no-store"
  });

  const body = (await response.json()) as StripeCheckoutSession & StripeErrorResponse;

  if (!response.ok) {
    throw new Error(
      body.error?.message ??
        `Stripe Checkout request failed: ${response.status} ${response.statusText}`
    );
  }

  if (!body.url) {
    throw new Error("Stripe Checkout response did not include a checkout URL");
  }

  return body;
};

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return apiErrorResponse("ログインが必要です。", 401, "AUTH_REQUIRED");
    }

    const user = await getUserById(userId);

    if (!user) {
      return apiErrorResponse(
        "ユーザー情報が見つかりません。",
        404,
        "NOT_FOUND"
      );
    }

    if (user.plan === "paid") {
      return apiErrorResponse(
        "すでに有料プランを利用中です。",
        409,
        "CONFLICT"
      );
    }

    const checkoutSession = await createCheckoutSession({
      email: session.user?.email ?? user.email,
      userId
    });

    return Response.json({
      checkoutSessionId: checkoutSession.id,
      url: checkoutSession.url
    });
  } catch (error) {
    return unexpectedApiErrorResponse({
      error,
      logMessage: "Failed to create Stripe Checkout session",
      message:
        "決済画面を開けませんでした。時間をおいてもう一度お試しください。"
    });
  }
}
