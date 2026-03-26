import { NextResponse } from 'next/server';
import { nocodbApi } from '@/lib/nocodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// GET - Listar treinos de um aluno
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');

    if (!studentId) {
      return NextResponse.json({ error: 'student_id obrigatório' }, { status: 400 });
    }

    const response = await nocodbApi.get('/tables/workouts/records', {
      params: {
        where: `(student_id,eq,${studentId})`,
        sort: 'day_of_week'
      }
    });

    return NextResponse.json({ workouts: response.data.list });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Criar treino
export async function POST(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const personalId = decoded.id;

    const { student_id, name, day_of_week, exercises } = await request.json();

    // Criar treino
    const workoutRes = await nocodbApi.post('/tables/workouts/records', {
      student_id,
      personal_id: personalId,
      name,
      day_of_week,
      active: true
    });

    const workoutId = workoutRes.data.id;

    // Criar exercícios
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      await nocodbApi.post('/tables/workout_exercises/records', {
        workout_id: workoutId,
        video_id: ex.video_id,
        sets: ex.sets,
        rest: ex.rest,
        notes: ex.notes || '',
        order_index: i
      });
    }

    return NextResponse.json({ success: true, workoutId });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
