import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Buscar todos os logs
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_NOCODB_URL}/tables/m3pehyuo16yte7j/records`,
      {
        headers: {
          'xc-token': process.env.NOCODB_API_TOKEN!,
        },
      }
    );

    const data = await response.json();
    const logs = data.list || [];

    // Deletar todos
    for (const log of logs) {
      await fetch(
        `${process.env.NEXT_PUBLIC_NOCODB_URL}/tables/m3pehyuo16yte7j/records`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'xc-token': process.env.NOCODB_API_TOKEN!,
          },
          body: JSON.stringify([{ id: log.id }]),
        }
      );
    }

    return NextResponse.json({ message: `${logs.length} logs deletados` });
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao limpar logs' }, { status: 500 });
  }
}
