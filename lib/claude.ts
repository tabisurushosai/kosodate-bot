import Anthropic from "@anthropic-ai/sdk";

const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";
const DEFAULT_MAX_TOKENS = 1500;

let anthropicClient: Anthropic | null = null;

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

export type ClaudeMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CreateClaudeResponseInput = {
  messages: ClaudeMessage[];
  system?: string;
  model?: string;
  maxTokens?: number;
};

export type ClaudeUsage = {
  inputTokens: number;
  outputTokens: number;
};

export type ClaudeResponse = {
  text: string;
  model: string;
  usage: ClaudeUsage;
  stopReason: string | null;
  maxTokens: number;
};

export const getClaudeClient = () => {
  if (!anthropicClient) {
    anthropicClient = new Anthropic({
      apiKey: requiredEnv("ANTHROPIC_API_KEY")
    });
  }

  return anthropicClient;
};

const extractText = (response: any): string => {
  if (!response || !response.content || !Array.isArray(response.content)) return "";
  return response.content
    .filter((block: any) => block && block.type === "text")
    .map((block: any) => block.text || "")
    .join("\n")
    .trim();
};

export const createClaudeResponse = async ({
  messages,
  system,
  model = process.env.CLAUDE_MODEL ?? DEFAULT_CLAUDE_MODEL,
  maxTokens = DEFAULT_MAX_TOKENS
}: CreateClaudeResponseInput): Promise<ClaudeResponse> => {
  if (messages.length === 0) {
    throw new Error("Claude request requires at least one message");
  }

  const boundedMaxTokens = Math.min(Math.max(maxTokens, 1), DEFAULT_MAX_TOKENS);

  const response = await getClaudeClient().messages.create({
    model,
    max_tokens: boundedMaxTokens,
    system,
    messages: messages.map((message) => ({
      role: message.role,
      content: message.content
    }))
  });

  return {
    text: extractText(response.content),
    model: response.model,
    stopReason: response.stop_reason,
    maxTokens: boundedMaxTokens,
    usage: {
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens
    }
  };
};

export { DEFAULT_CLAUDE_MODEL, DEFAULT_MAX_TOKENS };
