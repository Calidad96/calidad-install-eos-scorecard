/** Map API / network failures to user-safe messages (never show raw JSON). */
export async function parseFetchError(
  res: Response
): Promise<{ message: string; redirectToLogin?: boolean }> {
  let raw = '';
  try {
    const text = await res.text();
    try {
      const json = JSON.parse(text) as { error?: string; message?: string };
      raw = json.error ?? json.message ?? text;
    } catch {
      raw = text;
    }
  } catch {
    raw = '';
  }

  const lower = raw.toLowerCase();

  if (res.status === 401 || lower.includes('unauthorized')) {
    return {
      message: 'Your session has expired. Please sign in again.',
      redirectToLogin: true,
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
    };
  }

  if (lower.includes('monday_api_token')) {
    return {
      message:
        'The dashboard is not fully configured yet. Please contact your administrator.',
    };
  }

  if (res.status === 503) {
    return {
      message: raw && !raw.startsWith('{')
        ? raw
        : 'The dashboard is temporarily unavailable. Please try again shortly.',
    };
  }

  if (res.status >= 500) {
    return {
      message: 'Something went wrong while loading the scorecard. Please try again.',
    };
  }

  if (raw && !raw.startsWith('{') && raw.length < 200) {
    return { message: raw };
  }

  return { message: 'Could not load the scorecard. Please try again.' };
}
