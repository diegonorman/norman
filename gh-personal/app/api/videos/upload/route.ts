import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { createRecord } from '@/lib/nocodb';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('video') as File;
    const category = formData.get('category') as string;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (!file || !category || !title) {
      return NextResponse.json({ 
        error: 'Vídeo, categoria e título são obrigatórios' 
      }, { status: 400 });
    }

    // Criar diretório da categoria
    const categoryDir = path.join(process.cwd(), 'public', 'videos', category.toLowerCase());
    if (!existsSync(categoryDir)) {
      await mkdir(categoryDir, { recursive: true });
    }

    // Salvar arquivo
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileName = file.name.toLowerCase().replace(/\s+/g, '-');
    const filePath = path.join(categoryDir, fileName);
    await writeFile(filePath, buffer);

    // Caminho do vídeo
    const videoPath = `/videos/${category.toLowerCase()}/${fileName}`;

    // Salvar no banco com metadados completos
    await createRecord('videos', {
      title: title,
      url: videoPath,
      category: category,
      description: description || null,
      muscle_group: category,
      difficulty: 'intermediate',
      thumbnail: null // Será gerado depois
    });

    return NextResponse.json({ 
      success: true, 
      file: fileName,
      category,
      title
    });
  } catch (error: any) {
    console.error('Erro no upload:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
