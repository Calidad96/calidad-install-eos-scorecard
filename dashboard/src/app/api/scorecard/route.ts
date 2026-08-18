import { NextResponse } from 'next/server';
import { aggregateScorecard } from '@/lib/aggregate';
import { friendlyScorecardError } from '@/lib/scorecard-api-error';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await aggregateScorecard();
    return NextResponse.json(data);
  } catch (err) {
    const { message, status } = friendlyScorecardError(err);
    console.error('[scorecard]', err instanceof Error ? err.message : err);
    return NextResponse.json({ error: message }, { status });
  }
}
