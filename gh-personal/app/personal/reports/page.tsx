'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';

export default function PersonalReports() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [progressData, setProgressData] = useState<any[]>([]);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user || user.role !== 'personal') {
      router.push('/login');
    } else {
      loadStudents();
    }
  }, [user, router]);

  const loadStudents = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      setStudents(data.students || []);
    } catch (error) {
      console.error('Erro ao carregar alunos:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateConsistency = (student: any) => {
    // Buscar logs do NocoDB (será carregado via API)
    return { rate: 0, total: 0, completed: 0 };
  };

  const getConsistencyColor = (rate: number) => {
    if (rate >= 80) return 'text-green-400';
    if (rate >= 60) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getConsistencyBg = (rate: number) => {
    if (rate >= 80) return 'bg-green-500/20';
    if (rate >= 60) return 'bg-yellow-500/20';
    return 'bg-red-500/20';
  };

  const viewProgress = async (student: any) => {
    setSelectedStudent(student);
    setShowProgressModal(true);
    setExpandedDays(new Set()); // Resetar expandidos
    
    // Carregar progresso e treinos
    const logsRes = await fetch(`/api/exercise-logs?studentId=${student.id}`);
    const logsData = await logsRes.json();
    
    // Buscar treinos do aluno para pegar nomes
    const workoutsRes = await fetch(`/api/workouts?studentId=${student.id}`);
    const workoutsData = await workoutsRes.json();
    const workouts = workoutsData.workouts || [];
    
    // Agrupar logs por data e treino
    const grouped: any = {};
    
    logsData.logs?.forEach((log: any) => {
      const workout = workouts.find((w: any) => w.id === log.workout_id);
      if (!workout) return;
      
      // exercise_id é o índice do exercício no array
      const exercise = workout.exercises?.[log.exercise_id];
      if (!exercise) return;
      
      const key = `${log.date}_${log.workout_id}`;
      
      if (!grouped[key]) {
        grouped[key] = {
          date: log.date,
          workoutName: workout.name,
          workoutId: log.workout_id,
          exercises: [],
          completed: true
        };
      }
      
      grouped[key].exercises.push({
        name: exercise.name,
        sets: exercise.sets,
        reps: exercise.reps,
        rest: exercise.rest,
        completed: log.completed
      });
    });
    
    setProgressData(Object.values(grouped));
  };

  const toggleDay = (key: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedDays(newExpanded);
  };

  const getProgressData = async (student: any) => {
    try {
      const res = await fetch(`/api/exercise-logs?studentId=${student.id}`);
      const data = await res.json();
      return data.logs || [];
    } catch {
      return [];
    }
  };

  if (!user || loading) return null;

  return (
    <DashboardLayout
      title="Relatórios de Alunos"
      subtitle="Análise de Consistência e Progresso"
      icon="📊"
      onLogout={logout}
      showBackButton
      backUrl="/personal"
    >
      {students.length === 0 ? (
        <DashboardCard className="p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum aluno cadastrado</h3>
          <p className="text-gray-400">Adicione alunos para ver relatórios</p>
        </DashboardCard>
      ) : (
        <div className="space-y-6">
          {/* Resumo Geral */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DashboardCard className="p-6">
              <div className="text-3xl mb-2">🎓</div>
              <h3 className="text-gray-300 text-sm">Total de Alunos</h3>
              <p className="text-3xl font-bold text-white">{students.length}</p>
            </DashboardCard>
            
            <DashboardCard className="p-6">
              <div className="text-3xl mb-2">✅</div>
              <h3 className="text-gray-300 text-sm">Alunos Consistentes</h3>
              <p className="text-3xl font-bold text-green-400">
                {students.filter((s: any) => calculateConsistency(s).rate >= 80).length}
              </p>
            </DashboardCard>
            
            <DashboardCard className="p-6">
              <div className="text-3xl mb-2">⚠️</div>
              <h3 className="text-gray-300 text-sm">Precisam Atenção</h3>
              <p className="text-3xl font-bold text-red-400">
                {students.filter((s: any) => calculateConsistency(s).rate < 60).length}
              </p>
            </DashboardCard>
          </div>

          {/* Lista de Alunos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {students.map((student: any) => {
              const consistency = calculateConsistency(student);
              const workouts = student.workouts ? JSON.parse(student.workouts) : [];
              const hasDiet = !!student.meals;
              const hasSupplements = !!student.supplements;
              
              return (
                <DashboardCard key={student.id} className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-lg">{student.name}</h3>
                      <p className="text-sm text-gray-400">{student.email}</p>
                    </div>
                  </div>

                  {/* Consistência */}
                  <div className={`p-4 rounded-lg mb-4 ${getConsistencyBg(consistency.rate)}`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-300">Consistência</span>
                      <span className={`text-2xl font-bold ${getConsistencyColor(consistency.rate)}`}>
                        {consistency.rate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          consistency.rate >= 80 ? 'bg-green-500' : 
                          consistency.rate >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${consistency.rate}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-2">
                      {consistency.completed} de {consistency.total} treinos completos
                    </p>
                  </div>

                  {/* Status do Plano */}
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-2xl mb-1">💪</div>
                      <p className="text-xs text-gray-400">Treinos</p>
                      <p className="text-sm font-bold text-white">{workouts.length}</p>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-2xl mb-1">{hasDiet ? '✅' : '❌'}</div>
                      <p className="text-xs text-gray-400">Dieta</p>
                      <p className={`text-sm font-bold ${hasDiet ? 'text-green-400' : 'text-red-400'}`}>
                        {hasDiet ? 'Sim' : 'Não'}
                      </p>
                    </div>
                    <div className="text-center p-2 bg-gray-800 rounded">
                      <div className="text-2xl mb-1">{hasSupplements ? '✅' : '❌'}</div>
                      <p className="text-xs text-gray-400">Suplementos</p>
                      <p className={`text-sm font-bold ${hasSupplements ? 'text-green-400' : 'text-red-400'}`}>
                        {hasSupplements ? 'Sim' : 'Não'}
                      </p>
                    </div>
                  </div>

                  {/* Ações */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => viewProgress(student)}
                      className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
                    >
                      📊 Progresso
                    </button>
                    <button
                      onClick={() => router.push(`/personal/students/${student.id}`)}
                      className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                    >
                      Ver Detalhes
                    </button>
                  </div>
                </DashboardCard>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de Progresso */}
      {showProgressModal && selectedStudent && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4">
          <DashboardCard className="w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedStudent.name}</h2>
                <p className="text-gray-400">Histórico de Progresso</p>
              </div>
              <button
                onClick={() => setShowProgressModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                ✕ Fechar
              </button>
            </div>

            {progressData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-xl font-bold text-white mb-2">Sem progresso registrado</h3>
                <p className="text-gray-400">O aluno ainda não completou nenhum treino</p>
              </div>
            ) : (
              <div className="space-y-4">
                {progressData
                  .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((log: any, idx: number) => {
                    const key = `${log.date}_${log.workoutId}`;
                    const isExpanded = expandedDays.has(key);
                    
                    return (
                    <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
                      {/* Header - Clicável */}
                      <button
                        onClick={() => toggleDay(key)}
                        className="w-full p-4 flex justify-between items-center hover:bg-gray-750 transition-colors"
                      >
                        <div className="text-left">
                          <h3 className="font-bold text-white">{log.workoutName}</h3>
                          <p className="text-sm text-gray-400">
                            {new Date(log.date + 'T12:00:00').toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: 'long',
                              year: 'numeric'
                            })}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {log.exercises.length} exercícios
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-green-500/20 text-green-400">
                            ✅ Completo
                          </span>
                          <span className="text-2xl text-gray-400">
                            {isExpanded ? '▼' : '▶'}
                          </span>
                        </div>
                      </button>

                      {/* Exercícios - Expansível */}
                      {isExpanded && log.exercises && log.exercises.length > 0 && (
                        <div className="p-4 pt-0 space-y-2 border-t border-gray-700">
                          {log.exercises.map((ex: any, exIdx: number) => (
                            <div key={exIdx} className="flex items-center gap-3 p-2 bg-gray-900 rounded">
                              <span className="text-2xl">✅</span>
                              <div className="flex-1">
                                <p className="text-white font-medium">{ex.name}</p>
                                <p className="text-sm text-gray-400">
                                  {ex.sets}x{ex.reps} • {ex.rest}s descanso
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )})}
              </div>
            )}
          </DashboardCard>
        </div>
      )}
    </DashboardLayout>
  );
}
