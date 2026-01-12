import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

  export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
  ) {
    const { id } = await params;
    const pm2Name = `bot-${id}`;
    const logPath = path.join(process.cwd(), 'logs', `${pm2Name}.log`);
    
    try {
      if (!fs.existsSync(logPath)) {
        // Fallback to generic bot.log for compatibility or if not yet migrated
        const genericLogPath = path.join(process.cwd(), 'bot.log');
        if (!fs.existsSync(genericLogPath)) {
          return NextResponse.json({ logs: "NO_LOGS_FOUND" });
        }
        const logs = fs.readFileSync(genericLogPath, 'utf8');
        return NextResponse.json({ logs: logs.split('\n').slice(-50).join('\n') });
      }
      
      const logs = fs.readFileSync(logPath, 'utf8');
      const filteredLines = logs.split('\n')
        .slice(-100)
        .join('\n');

    
    return NextResponse.json({ logs: filteredLines });
  } catch (err) {
    return NextResponse.json({ error: "Failed to read logs" }, { status: 500 });
  }
}
