import { NextResponse } from 'next/server';
import { getTableData, createRecord } from '@/lib/nocodb';

// GET - Listar vídeos
export async function GET() {
  try {
    const data = await getTableData('videos', {
      sort: 'category,title',
      limit: 200
    });
    return NextResponse.json({ videos: data.list || [] });
  } catch (error: any) {
    console.error('Erro ao buscar vídeos:', error.message);
    return NextResponse.json({ error: error.message, videos: [] }, { status: 500 });
  }
}

// POST - Criar vídeo
export async function POST(request: Request) {
  try {
    const data = await request.json();
    const response = await createRecord('videos', data);
    return NextResponse.json({ success: true, video: response });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
