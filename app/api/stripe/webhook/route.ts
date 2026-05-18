import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";

import { updateUserPlan, type UserPlan } from "@/lib/users";

export const runtime = "nodejs";

type StripeEvent<T = StripeEventDataObject> = {
  id: string;
  type: string;
  data: {
    object: T;
  };
};

type StripeEventDataObject = {
  id?: string;
  client_reference_id?: string | null;
  metadata?: Record<string, string | undefined>;
  status?: string | null;
};

const WEBHOOK_TOLERANCE_SECONDS = 300;

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const parseStripeSignature = (signatureHeader: string) =>
  signatureHeader.split(",").reduce<Record<string, string[]>>((acc, part) => {
    const [key, value] = part.split("=");

    if (!key || !value) {
      return acc;
    }

    acc[key] = [...(acc[key] ?? []), value];

    return acc;
  }, {});

const isFreshTimestamp = (timestamp: string) => {
  const timestampSeconds = Number(timestamp);

  if (!Number.isFinite(timestampSeconds)) {
    return false;
  }

  const currentSeconds = Math.floor(Date.now() / 1000);

  return Math.abs(currentSeconds - timestampSeconds) <= WEBHOOK_TOLERANCE_SECONDS;
};

const signaturesMatch = (expectedSignature: string, candidateSignature: string) => {
  const expected = Buffer.from(expectedSignature, "hex");
  const candidate = Buffer.from(candidateSignature, "hex");

  return (
    expected.length === candidate.length &&
    timingSafeEqual(expected, candidate)
  );
};

const verifyStripeSignature = ({
  payload,
  signatureHeader,
  webhookSecret
}: {
  payload: string;
  signatureHeader: string | null;
  webhookSecret: string;
}) => {
  if (!signatureHeader) {
    return false;
  }

  const parsedSignature = parseStripeSignature(signatureHeader);
  const timestamp = parsedSignature.t?.[0];
  const signatures = parsedSignature.v1 ?? [];

  if (!timestamp || signatures.length === 0 || !isFreshTimestamp(timestamp)) {
    return false;
  }

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = createHmac("sha256", webhookSecret)
    .update(signedPayload, "utf8")
    .digest("hex");

  return signatures.some((signature) =>
    signaturesMatch(expectedSignature, signature)
  );
};

const getUserIdFromStripeObject = (object: StripeEventDataObject) =>
  object.metadata?.userId ?? object.client_reference_id ?? null;

const getPlanFromSubscriptionStatus = (status: string | null | undefined): UserPlan =>
  status === "active" || status === "trialing" ? "paid" : "free";

const applyPlanUpdate = async (event: StripeEvent) => {
  switch (event.type) {
    case "checkout.session.completed": {
      const userId = getUserIdFromStripeObject(event.data.object);

      if (!userId) {
        throw new Error("checkout.session.completed did not include a user id");
      }

      await updateUserPlan(userId, "paid");
      return;
    }

    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object;
      const userId = getUserIdFromStripeObject(subscription);

      if (!userId) {
        throw new Error(`${event.type} did not include a user id`);
      }

      await updateUserPlan(userId, getPlanFromSubscriptionStatus(subscription.status));
      return;
    }

    default:
      return;
  }
};

export async function POST(request: Request) {
  const payload = await request.text();
  const webhookSecret = requiredEnv("STRIPE_WEBHOOK_SECRET");
  const signatureHeader = request.headers.get("stripe-signature");

  if (
    !verifyStripeSignature({
      payload,
      signatureHeader,
      webhookSecret
    })
  ) {
    return NextResponse.json(
      { error: "Stripe webhook signature verification failed." },
      { status: 400 }
    );
  }

  let event: StripeEvent;

  try {
    event = JSON.parse(payload) as StripeEvent;
  } catch {
    return NextResponse.json(
      { error: "Stripe webhook payload is invalid JSON." },
      { status: 400 }
    );
  }

  try {
    await applyPlanUpdate(event);

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Failed to process Stripe webhook", error);

    return NextResponse.json(
      { error: "Stripe webhook processing failed." },
      { status: 500 }
    );
  }
}
