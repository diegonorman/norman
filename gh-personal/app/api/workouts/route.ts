import { NextResponse } from 'next/server';
import { getTableData, updateRecord } from '@/lib/nocodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == studentId);
    
    console.log('Student encontrado:', student);
    console.log('Campo workouts:', student?.workouts);
    
    const workouts = student?.workouts ? JSON.parse(student.workouts) : [];

    return NextResponse.json({ workouts });
  } catch (error) {
    console.error('Erro GET workouts:', error);
    return NextResponse.json({ workouts: [] });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == body.studentId);
    
    if (body.workouts) {
      // Edição completa do array
      await updateRecord('users', body.studentId, {
        workouts: JSON.stringify(body.workouts)
      });
    } else {
      // Adicionar novo
      const workouts = student?.workouts ? JSON.parse(student.workouts) : [];
      workouts.push({
        id: Date.now(),
        dayOfWeek: body.dayOfWeek,
        name: body.name
      });
      
      await updateRecord('users', body.studentId, {
        workouts: JSON.stringify(workouts)
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao criar treino' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const studentId = searchParams.get('studentId');

    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == studentId);
    
    const workouts = student?.workouts ? JSON.parse(student.workouts) : [];
    const filtered = workouts.filter((w: any) => w.id != id);
    
    await updateRecord('users', studentId!, {
      workouts: JSON.stringify(filtered)
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar treino' }, { status: 500 });
  }
}
