import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const stats = {
    core: "Operational",
    database: "Operational",
    bridge: "Operational",
    latency: 0
  };

  const start = Date.now();

  try {
    // Check Database
    const { error: dbError } = await supabaseAdmin.from('bots').select('id').limit(1);
    if (dbError) stats.database = "Degraded";
    
    stats.latency = Date.now() - start;
  } catch (err) {
    stats.database = "Down";
    stats.core = "Issues Detected";
  }

  return NextResponse.json(stats);
}
