import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { fetchDiscordStats } from '@/lib/discord';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
    const { 
      name, status, cpu, ram, uptime, version, description, 
      tags, color, icon, invite_url, discord_token,
      start_time, discord_status, directory_path, startup_command
    } = body;

    let server_count = body.server_count || 0;
    let user_count = body.user_count || 0;
    let ping = body.ping || 0;
    let command_count = body.command_count || 0;

    if (discord_token) {
      const stats = await fetchDiscordStats(discord_token);
      if (stats) {
        server_count = stats.server_count;
        user_count = stats.user_count;
        command_count = stats.command_count;
      }
    }
        
    const { data, error } = await supabaseAdmin
      .from('bots')
      .update({ 
        name, status, cpu, ram, uptime, version, description, 
        tags, color, icon, invite_url, discord_token,
        server_count, user_count, ping, command_count,
        start_time, discord_status, directory_path, startup_command,
        last_seen: new Date().toISOString()
      })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  
    const { 
      server_count, user_count, ping, command_count, 
      discord_status, status, start_time, pid 
    } = body;
    
    // Safety check: if the bot is supposed to be OFFLINE, don't let a heartbeat set it to ONLINE
    const { data: currentBot } = await supabaseAdmin
      .from('bots')
      .select('status')
      .eq('id', id)
      .single();

    let finalStatus = status;
    if (currentBot?.status === 'OFFLINE' && status === 'ONLINE') {
      finalStatus = 'OFFLINE';
    }
    
    const { data, error } = await supabaseAdmin
      .from('bots')
      .update({ 
        server_count, 
        user_count, 
        ping, 
        command_count, 
        discord_status, 
        status: finalStatus, 
        start_time,
        pid,
        last_seen: new Date().toISOString()
      })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { error } = await supabaseAdmin
    .from('bots')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
