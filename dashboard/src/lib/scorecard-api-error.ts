/** Server-side: never expose raw Monday / stack traces to the client. */
export function friendlyScorecardError(err: unknown): { message: string; status: number } {
  const raw = err instanceof Error ? err.message : String(err ?? 'Unknown error');
  const lower = raw.toLowerCase();

  if (lower.includes('monday_api_token not configured')) {
    return {
      message: 'The dashboard is not fully configured yet. Please contact your administrator.',
      status: 503,
    };
  }

  if (
    lower.includes('not authenticated') ||
    lower.includes('invalid token') ||
    lower.includes('authentication failed')
  ) {
    return {
      message:
        'We could not connect to Monday.com to load scorecard data. Please try again later or contact your administrator.',
      status: 503,
    };
  }

  if (lower.includes('rate limit') || lower.includes('complexity')) {
    return {
      message: 'Monday.com is busy right now. Please wait a moment and try again.',
      status: 503,
    };
  }

  return {
    message: 'Unable to load scorecard data right now. Please try again.',
    status: 500,
  };
}
