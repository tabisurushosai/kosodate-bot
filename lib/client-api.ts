type ApiErrorBody = {
  error?: unknown;
};

const fallbackMessages: Record<number, string> = {
  400: "入力内容を確認してください。",
  401: "ログインが必要です。",
  403: "この操作を実行する権限がありません。",
  404: "必要な情報が見つかりませんでした。",
  409: "現在の状態では操作できません。",
  429: "利用上限に達しました。"
};

const parseJsonSafely = async (response: Response) => {
  try {
    return (await response.json()) as ApiErrorBody;
  } catch {
    return {};
  }
};

export const readApiJson = async <T>(
  response: Response,
  fallbackMessage = "処理に失敗しました。時間をおいて再度お試しください。"
): Promise<T> => {
  const data = await parseJsonSafely(response);

  if (!response.ok) {
    const message =
      typeof data.error === "string"
        ? data.error
        : fallbackMessages[response.status] ?? fallbackMessage;

    throw new Error(message);
  }

  return data as T;
};
