import { NextResponse } from "next/server";

import { generateWeeklyHintForUser, getTokyoWeekStartDate } from "@/lib/weekly-hints";
import { listAllUsers } from "@/lib/users";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const authorizeCronRequest = (request: Request) => {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 500 }
    );
  }

  const authorization = request.headers.get("authorization");

  if (authorization !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return null;
};

export async function GET(request: Request) {
  const authError = authorizeCronRequest(request);

  if (authError) {
    return authError;
  }

  const weekStart = getTokyoWeekStartDate();
  const users = await listAllUsers();
  const paidUsers = users.filter((user) => user.plan === "paid");
  const results = await Promise.allSettled(
    paidUsers.map((user) => generateWeeklyHintForUser(user, weekStart))
  );
  const generated = results.filter(
    (result) => result.status === "fulfilled" && result.value.generated
  ).length;
  const skipped = results.filter(
    (result) => result.status === "fulfilled" && !result.value.generated
  ).length;
  const failed = results.filter((result) => result.status === "rejected").length;

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Failed to generate weekly hint for user ${paidUsers[index]?.id}`,
        result.reason
      );
    }
  });

  return NextResponse.json({
    weekStart,
    paidUsers: paidUsers.length,
    generated,
    skipped,
    failed
  });
}
