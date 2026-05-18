import { kv, type JsonValue } from "@/lib/db";

export const USER_PLANS = ["free", "paid"] as const;

export type UserPlan = (typeof USER_PLANS)[number];

export const PLAN_MONTHLY_LIMITS: Record<UserPlan, number> = {
  free: 3,
  paid: 30
};

export type AppUser = {
  id: string;
  email: string;
  plan: UserPlan;
  usage_count: number;
  usage_reset_month: string;
  created_at: string;
};

type StoredUser = { [key: string]: JsonValue };

export type CreateUserInput = {
  id: string;
  email: string;
  plan?: UserPlan;
  usage_count?: number;
  usage_reset_month?: string;
  created_at?: string;
};

const userKey = (id: string) => `user:${id}`;
const userEmailKey = (email: string) => `user:email:${normalizeEmail(email)}`;
const userIdsKey = () => "user_ids";
const USAGE_TIME_ZONE = "Asia/Tokyo";

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export const getCurrentUsageMonth = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: USAGE_TIME_ZONE,
    year: "numeric",
    month: "2-digit"
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;

  if (!year || !month) {
    throw new Error("Failed to determine current usage month");
  }

  return `${year}-${month}`;
};

const isUserPlan = (value: unknown): value is UserPlan =>
  typeof value === "string" && USER_PLANS.includes(value as UserPlan);

const isStoredUser = (value: unknown): boolean => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const user = value as Partial<StoredUser>;

  return (
    typeof user.id === "string" &&
    typeof user.email === "string" &&
    isUserPlan(user.plan) &&
    typeof user.usage_count === "number" &&
    Number.isInteger(user.usage_count) &&
    user.usage_count >= 0 &&
    (user.usage_reset_month === undefined ||
      typeof user.usage_reset_month === "string") &&
    typeof user.created_at === "string"
  );
};

const assertValidUser = (value: unknown, key: string): AppUser => {
  if (!isStoredUser(value)) {
    throw new Error(`Invalid user record in KV: ${key}`);
  }

  const user = value as AppUser;

  return createUserRecord({
    id: user.id,
    email: user.email,
    plan: user.plan,
    usage_count: user.usage_count,
    usage_reset_month:
      typeof user.usage_reset_month === "string"
        ? user.usage_reset_month
        : undefined,
    created_at: user.created_at
  });
};

export const createUserRecord = ({
  id,
  email,
  plan = "free",
  usage_count = 0,
  usage_reset_month = getCurrentUsageMonth(),
  created_at = new Date().toISOString()
}: CreateUserInput): AppUser => ({
  id,
  email: normalizeEmail(email),
  plan,
  usage_count,
  usage_reset_month,
  created_at
});

export const getUserById = async (id: string): Promise<AppUser | null> => {
  const key = userKey(id);
  const user = await kv.get<StoredUser>(key);

  return user ? assertValidUser(user, key) : null;
};

export const getUserByEmail = async (email: string): Promise<AppUser | null> => {
  const normalizedEmail = normalizeEmail(email);
  const id = await kv.get<string>(userEmailKey(normalizedEmail));

  return id ? getUserById(id) : null;
};

export const saveUser = async (user: AppUser): Promise<AppUser> => {
  const normalizedUser = createUserRecord(user);

  await kv.set(userKey(normalizedUser.id), normalizedUser as StoredUser);
  await kv.set(userEmailKey(normalizedUser.email), normalizedUser.id);

  const existingIds = (await kv.get<string[]>(userIdsKey())) ?? [];

  if (!existingIds.includes(normalizedUser.id)) {
    await kv.set(userIdsKey(), [normalizedUser.id, ...existingIds]);
  }

  return normalizedUser;
};

export const createUser = async (input: CreateUserInput): Promise<AppUser> => {
  const user = createUserRecord(input);

  await saveUser(user);

  return user;
};

export const getOrCreateUser = async (input: CreateUserInput): Promise<AppUser> => {
  const existingUser = await getUserById(input.id);

  if (existingUser) {
    return existingUser;
  }

  const existingEmailUser = await getUserByEmail(input.email);

  if (existingEmailUser) {
    return existingEmailUser;
  }

  return createUser(input);
};

export const updateUserPlan = async (id: string, plan: UserPlan): Promise<AppUser> => {
  const user = await getUserById(id);

  if (!user) {
    throw new Error(`User not found: ${id}`);
  }

  return saveUser({ ...user, plan });
};

export const listAllUsers = async (): Promise<AppUser[]> => {
  const ids = (await kv.get<string[]>(userIdsKey())) ?? [];
  const users = await Promise.all(ids.map((id) => getUserById(id)));

  return users.filter((user): user is AppUser => user !== null);
};

export const resetUserUsageForCurrentMonth = async (
  user: AppUser,
  date = new Date()
): Promise<AppUser> => {
  const currentMonth = getCurrentUsageMonth(date);

  if (user.usage_reset_month === currentMonth) {
    return user;
  }

  return saveUser({
    ...user,
    usage_count: 0,
    usage_reset_month: currentMonth
  });
};

export const incrementUserUsage = async (id: string): Promise<AppUser> => {
  const user = await getUserById(id);

  if (!user) {
    throw new Error(`User not found: ${id}`);
  }

  const currentUser = await resetUserUsageForCurrentMonth(user);

  return saveUser({ ...currentUser, usage_count: currentUser.usage_count + 1 });
};

export const resetUserUsage = async (id: string): Promise<AppUser> => {
  const user = await getUserById(id);

  if (!user) {
    throw new Error(`User not found: ${id}`);
  }

  return saveUser({
    ...user,
    usage_count: 0,
    usage_reset_month: getCurrentUsageMonth()
  });
};

export const calculateUsageRemaining = (user: AppUser) =>
  Math.max(PLAN_MONTHLY_LIMITS[user.plan] - user.usage_count, 0);
