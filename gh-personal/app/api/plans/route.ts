import { NextResponse } from 'next/server';
import { getTableData, createRecord } from '@/lib/nocodb';

export async function GET() {
  try {
    const data = await getTableData('plans', {
      sort: 'price'
    });
    return NextResponse.json({ plans: data.list || [] });
  } catch (error: any) {
    console.error('Erro ao buscar planos:', error);
    return NextResponse.json({ error: error.message, plans: [] }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const plan = await createRecord('plans', data);
    return NextResponse.json({ success: true, plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
