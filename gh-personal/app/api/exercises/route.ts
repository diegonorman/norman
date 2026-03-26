import { NextRequest, NextResponse } from 'next/server';
import { getTableData, createRecord } from '@/lib/nocodb';

export async function GET() {
  try {
    const data = await getTableData('exercise_library', { limit: 500 });
    return NextResponse.json({ exercises: data.list || [] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, muscle_group, video_id } = body;
    
    const exercise = await createRecord('exercise_library', {
      name,
      muscle_group: muscle_group || null,
      video_id: video_id || null
    });
    
    return NextResponse.json({ exercise });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
