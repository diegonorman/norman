import { NextResponse } from 'next/server';
import { nocodbApi } from '@/lib/nocodb';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

// GET - Buscar treinos do aluno
export async function GET(request: Request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const userId = decoded.id;

    // Buscar student_id
    const studentRes = await nocodbApi.get('/tables/students/records', {
      params: { where: `(user_id,eq,${userId})` }
    });

    if (!studentRes.data.list || studentRes.data.list.length === 0) {
      return NextResponse.json({ workouts: [] });
    }

    const studentId = studentRes.data.list[0].id;

    // Buscar treinos
    const workoutsRes = await nocodbApi.get('/tables/workouts/records', {
      params: {
        where: `(student_id,eq,${studentId})&(active,eq,true)`,
        sort: 'day_of_week'
      }
    });

    const workouts = workoutsRes.data.list;

    // Buscar exercícios de cada treino
    for (const workout of workouts) {
      const exercisesRes = await nocodbApi.get('/tables/workout_exercises/records', {
        params: {
          where: `(workout_id,eq,${workout.id})`,
          sort: 'order_index'
        }
      });

      // Buscar detalhes dos vídeos
      const exercises = exercisesRes.data.list;
      for (const ex of exercises) {
        const videoRes = await nocodbApi.get(`/tables/mx8zuezyuxrdstw/records/${ex.video_id}`);
        ex.video = videoRes.data;
      }

      workout.exercises = exercises;
    }

    return NextResponse.json({ workouts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
