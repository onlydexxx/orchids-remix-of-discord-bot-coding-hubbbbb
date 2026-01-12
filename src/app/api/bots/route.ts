import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchDiscordStats } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data: bots, error } = await supabaseAdmin
      .from('bots')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Supabase error fetching bots:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(bots || []);
  } catch (err: any) {
    console.error('Internal server error in /api/bots:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
    const body = await request.json();
    const { 
      name, cpu, ram, uptime, version, description, 
      tags, color, icon, invite_url, discord_token,
      directory_path, startup_command
    } = body;

    let server_count = 0;
    let user_count = 0;
    let command_count = 0;
    let botStatus = body.status || 'OFFLINE';

    if (discord_token) {
      const stats = await fetchDiscordStats(discord_token);
      if (stats) {
        server_count = stats.server_count;
        user_count = stats.user_count;
        command_count = stats.command_count;
        botStatus = 'ONLINE'; // Fix: assign directly
      }
    }
    
    const { data, error } = await supabaseAdmin
      .from('bots')
      .insert([{ 
        name, 
        status: botStatus, 
        cpu: cpu || '0%', 
        ram: ram || '0MB', 
        uptime: uptime || '0m',
        version: version || 'v1.0.0',
        description: description || '',
        tags: tags || [],
        color: color || 'text-primary',
        icon: icon || 'Cpu',
        invite_url: invite_url || '',
        discord_token,
        server_count,
        user_count,
        ping: body.ping || 0,
        command_count,
        last_seen: new Date().toISOString(),
        directory_path,
        startup_command
      }])
      .select()
      .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
