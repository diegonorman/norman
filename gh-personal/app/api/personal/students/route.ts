import { NextResponse } from 'next/server';
import { nocodbApi } from '@/lib/nocodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// GET - Listar alunos do personal
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const personalId = decoded.id;

    // Buscar alunos
    const response = await nocodbApi.get('/tables/students/records', {
      params: {
        where: `(personal_id,eq,${personalId})`,
        sort: '-joined_at'
      }
    });

    return NextResponse.json({ students: response.data.list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar aluno
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const personalId = decoded.id;

    const { email, password, name, phone } = await request.json();

    // Verificar limite de alunos
    const subRes = await nocodbApi.get('/tables/subscriptions/records', {
      params: { where: `(personal_id,eq,${personalId})` }
    });
    
    const subscription = subRes.data.list[0];
    if (!subscription || subscription.status !== 'active') {
      return NextResponse.json({ error: 'Assinatura inativa' }, { status: 403 });
    }

    const studentsRes = await nocodbApi.get('/tables/students/records', {
      params: { where: `(personal_id,eq,${personalId})&(status,eq,active)` }
    });

    const planRes = await nocodbApi.get(`/tables/plans/records/${subscription.plan_id}`);
    const maxStudents = planRes.data.max_students;

    if (studentsRes.data.list.length >= maxStudents) {
      return NextResponse.json({ error: 'Limite de alunos atingido' }, { status: 403 });
    }

    // Criar usuário
    const password_hash = await bcrypt.hash(password, 10);
    const userRes = await nocodbApi.post('/tables/users/records', {
      email,
      password_hash,
      name,
      phone,
      role: 'student',
      active: true
    });

    // Vincular ao personal
    await nocodbApi.post('/tables/students/records', {
      personal_id: personalId,
      user_id: userRes.data.id,
      status: 'active'
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
