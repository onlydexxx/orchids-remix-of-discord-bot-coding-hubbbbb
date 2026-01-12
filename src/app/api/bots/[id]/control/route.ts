import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { action } = await request.json();

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('*')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  const botPath = bot.directory_path || '.';
  const absolutePath = path.resolve(process.cwd(), botPath);
    const startupCmd = bot.startup_command || 'python3 bot.py';
    const pm2Name = `bot-${id}`;
    const logPath = path.resolve(process.cwd(), 'logs', `${pm2Name}.log`);

    if (action === 'START') {
      try {
        // Ensure logs directory exists
        const logsDir = path.dirname(logPath);
        if (!fs.existsSync(logsDir)) {
          fs.mkdirSync(logsDir, { recursive: true });
        }

        // 1. Force remove from PM2 if it exists to ensure a clean state
        try {
          await execAsync(`pm2 delete "${pm2Name}"`);
        } catch (e) {}

        // 2. Clear the log file on start
        fs.writeFileSync(logPath, '');

        // 3. Start with PM2
        const cmdParts = startupCmd.split(' ');
        const interpreter = cmdParts[0];
        const script = cmdParts.slice(1).join(' ');
        
        // Pass essential info as environment variables
        const envVars = `DISCORD_TOKEN="${bot.discord_token || ''}" BOT_ID="${bot.id}" API_URL="http://127.0.0.1:3000/api/bots"`;
        
        await execAsync(`${envVars} pm2 start "${script}" --name "${pm2Name}" --cwd "${absolutePath}" --interpreter "${interpreter}" --no-autorestart -l "${logPath}"`);
        
        // Give PM2 a moment to start and get the real PID
        await new Promise(resolve => setTimeout(resolve, 800));


      // Get the PID from PM2
      const { stdout } = await execAsync(`pm2 jlist`);
      const processes = JSON.parse(stdout);
      const botProcess = processes.find((p: any) => p.name === pm2Name);
      const pid = botProcess?.pid || null;

      await supabaseAdmin
        .from('bots')
        .update({ pid, status: 'ONLINE', start_time: new Date().toISOString() })
        .eq('id', id);
      
      return NextResponse.json({ success: true, pid, pm2Name });
    } catch (err: any) {
      return NextResponse.json({ error: `Failed to start: ${err.message}` }, { status: 500 });
    }
      } else if (action === 'STOP') {
        try {
          // 1. Try to kill by PID first if we have one (most direct)
          if (bot.pid && typeof bot.pid === 'number' && bot.pid > 0) {
            try {
              // Kill the process group to ensure children are killed too
              await execAsync(`kill -9 -${bot.pid}`).catch(() => {
                // Fallback to single process kill if group kill fails
                process.kill(bot.pid as number, 'SIGKILL');
              });
            } catch (e) {}
          }

          // 2. Stop and delete from PM2
          try {
            await execAsync(`pm2 delete "${pm2Name}" --force`);
          } catch (e) {
            await execAsync(`pm2 stop "${pm2Name}"`).catch(() => {});
            await execAsync(`pm2 delete "${pm2Name}"`).catch(() => {});
          }
          
          // 3. Robust pkill sweep
          // Kill any process that matches the script name or bot name
          const scriptName = startupCmd.split(' ').pop();
          if (scriptName) {
            await execAsync(`pkill -9 -f "${scriptName}"`).catch(() => {});
          }
          
          // Also kill any python process containing the bot's ID or name
          await execAsync(`pkill -9 -f "${id}"`).catch(() => {});
          await execAsync(`pkill -9 -f "bot.py"`).catch(() => {});

          await supabaseAdmin
            .from('bots')
            .update({ 
              pid: null, 
              status: 'OFFLINE', 
              discord_status: 'OFFLINE',
              ping: 0,
              last_seen: new Date().toISOString()
            })
            .eq('id', id);
          
          return NextResponse.json({ success: true });
        } catch (err: any) {

        await supabaseAdmin
          .from('bots')
          .update({ 
            pid: null, 
            status: 'OFFLINE', 
            discord_status: 'OFFLINE',
            ping: 0 
          })
          .eq('id', id);
        return NextResponse.json({ success: true, message: 'Bot stopped (cleanup complete)' });
      }
    }



  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
