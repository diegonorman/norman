import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const cookieStore = await cookies();
    const session = cookieStore.get('session');
    
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Pegar parâmetro do vídeo
    const { searchParams } = new URL(request.url);
    const videoPath = searchParams.get('video');
    
    if (!videoPath || !videoPath.startsWith('/videos/')) {
      return new NextResponse('Invalid video path', { status: 400 });
    }

    // Caminho completo do vídeo
    const fullPath = path.join(process.cwd(), 'public', videoPath);
    
    if (!fs.existsSync(fullPath)) {
      return new NextResponse('Video not found', { status: 404 });
    }

    // Retornar o vídeo protegido
    const videoBuffer = fs.readFileSync(fullPath);
    
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Cache-Control': 'private, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Erro ao servir vídeo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
