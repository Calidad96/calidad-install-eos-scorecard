import { NextResponse } from 'next/server';
import { aggregateScorecard } from '@/lib/aggregate';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await aggregateScorecard();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Scorecard aggregation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
