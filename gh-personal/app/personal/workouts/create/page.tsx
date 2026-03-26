'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface Student {
  id: string;
  user_id: string;
}

interface Video {
  id: string;
  title: string;
  category: string;
  muscle_group: string;
}

interface Exercise {
  video_id: string;
  video_title: string;
  sets: string;
  rest: string;
  notes: string;
}

export default function CreateWorkoutPage() {
  const router = useRouter();
  const { user, token } = useAuthStore();
  const [students, setStudents] = useState<Student[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedStudent, setSelectedStudent] = useState('');
  const [workoutName, setWorkoutName] = useState('');
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'personal') {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [studentsRes, videosRes] = await Promise.all([
        fetch('/api/personal/students', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/videos')
      ]);
      const studentsData = await studentsRes.json();
      const videosData = await videosRes.json();
      setStudents(studentsData.students || []);
      setVideos(videosData.videos || []);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const addExercise = (video: Video) => {
    setExercises([...exercises, {
      video_id: video.id,
      video_title: video.title,
      sets: '3x10',
      rest: '60 seg',
      notes: ''
    }]);
  };

  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  const updateExercise = (index: number, field: string, value: string) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || exercises.length === 0) {
      alert('Selecione um aluno e adicione exercícios');
      return;
    }

    try {
      const res = await fetch('/api/personal/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          student_id: selectedStudent,
          name: workoutName,
          day_of_week: dayOfWeek,
          exercises
        })
      });

      if (res.ok) {
        alert('Treino criado com sucesso!');
        router.push('/personal');
      } else {
        const data = await res.json();
        alert(data.error || 'Erro ao criar treino');
      }
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const filteredVideos = videos.filter(v =>
    v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.push('/personal')} className="text-2xl">←</button>
          <h1 className="text-2xl font-bold">Criar Treino</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Configurações do Treino */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Configurações</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-4 py-3 border rounded-lg"
                required
              >
                <option value="">Selecione o aluno</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>Aluno {s.user_id}</option>
                ))}
              </select>

              <input
                type="text"
                placeholder="Nome do treino (ex: DIA 1 - PEITO)"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="px-4 py-3 border rounded-lg"
                required
              />

              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="px-4 py-3 border rounded-lg"
              >
                <option value={1}>Segunda-feira</option>
                <option value={2}>Terça-feira</option>
                <option value={3}>Quarta-feira</option>
                <option value={4}>Quinta-feira</option>
                <option value={5}>Sexta-feira</option>
              </select>
            </div>
          </div>

          {/* Exercícios Adicionados */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Exercícios ({exercises.length})</h2>
            {exercises.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Nenhum exercício adicionado</p>
            ) : (
              <div className="space-y-4">
                {exercises.map((ex, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="font-bold text-gray-900">{i + 1}. {ex.video_title}</div>
                      <button
                        type="button"
                        onClick={() => removeExercise(i)}
                        className="text-red-500 hover:text-red-700"
                      >
                        ✕
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Séries (ex: 3x10)"
                        value={ex.sets}
                        onChange={(e) => updateExercise(i, 'sets', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                      <input
                        type="text"
                        placeholder="Descanso (ex: 60 seg)"
                        value={ex.rest}
                        onChange={(e) => updateExercise(i, 'rest', e.target.value)}
                        className="px-3 py-2 border rounded"
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Observações (opcional)"
                      value={ex.notes}
                      onChange={(e) => updateExercise(i, 'notes', e.target.value)}
                      className="w-full px-3 py-2 border rounded mt-2"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Biblioteca de Vídeos */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold mb-4">Adicionar Exercícios</h2>
            <input
              type="text"
              placeholder="Buscar exercício..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border rounded-lg mb-4"
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {filteredVideos.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => addExercise(v)}
                  className="text-left p-4 border rounded-lg hover:bg-blue-50 hover:border-blue-500 transition-colors"
                >
                  <div className="font-bold text-gray-900">{v.title}</div>
                  <div className="text-sm text-gray-600 mt-1">{v.category} • {v.muscle_group}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => router.push('/personal')}
              className="flex-1 px-6 py-3 border rounded-lg hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Criar Treino
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
