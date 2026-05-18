import { kv, type JsonValue } from "@/lib/db";

export type ConsultationHistory = {
  id: string;
  user_id: string;
  message: string;
  response: string;
  tags: string[];
  created_at: string;
};

type StoredConsultationHistory = ConsultationHistory & { [key: string]: JsonValue };

export type CreateConsultationHistoryInput = {
  user_id: string;
  message: string;
  response: string;
  tags?: string[];
  created_at?: string;
};

const consultationKey = (id: string) => `consultation:${id}`;
const userConsultationIdsKey = (userId: string) => `user:${userId}:consultation_ids`;

const normalizeTag = (tag: string) => tag.trim().replace(/^#/, "");

const normalizeTags = (tags: string[] = []) =>
  Array.from(
    new Set(
      tags
        .map(normalizeTag)
        .filter((tag) => tag.length > 0)
    )
  );

const isConsultationHistory = (value: unknown): value is ConsultationHistory => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const consultation = value as Partial<ConsultationHistory>;

  return (
    typeof consultation.id === "string" &&
    typeof consultation.user_id === "string" &&
    typeof consultation.message === "string" &&
    typeof consultation.response === "string" &&
    Array.isArray(consultation.tags) &&
    consultation.tags.every((tag) => typeof tag === "string") &&
    typeof consultation.created_at === "string"
  );
};

const assertValidConsultationHistory = (
  value: unknown,
  key: string
): ConsultationHistory => {
  if (!isConsultationHistory(value)) {
    throw new Error(`Invalid consultation history record in KV: ${key}`);
  }

  return value;
};

const createConsultationId = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `consultation_${Date.now()}_${Math.random().toString(36).slice(2)}`;
};

export const createConsultationHistoryRecord = ({
  user_id,
  message,
  response,
  tags = [],
  created_at = new Date().toISOString()
}: CreateConsultationHistoryInput): ConsultationHistory => ({
  id: createConsultationId(),
  user_id,
  message: message.trim(),
  response: response.trim(),
  tags: normalizeTags(tags),
  created_at
});

export const getConsultationHistoryById = async (
  id: string
): Promise<ConsultationHistory | null> => {
  const key = consultationKey(id);
  const consultation = await kv.get<StoredConsultationHistory>(key);

  return consultation ? assertValidConsultationHistory(consultation, key) : null;
};

export const listConsultationHistoriesByUser = async (
  userId: string
): Promise<ConsultationHistory[]> => {
  const ids = (await kv.get<string[]>(userConsultationIdsKey(userId))) ?? [];
  const histories = await Promise.all(ids.map((id) => getConsultationHistoryById(id)));

  return histories
    .filter((history): history is ConsultationHistory => history !== null)
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
};

export const listRecentConsultationHistoriesByUser = async (
  userId: string,
  limit = 3
): Promise<ConsultationHistory[]> => {
  const boundedLimit = Math.max(0, Math.floor(limit));

  if (boundedLimit === 0) {
    return [];
  }

  const ids = (await kv.get<string[]>(userConsultationIdsKey(userId))) ?? [];
  const recentIds = ids.slice(0, boundedLimit);
  const histories = await Promise.all(
    recentIds.map((id) => getConsultationHistoryById(id))
  );

  return histories.filter(
    (history): history is ConsultationHistory => history !== null
  );
};

export const saveConsultationHistory = async (
  consultation: ConsultationHistory
): Promise<ConsultationHistory> => {
  const normalizedConsultation: ConsultationHistory = {
    ...consultation,
    message: consultation.message.trim(),
    response: consultation.response.trim(),
    tags: normalizeTags(consultation.tags)
  };

  await kv.set(
    consultationKey(normalizedConsultation.id),
    normalizedConsultation as StoredConsultationHistory
  );

  const idsKey = userConsultationIdsKey(normalizedConsultation.user_id);
  const existingIds = (await kv.get<string[]>(idsKey)) ?? [];
  const nextIds = [
    normalizedConsultation.id,
    ...existingIds.filter((id) => id !== normalizedConsultation.id)
  ];

  await kv.set(idsKey, nextIds);

  return normalizedConsultation;
};

export const createConsultationHistory = async (
  input: CreateConsultationHistoryInput
): Promise<ConsultationHistory> => {
  const consultation = createConsultationHistoryRecord(input);

  await saveConsultationHistory(consultation);

  return consultation;
};

export const findConsultationHistoriesByTag = async (
  userId: string,
  tag: string
): Promise<ConsultationHistory[]> => {
  const normalizedTag = normalizeTag(tag);
  const histories = await listConsultationHistoriesByUser(userId);

  return histories.filter((history) => history.tags.includes(normalizedTag));
};
