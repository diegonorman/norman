import { NextResponse } from 'next/server';
import { getTableData, updateRecord } from '@/lib/nocodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == studentId);
    
    const progress = student?.progress ? JSON.parse(student.progress) : { history: [], completedWorkouts: [] };

    return NextResponse.json(progress);
  } catch (error) {
    return NextResponse.json({ history: [], completedWorkouts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await updateRecord('users', body.studentId, {
      progress: JSON.stringify({
        history: body.history,
        completedWorkouts: body.completedWorkouts
      })
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar progresso' }, { status: 500 });
  }
}
