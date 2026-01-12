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

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('directory_path')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  const searchParams = request.nextUrl.searchParams;
  const subPath = searchParams.get('path') || '';

    const baseBotPath = bot.directory_path || '.';
    const absolutePath = path.resolve(process.cwd(), baseBotPath, subPath);

    // Security check: ensure path is within bot directory
    const botRootPath = path.resolve(process.cwd(), baseBotPath);
    if (!absolutePath.startsWith(botRootPath)) {
      return NextResponse.json({ error: 'Access denied: Out of bounds' }, { status: 403 });
    }

    try {
      // Check if directory exists, if not create it
      try {
        await fs.access(absolutePath);
      } catch {
        if (subPath === '') {
          await fs.mkdir(absolutePath, { recursive: true });
        } else {
          return NextResponse.json({ error: 'Directory not found' }, { status: 404 });
        }
      }


    const files = await fs.readdir(absolutePath, { withFileTypes: true });
    const ignored = ['.next', 'node_modules', '.git', '.turbo', '.env'];
    
    const fileList = files
      .filter(file => !ignored.includes(file.name))
      .map(file => ({
        name: file.name,
        isDirectory: file.isDirectory(),
        size: 0,
        lastModified: new Date().toISOString(),
        relativePath: path.join(subPath, file.name)
      }));

    return NextResponse.json({ files: fileList, currentPath: subPath });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const formData = await request.formData();
  const action = formData.get('action') as string;

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('directory_path')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  const baseBotPath = bot.directory_path || '.';
  const currentPath = formData.get('currentPath') as string || '';
  const absoluteBasePath = path.resolve(process.cwd(), baseBotPath, currentPath);

  if (!absoluteBasePath.startsWith(process.cwd())) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    if (action === 'createFile') {
      const fileName = formData.get('fileName') as string;
      if (!fileName) {
        return NextResponse.json({ error: 'File name required' }, { status: 400 });
      }
      const filePath = path.join(absoluteBasePath, fileName);
      await fs.writeFile(filePath, '', 'utf-8');
      return NextResponse.json({ success: true, message: `File ${fileName} created` });
    }

    if (action === 'createFolder') {
      const folderName = formData.get('folderName') as string;
      if (!folderName) {
        return NextResponse.json({ error: 'Folder name required' }, { status: 400 });
      }
      const folderPath = path.join(absoluteBasePath, folderName);
      await fs.mkdir(folderPath, { recursive: true });
      return NextResponse.json({ success: true, message: `Folder ${folderName} created` });
    }

    if (action === 'upload') {
      const files = formData.getAll('files') as File[];
      const relativePaths = formData.getAll('relativePaths') as string[];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const relativePath = relativePaths[i] || file.name;
        const filePath = path.join(absoluteBasePath, relativePath);
        
        await fs.mkdir(path.dirname(filePath), { recursive: true });
        const buffer = Buffer.from(await file.arrayBuffer());
        await fs.writeFile(filePath, buffer);
      }
      
      return NextResponse.json({ success: true, message: `${files.length} file(s) uploaded` });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { filePath: fileToDelete } = await request.json();

  const { data: bot, error: dbError } = await supabaseAdmin
    .from('bots')
    .select('directory_path')
    .eq('id', id)
    .single();

  if (dbError || !bot) {
    return NextResponse.json({ error: 'Bot not found' }, { status: 404 });
  }

  const baseBotPath = bot.directory_path || '.';
  const absolutePath = path.resolve(process.cwd(), baseBotPath, fileToDelete);

  if (!absolutePath.startsWith(process.cwd())) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  try {
    const stat = await fs.stat(absolutePath);
    if (stat.isDirectory()) {
      await fs.rm(absolutePath, { recursive: true });
    } else {
      await fs.unlink(absolutePath);
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
