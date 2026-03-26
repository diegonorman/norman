import { NextResponse } from 'next/server';
import { getTableData, createRecord, updateRecord } from '@/lib/nocodb';
import bcrypt from 'bcryptjs';

// GET - Listar personals
export async function GET() {
  try {
    const data = await getTableData('users', {
      where: '(role,eq,personal)',
      sort: '-created_at'
    });

    const personals = data.list.map((p: any) => {
      const { password_hash, ...rest } = p;
      return rest;
    });

    return NextResponse.json({ personals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar personal
export async function POST(request: Request) {
  try {
    const { email, password, name, phone, plan_id } = await request.json();

    if (!plan_id) {
      return NextResponse.json({ error: 'Plano é obrigatório' }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    // Criar usuário
    let user;
    try {
      user = await createRecord('users', {
        email,
        password_hash,
        name,
        phone: phone || null,
        role: 'personal',
        active: true
      });
    } catch (userError: any) {
      console.error('Erro ao criar usuário:', userError.response?.data || userError.message);
      return NextResponse.json({ 
        error: userError.response?.data?.message || 'Erro ao criar usuário'
      }, { status: 400 });
    }

    // Criar subscription
    try {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);

      await createRecord('subscriptions', {
        personal_id: user.id,
        plan_id: parseInt(plan_id),
        status: 'pending',
        current_period_end: endDate.toISOString().split('T')[0]
      });
    } catch (subError: any) {
      console.error('Erro ao criar subscription:', subError.response?.data || subError.message);
      // Usuário foi criado, mas subscription falhou
      // Não retornar erro para não confundir o usuário
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: any) {
    console.error('Erro geral:', error);
    return NextResponse.json({ 
      error: 'Erro ao criar personal'
    }, { status: 500 });
  }
}

// PATCH - Atualizar status do personal
export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await updateRecord('users', id, body);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Desativar personal (mantido para compatibilidade)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await updateRecord('users', id, { active: false });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
