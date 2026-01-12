import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const fileName = request.nextUrl.searchParams.get('file');

  if (!fileName) {
    return NextResponse.json({ error: 'File name required' }, { status: 400 });
  }

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('directory_path')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

    const botPath = bot.directory_path || '.';
    const filePath = path.resolve(process.cwd(), botPath, fileName);
    const botRootPath = path.resolve(process.cwd(), botPath);

    if (!filePath.startsWith(botRootPath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      const content = await fs.readFile(filePath, 'utf-8');

    return NextResponse.json({ content });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { fileName, content } = await request.json();

  if (!fileName) {
    return NextResponse.json({ error: 'File name required' }, { status: 400 });
  }

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('directory_path')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

    const botPath = bot.directory_path || '.';
    const filePath = path.resolve(process.cwd(), botPath, fileName);
    const botRootPath = path.resolve(process.cwd(), botPath);

    if (!filePath.startsWith(botRootPath)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    try {
      // Ensure directory exists
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, content, 'utf-8');
      return NextResponse.json({ success: true });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
