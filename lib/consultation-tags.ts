import { createClaudeResponse } from "@/lib/claude";
import {
  CONSULTATION_TAG_SYSTEM_PROMPT,
  createConsultationTagPrompt
} from "@/lib/prompts";

const MAX_TAGS = 5;
const MAX_TAG_LENGTH = 12;
const TAG_GENERATION_MAX_TOKENS = 120;

const normalizeGeneratedTag = (tag: string) =>
  tag
    .trim()
    .replace(/^#+/, "")
    .replace(/[、,\s]+$/g, "")
    .slice(0, MAX_TAG_LENGTH);

const toUniqueTags = (tags: string[]) =>
  Array.from(
    new Set(
      tags
        .map(normalizeGeneratedTag)
        .filter((tag) => tag.length > 0)
    )
  ).slice(0, MAX_TAGS);

const parseJsonArray = (text: string): unknown => {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\[[\s\S]*\]/);

    if (!match) {
      return null;
    }

    try {
      return JSON.parse(match[0]);
    } catch {
      return null;
    }
  }
};

export const parseGeneratedConsultationTags = (text: string): string[] => {
  const parsed = parseJsonArray(text);

  if (Array.isArray(parsed)) {
    return toUniqueTags(
      parsed.filter((tag): tag is string => typeof tag === "string")
    );
  }

  return toUniqueTags(
    text
      .split(/\r?\n|、|,/)
      .map((tag) => tag.replace(/^[-*]\s*/, ""))
  );
};

export const generateConsultationTags = async ({
  message,
  response
}: {
  message: string;
  response: string;
}) => {
  const tagResponse = await createClaudeResponse({
    system: CONSULTATION_TAG_SYSTEM_PROMPT,
    maxTokens: TAG_GENERATION_MAX_TOKENS,
    messages: [
      {
        role: "user",
        content: createConsultationTagPrompt({ message, response })
      }
    ]
  });

  return parseGeneratedConsultationTags(tagResponse.text);
};
