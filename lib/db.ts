export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };
type KvCommandArg = string | number;
type KvCommand = [string, ...KvCommandArg[]];

type KvPipelineResult<T> = {
  result?: T;
  error?: string;
};

type KvSetOptions = {
  ex?: number;
  nx?: boolean;
  xx?: boolean;
};

const requiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getKvConfig = () => ({
  restApiUrl: requiredEnv("KV_REST_API_URL").replace(/\/$/, ""),
  restApiToken: requiredEnv("KV_REST_API_TOKEN")
});

const parseStoredValue = <T extends JsonValue>(value: unknown): T | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    return value as T;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return value as T;
  }
};

export const kvCommand = async <T>(command: KvCommand): Promise<T> => {
  const { restApiUrl, restApiToken } = getKvConfig();
  const response = await fetch(`${restApiUrl}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${restApiToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify([command]),
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Vercel KV request failed: ${response.status} ${response.statusText}`);
  }

  const results = (await response.json()) as KvPipelineResult<T>[];
  const firstResult = results[0];

  if (!firstResult) {
    throw new Error("Vercel KV request returned no result");
  }

  if (firstResult.error) {
    throw new Error(`Vercel KV command failed: ${firstResult.error}`);
  }

  return firstResult.result as T;
};

export const kv = {
  async get<T extends JsonValue>(key: string): Promise<T | null> {
    const value = await kvCommand<unknown>(["GET", key]);

    return parseStoredValue<T>(value);
  },

  async set(key: string, value: JsonValue, options: KvSetOptions = {}) {
    const command: KvCommand = ["SET", key, JSON.stringify(value)];

    if (options.ex !== undefined) {
      command.push("EX", options.ex);
    }

    if (options.nx) {
      command.push("NX");
    }

    if (options.xx) {
      command.push("XX");
    }

    return kvCommand<"OK" | null>(command);
  },

  async del(...keys: string[]) {
    if (keys.length === 0) {
      return 0;
    }

    return kvCommand<number>(["DEL", ...keys]);
  },

  async expire(key: string, seconds: number) {
    return kvCommand<number>(["EXPIRE", key, seconds]);
  },

  async incr(key: string) {
    return kvCommand<number>(["INCR", key]);
  }
};
