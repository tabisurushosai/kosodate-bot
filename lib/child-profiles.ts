import { kv, type JsonValue } from "@/lib/db";

export type ChildProfile = {
  id: string;
  user_id: string;
  age: number;
  notes: string;
  interests: string[];
  difficulties: string[];
};

type StoredChildProfile = ChildProfile & { [key: string]: JsonValue };

export type CreateChildProfileInput = {
  user_id: string;
  age: number;
  notes?: string;
  interests?: string[];
  difficulties?: string[];
};

export type UpdateChildProfileInput = Partial<
  Pick<ChildProfile, "age" | "notes" | "interests" | "difficulties">
>;

const childProfileKey = (id: string) => `child_profile:${id}`;
const userChildProfileIdsKey = (userId: string) => `user:${userId}:child_profile_ids`;

const normalizeText = (value = "") => value.trim();

const normalizeTextList = (values: string[] = []) =>
  Array.from(
    new Set(
      values
        .map(normalizeText)
        .filter((value) => value.length > 0)
    )
  );

const isNonNegativeInteger = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 0;

const isChildProfile = (value: unknown): value is ChildProfile => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const profile = value as Partial<ChildProfile>;

  return (
    typeof profile.id === "string" &&
    typeof profile.user_id === "string" &&
    isNonNegativeInteger(profile.age) &&
    typeof profile.notes === "string" &&
    Array.isArray(profile.interests) &&
    profile.interests.every((interest) => typeof interest === "string") &&
    Array.isArray(profile.difficulties) &&
    profile.difficulties.every((difficulty) => typeof difficulty === "string")
  );
};

const assertValidChildProfile = (value: unknown, key: string): ChildProfile => {
  if (!isChildProfile(value)) {
    throw new Error(`Invalid child profile record in KV: ${key}`);
  }

  return value;
};

const createChildProfileId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `child_profile_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export const createChildProfileRecord = ({
  user_id,
  age,
  notes = "",
  interests = [],
  difficulties = []
}: CreateChildProfileInput): ChildProfile => ({
  id: createChildProfileId(),
  user_id,
  age,
  notes: normalizeText(notes),
  interests: normalizeTextList(interests),
  difficulties: normalizeTextList(difficulties)
});

export const getChildProfileById = async (id: string): Promise<ChildProfile | null> => {
  const key = childProfileKey(id);
  const profile = await kv.get<StoredChildProfile>(key);

  return profile ? assertValidChildProfile(profile, key) : null;
};

export const listChildProfilesByUser = async (
  userId: string
): Promise<ChildProfile[]> => {
  const ids = (await kv.get<string[]>(userChildProfileIdsKey(userId))) ?? [];
  const profiles = await Promise.all(ids.map((id) => getChildProfileById(id)));

  return profiles.filter((profile): profile is ChildProfile => profile !== null);
};

export const saveChildProfile = async (
  profile: ChildProfile
): Promise<ChildProfile> => {
  const normalizedProfile: ChildProfile = {
    ...profile,
    notes: normalizeText(profile.notes),
    interests: normalizeTextList(profile.interests),
    difficulties: normalizeTextList(profile.difficulties)
  };

  if (!isNonNegativeInteger(normalizedProfile.age)) {
    throw new Error("Child profile age must be a non-negative integer");
  }

  await kv.set(
    childProfileKey(normalizedProfile.id),
    normalizedProfile as StoredChildProfile
  );

  const idsKey = userChildProfileIdsKey(normalizedProfile.user_id);
  const existingIds = (await kv.get<string[]>(idsKey)) ?? [];
  const nextIds = [
    normalizedProfile.id,
    ...existingIds.filter((id) => id !== normalizedProfile.id)
  ];

  await kv.set(idsKey, nextIds);

  return normalizedProfile;
};

export const createChildProfile = async (
  input: CreateChildProfileInput
): Promise<ChildProfile> => {
  const profile = createChildProfileRecord(input);

  await saveChildProfile(profile);

  return profile;
};

export const updateChildProfile = async (
  id: string,
  input: UpdateChildProfileInput
): Promise<ChildProfile> => {
  const profile = await getChildProfileById(id);

  if (!profile) {
    throw new Error(`Child profile not found: ${id}`);
  }

  return saveChildProfile({ ...profile, ...input });
};

export const deleteChildProfile = async (id: string): Promise<void> => {
  const profile = await getChildProfileById(id);

  if (!profile) {
    return;
  }

  await kv.del(childProfileKey(id));

  const idsKey = userChildProfileIdsKey(profile.user_id);
  const existingIds = (await kv.get<string[]>(idsKey)) ?? [];
  const nextIds = existingIds.filter((profileId) => profileId !== id);

  await kv.set(idsKey, nextIds);
};
