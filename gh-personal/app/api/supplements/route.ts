import { NextResponse } from 'next/server';
import { getTableData, updateRecord } from '@/lib/nocodb';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const data = await getTableData('users', {});
    const student = data.list.find((u: any) => u.id == studentId);
    
    const supplements = student?.supplements || '';

    return NextResponse.json({ supplements });
  } catch (error) {
    return NextResponse.json({ supplements: '' });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    await updateRecord('users', body.studentId, {
      supplements: body.supplements
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao salvar suplementos' }, { status: 500 });
  }
}
