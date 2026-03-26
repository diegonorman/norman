import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createRecord, getTableData, updateRecord, deleteRecord } from '@/lib/nocodb';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'gh_personal_super_secret_key_2026_change_in_prod';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;

    // Buscar apenas alunos deste personal
    const data = await getTableData('users', {});
    const students = data.list.filter((u: any) => 
      u.role === 'student' && u.personal_id == decoded.id
    );

    return NextResponse.json({ students });

  } catch (error) {
    console.error('Erro ao buscar alunos:', error);
    return NextResponse.json({ students: [] });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const body = await request.json();

    // Criar usuário do aluno vinculado ao personal
    const passwordHash = await bcrypt.hash(body.password, 10);
    
    const user = await createRecord('users', {
      email: body.email,
      password_hash: passwordHash,
      name: body.name,
      phone: body.phone || null,
      role: 'student',
      active: true,
      personal_id: decoded.id
    });

    return NextResponse.json({ student: user });

  } catch (error) {
    console.error('Erro ao criar aluno:', error);
    return NextResponse.json({ error: 'Erro ao criar aluno' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { id, active, password, ...data } = body;

    // Se tem senha, fazer hash
    if (password) {
      data.password_hash = await bcrypt.hash(password, 10);
    }

    // Se tem active, adicionar
    if (active !== undefined) {
      data.active = active;
    }

    const user = await updateRecord('users', id, data);

    return NextResponse.json({ student: user });

  } catch (error) {
    console.error('Erro ao atualizar aluno:', error);
    return NextResponse.json({ error: 'Erro ao atualizar aluno' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID não fornecido' }, { status: 400 });
    }

    await deleteRecord('users', id);

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro ao deletar aluno:', error);
    return NextResponse.json({ error: 'Erro ao deletar aluno' }, { status: 500 });
  }
}
