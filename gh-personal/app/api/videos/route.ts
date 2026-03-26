import { NextResponse } from 'next/server';
import { getTableData } from '@/lib/nocodb';

export async function GET() {
  try {
    const data = await getTableData('videos', { limit: 500 });
    const videos = data.list || [];
    console.log('✅ Vídeos encontrados:', videos.length);
    return NextResponse.json({ videos });
  } catch (error: any) {
    console.error('❌ Erro ao buscar vídeos:', error.message);
    return NextResponse.json({ videos: [] });
  }
}
