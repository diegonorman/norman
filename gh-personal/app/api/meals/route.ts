import { NextResponse } from 'next/server';
import { getTableData, updateRecord } from '@/lib/nocodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == studentId);
    
    const diet = student?.meals || '';

    return NextResponse.json({ diet });
  } catch (error) {
    return NextResponse.json({ diet: '' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await updateRecord('users', body.studentId, {
      meals: body.diet
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar dieta' }, { status: 500 });
  }
}
