'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface Exercise {
  id: string;
  sets: string;
  rest: string;
  notes: string;
  video: {
    title: string;
    url: string;
  };
}

interface Workout {
  id: string;
  name: string;
  day_of_week: number;
  exercises: Exercise[];
}

const DAYS = ['', 'SEG', 'TER', 'QUA', 'QUI', 'SEX'];

export default function StudentWorkoutsPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [selectedDay, setSelectedDay] = useState(1);
  const [loading, setLoading] = useState(true);
  const [completed, setCompleted] = useState<{ [key: string]: boolean }>({});
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login');
      return;
    }
    loadWorkouts();
    loadProgress();
  }, [user, router]);

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      const interval = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      alert('Tempo de descanso acabou! 💪');
    }
  }, [timerActive, timeLeft]);

  const loadWorkouts = async () => {
    try {
      const res = await fetch('/api/student/workouts', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setWorkouts(data.workouts || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProgress = async () => {
    try {
      const res = await fetch(`/api/exercise-logs?studentId=${user.id}`);
      const data = await res.json();
      
      // Reconstruir estado de completed dos exercícios do dia atual
      const today = new Date().toISOString().split('T')[0];
      const completedMap: { [key: string]: boolean } = {};
      
      data.logs?.forEach((log: any) => {
        if (log.date === today && log.completed) {
          completedMap[log.exercise_id] = true;
        }
      });
      
      setCompleted(completedMap);
    } catch (error) {
      console.error('Erro ao carregar progresso:', error);
    }
  };

  const toggleExercise = async (exerciseId: string) => {
    const isCompleted = !completed[exerciseId];
    const updated = { ...completed, [exerciseId]: isCompleted };
    setCompleted(updated);
    
    // Salvar no NocoDB via exercise-logs
    try {
      await fetch('/api/exercise-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          workout_id: currentWorkout?.id,
          exercise_id: exerciseId,
          completed: isCompleted,
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (error) {
      console.error('Erro ao salvar:', error);
    }
  };

  const startTimer = (rest: string) => {
    const match = rest.match(/(\d+)/);
    if (match) {
      setTimeLeft(parseInt(match[1]));
      setTimerActive(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const currentWorkout = workouts.find(w => w.day_of_week === selectedDay);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-4">
            <button onClick={() => router.push('/student')} className="text-2xl">←</button>
            <h1 className="text-2xl font-bold">Meu Treino</h1>
          </div>

          {/* Dias da Semana */}
          <div className="flex gap-2 overflow-x-auto">
            {[1, 2, 3, 4, 5].map((day) => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={`px-6 py-3 rounded-lg font-bold whitespace-nowrap transition-all ${
                  selectedDay === day
                    ? 'bg-white text-purple-600'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                {DAYS[day]}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : !currentWorkout ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">🏋️</div>
            <p className="text-lg">Nenhum treino para {DAYS[selectedDay]}</p>
            <p className="text-sm mt-2">Aguarde seu personal criar seu treino</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{currentWorkout.name}</h2>
            
            <div className="space-y-4">
              {currentWorkout.exercises.map((ex, i) => {
                const isCompleted = completed[ex.id];
                return (
                  <div
                    key={ex.id}
                    className={`bg-white rounded-xl shadow p-6 transition-all ${
                      isCompleted ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-2xl font-bold text-gray-400">{i + 1}</span>
                          <h3 className="text-xl font-bold text-gray-900">{ex.video.title}</h3>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>📊 {ex.sets}</span>
                          <span>⏱️ {ex.rest}</span>
                        </div>
                        {ex.notes && (
                          <p className="text-sm text-gray-500 mt-2">💡 {ex.notes}</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggleExercise(ex.id)}
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl transition-all ${
                          isCompleted
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {isCompleted ? '✓' : ''}
                      </button>
                    </div>

                    <div className="flex gap-3">
                      {ex.video.url && (
                        <a
                          href={ex.video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                        >
                          📹 Ver Vídeo
                        </a>
                      )}
                      {ex.rest !== '-' && (
                        <button 
                          onClick={() => startTimer(ex.rest)}
                          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                        >
                          ⏱️ Cronômetro
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progresso */}
            <div className="mt-8 bg-white rounded-xl shadow p-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-gray-900">Progresso do Dia</span>
                <span className="text-sm text-gray-600">
                  {Object.values(completed).filter(Boolean).length} / {currentWorkout.exercises.length}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all"
                  style={{
                    width: `${(Object.values(completed).filter(Boolean).length / currentWorkout.exercises.length) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Timer Modal */}
      {timerActive && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center">
            <div className="text-6xl font-bold text-purple-600 mb-4">
              {formatTime(timeLeft)}
            </div>
            <div className="text-gray-600 mb-6">Descanso</div>
            <button
              onClick={() => setTimerActive(false)}
              className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Parar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
