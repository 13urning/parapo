/** Error thrown for any non-2xx API response or network failure. */
export class ApiError extends Error {
  readonly status: number;
  readonly details: string[];

  constructor(status: number, message: string, details: string[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }

  get isUnauthorized() {
    return this.status === 401;
  }
}

/** Maps a Nest-style error body `{ statusCode, message, error }` to an ApiError. */
export function toApiError(status: number, body: unknown): ApiError {
  const fallback = status >= 500 ? 'Something went wrong on our side. Please try again.' : 'Request failed.';
  if (body && typeof body === 'object' && 'message' in body) {
    const { message } = body as { message: unknown };
    if (Array.isArray(message)) {
      const details = message.map(String);
      return new ApiError(status, details[0] ?? fallback, details);
    }
    if (typeof message === 'string' && message) return new ApiError(status, message, [message]);
  }
  return new ApiError(status, fallback);
}

export function errorMessage(err: unknown, fallback = 'Something went wrong.'): string {
  return err instanceof Error && err.message ? err.message : fallback;
}
