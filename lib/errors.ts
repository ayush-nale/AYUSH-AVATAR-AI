export class AppError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.name = "AppError";
    this.status = status;
    this.code = code;
  }
}

export function safeErrorMessage(error: unknown) {
  if (error instanceof AppError) return error.message;
  console.error(error);
  return "Something went wrong. Please try again.";
}
