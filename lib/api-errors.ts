import { NextResponse } from "next/server";

export type PublicErrorCode =
  | "BAD_REQUEST"
  | "AUTH_REQUIRED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RATE_LIMITED"
  | "CONFLICT"
  | "SERVER_ERROR";

export class PublicApiError extends Error {
  code: PublicErrorCode;
  status: number;

  constructor(message: string, status = 500, code: PublicErrorCode = "SERVER_ERROR") {
    super(message);
    this.name = "PublicApiError";
    this.status = status;
    this.code = code;
  }
}

export const apiErrorResponse = (
  message: string,
  status: number,
  code: PublicErrorCode,
  details: Record<string, unknown> = {}
) =>
  NextResponse.json(
    {
      error: message,
      code,
      ...details
    },
    { status }
  );

export const unexpectedApiErrorResponse = ({
  code = "SERVER_ERROR",
  error,
  logMessage,
  message = "処理中に問題が発生しました。時間をおいて再度お試しください。"
}: {
  code?: PublicErrorCode;
  error: unknown;
  logMessage: string;
  message?: string;
}) => {
  if (error instanceof PublicApiError) {
    return apiErrorResponse(error.message, error.status, error.code);
  }

  console.error(logMessage, error);

  return apiErrorResponse(message, 500, code);
};
