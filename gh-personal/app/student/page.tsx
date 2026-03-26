'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  
  // Todos os useState juntos no topo
  const [activeTab, setActiveTab] = useState<'treino' | 'dieta' | 'suplementos' | 'progresso'>('treino');
  const [workouts, setWorkouts] = useState<any[]>([]);
  const [diet, setDiet] = useState('');
  const [supplements, setSupplements] = useState('');
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [completedWorkouts, setCompletedWorkouts] = useState<Set<number>>(new Set());
  const [monthlyHistory, setMonthlyHistory] = useState<any[]>([]);
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [personalName, setPersonalName] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [exerciseLogs, setExerciseLogs] = useState<any[]>([]);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [videoModal, setVideoModal] = useState<{show: boolean, url: string}>({show: false, url: ''});

  // Limpar localStorage antigo (migração para NocoDB)
  useEffect(() => {
    localStorage.removeItem('workout_history');
    localStorage.removeItem('completed_workouts');
    localStorage.removeItem('current_week');
    // Limpar todos os day_X
    for (let i = 1; i <= 7; i++) {
      localStorage.removeItem(`day_${i}`);
    }
    
    // Criar AudioContext no primeiro clique
    const initAudio = () => {
      if (!audioContext) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        setAudioContext(ctx);
      }
    };
    document.addEventListener('click', initAudio, { once: true });
    return () => document.removeEventListener('click', initAudio);
  }, []);

  const getWeekNumber = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000));
  };

  const getDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDay, year, month };
  };

  const getMonthStats = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const today = new Date().toISOString().split('T')[0];
    
    // Contar treinos completos no mês
    const completedDays = new Set<string>();
    
    workouts.forEach(workout => {
      const workoutExercises = workout.exercises?.length || 0;
      if (workoutExercises === 0) return;
      
      // Verificar cada dia do mês
      const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, currentMonth, day).toISOString().split('T')[0];
        const completedCount = exerciseLogs.filter((log: any) => 
          log.workout_id === workout.id && 
          log.date === date && 
          log.completed
        ).length;
        
        if (completedCount === workoutExercises) {
          completedDays.add(date);
        }
      }
    });
    
    // Contar treinos completos hoje
    const todayCompleted = workouts.filter(workout => {
      const workoutExercises = workout.exercises?.length || 0;
      if (workoutExercises === 0) return false;
      
      const completedCount = exerciseLogs.filter((log: any) => 
        log.workout_id === workout.id && 
        log.date === today && 
        log.completed
      ).length;
      
      return completedCount === workoutExercises;
    }).length;
    
    return {
      total: completedDays.size,
      thisWeek: todayCompleted
    };
  };
  
  // Todos os useEffect depois das funções

  useEffect(() => {
    if (!user || user.role !== 'student') {
      router.push('/login');
    } else {
      loadData();
    }
  }, [user, router]);

  useEffect(() => {
    let interval: any;
    if (timerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && timerActive) {
      setTimerActive(false);
      if (soundEnabled) {
        playBeep();
      }
    }
    return () => clearInterval(interval);
  }, [timerActive, timeLeft, soundEnabled]);

  const playBeep = () => {
    if (!audioContext) return;
    
    // 3 beeps rápidos
    for (let i = 0; i < 3; i++) {
      setTimeout(() => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        oscillator.frequency.value = 880; // Nota A5 (mais agudo)
        oscillator.type = 'sine';
        gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      }, i * 300);
    }
  };

  const loadData = async () => {
    try {
      // Carregar dados do aluno
      const studentsRes = await fetch('/api/students');
      const studentsData = await studentsRes.json();
      const studentData = studentsData.students.find((s: any) => s.id == user?.id);
      
      if (studentData?.personal_id) {
        const usersRes = await fetch('/api/students');
        const usersData = await usersRes.json();
        const personal = usersData.students.find((u: any) => u.id == studentData.personal_id);
        setPersonalName(personal?.name || 'Personal');
      }

      // Carregar treinos
      const workoutsRes = await fetch(`/api/workouts?studentId=${user?.id}`);
      const workoutsData = await workoutsRes.json();
      setWorkouts(workoutsData.workouts || []);

      // Carregar dieta
      const dietRes = await fetch(`/api/meals?studentId=${user?.id}`);
      const dietData = await dietRes.json();
      setDiet(dietData.diet || '');

      // Carregar suplementos
      const supRes = await fetch(`/api/supplements?studentId=${user?.id}`);
      const supData = await supRes.json();
      setSupplements(supData.supplements || '');

      // Carregar logs de exercícios (progresso)
      const logsRes = await fetch(`/api/exercise-logs?studentId=${user?.id}`);
      const logsData = await logsRes.json();
      setExerciseLogs(logsData.logs || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const startTimer = (seconds: number) => {
    setTimeLeft(seconds);
    setTimerActive(true);
  };

  const toggleExercise = async (idx: number) => {
    if (!selectedWorkout || !user?.id || isToggling) return;
    
    setIsToggling(true);
    const wasCompleted = completedExercises.has(idx);
    
    // Atualizar UI imediatamente
    const newSet = new Set(completedExercises);
    if (wasCompleted) {
      newSet.delete(idx);
    } else {
      newSet.add(idx);
    }
    setCompletedExercises(newSet);
    
    try {
      // Salvar no banco
      await fetch('/api/exercise-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          student_id: user.id,
          workout_id: selectedWorkout.id,
          exercise_id: idx,
          completed: !wasCompleted,
          date: new Date().toISOString().split('T')[0]
        })
      });
    } catch (error) {
      console.error('❌ Erro ao salvar exercício:', error);
      // Reverter UI em caso de erro
      setCompletedExercises(completedExercises);
    } finally {
      setIsToggling(false);
    }
  };

  const dayNamesFull: any = {
    '1': 'Segunda', '2': 'Terça', '3': 'Quarta', 
    '4': 'Quinta', '5': 'Sexta', '6': 'Sábado', '7': 'Domingo'
  };

  const selectedWorkout = workouts.find(w => w.dayOfWeek == selectedDay);
  const totalExercises = selectedWorkout?.exercises?.length || 0;
  const completedCount = completedExercises.size;
  const progress = totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0;

  // Carregar exercícios do dia
  useEffect(() => {
    if (!selectedDay || !workouts.length) return;
    
    const workout = workouts.find(w => w.dayOfWeek == selectedDay);
    if (!workout) {
      setCompletedExercises(new Set());
      return;
    }
    
    const today = new Date().toISOString().split('T')[0];
    const completed = exerciseLogs
      .filter((log: any) => log.workout_id === workout.id && log.date === today && log.completed)
      .map((log: any) => log.exercise_id);
    
    setCompletedExercises(new Set(completed));
  }, [selectedDay, exerciseLogs, workouts]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-400">Personal: {personalName}</p>
              <h1 className="text-xl font-bold text-white">{user.name}</h1>
            </div>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Sair
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-3 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('treino')}
            className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap text-xs ${
              activeTab === 'treino'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            💪 Treino
          </button>
          <button
            onClick={() => setActiveTab('progresso')}
            className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap text-xs ${
              activeTab === 'progresso'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            📊 Progresso
          </button>
          <button
            onClick={() => setActiveTab('dieta')}
            className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap text-xs ${
              activeTab === 'dieta'
                ? 'bg-green-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            🥗 Dieta
          </button>
          <button
            onClick={() => setActiveTab('suplementos')}
            className={`px-2 py-1 rounded font-medium transition-colors whitespace-nowrap text-xs ${
              activeTab === 'suplementos'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-800 text-gray-300'
            }`}
          >
            💊 Suplementos
          </button>
        </div>

        {/* Conteúdo */}
        {activeTab === 'treino' && (
          <div>
            {workouts.length === 0 ? (
              <div className="bg-gray-800 rounded-lg p-12 text-center">
                <div className="text-6xl mb-4">💪</div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Nenhum treino cadastrado
                </h3>
                <p className="text-gray-400">Seu personal ainda não criou treinos para você</p>
              </div>
            ) : (
              <>
                {/* Dias da Semana - Horizontal */}
                <div className="overflow-x-auto pb-3 mb-4">
                  <div className="flex gap-2 min-w-max">
                    {workouts.map((workout) => {
                      const workoutExercises = workout.exercises?.length || 0;
                      
                      // Pegar início da semana (segunda-feira)
                      const now = new Date();
                      const currentDayOfWeek = now.getDay(); // 0=Dom, 1=Seg, 2=Ter...
                      const daysFromMonday = currentDayOfWeek === 0 ? 6 : currentDayOfWeek - 1;
                      const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysFromMonday);
                      
                      // Calcular data desse dia da semana (1=Segunda, 2=Terça, etc)
                      const workoutDayNumber = parseInt(workout.dayOfWeek); // 1=Seg, 2=Ter...
                      const workoutDate = new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + (workoutDayNumber - 1));
                      const dayNumber = workoutDate.getDate();
                      
                      // Verificar se completou TODOS os exercícios HOJE
                      const today = new Date().toISOString().split('T')[0];
                      const completedToday = exerciseLogs.filter((log: any) => 
                        log.workout_id == workout.id && 
                        log.date === today && 
                        log.completed === true
                      ).length;
                      
                      const isCompleteToday = workoutExercises > 0 && completedToday === workoutExercises;
                      
                      let bgColor = 'bg-gray-800';
                      if (isCompleteToday) {
                        bgColor = 'bg-green-600';
                      }
                      
                      return (
                        <button
                          key={workout.id}
                          onClick={() => {
                            setSelectedDay(parseInt(workout.dayOfWeek));
                          }}
                          className={`p-1 rounded text-center transition-all min-w-[60px] relative ${
                            selectedDay == workout.dayOfWeek
                              ? 'bg-blue-500 text-white ring-1 ring-blue-300'
                              : `${bgColor} text-white hover:opacity-80`
                          }`}
                        >
                          {isCompleteToday && (
                            <div className="absolute top-0 right-0 text-xs">✅</div>
                          )}
                          <div className="text-base font-bold">{dayNumber}</div>
                          <div className="text-xs">{dayNamesFull[workout.dayOfWeek].substring(0, 3)}</div>
                          <div className="text-xs opacity-60">{workoutExercises}ex</div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Cronômetro */}
                {timerActive && (
                  <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
                    <div className="bg-blue-500 rounded-lg p-8 text-center max-w-md w-full mx-4">
                      <div className="text-sm text-blue-100 mb-4">⏱️ DESCANSO</div>
                      <div className="text-8xl font-bold text-white mb-6">
                        {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setSoundEnabled(!soundEnabled)}
                          className="flex-1 px-6 py-3 bg-white/20 text-white rounded-lg font-bold hover:bg-white/30"
                        >
                          {soundEnabled ? '🔊 Som ON' : '🔇 Som OFF'}
                        </button>
                        <button
                          onClick={() => setTimerActive(false)}
                          className="flex-1 px-6 py-3 bg-white text-blue-500 rounded-lg font-bold hover:bg-blue-50"
                        >
                          Parar
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Barra de Progresso */}
                {selectedWorkout && (
                  <div className="bg-gray-800 rounded-lg p-4 mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-300">Progresso</span>
                      <span className="text-sm font-bold text-white">
                        {completedCount}/{totalExercises} exercícios
                      </span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                      <div 
                        className={`h-4 rounded-full transition-all duration-300 ${
                          progress === 100 ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Exercícios */}
                {selectedWorkout ? (
                  <div className="space-y-3">
                    <h2 className="text-2xl font-bold text-white mb-4">
                      {selectedWorkout.name}
                    </h2>

                    {selectedWorkout.exercises && selectedWorkout.exercises.length > 0 ? (
                      selectedWorkout.exercises.map((ex: any, idx: number) => (
                        <div 
                          key={idx} 
                          onClick={() => toggleExercise(idx)}
                          className={`bg-gray-800 rounded-lg p-4 transition-all cursor-pointer hover:bg-gray-700 ${
                            completedExercises.has(idx) ? 'opacity-50' : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <input
                              type="checkbox"
                              checked={completedExercises.has(idx)}
                              onChange={(e) => {
                                e.stopPropagation();
                                toggleExercise(idx);
                              }}
                              className="mt-1 w-6 h-6 rounded border-gray-600 text-blue-500 focus:ring-blue-500 pointer-events-none"
                            />
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-2 mb-2">
                                <div>
                                  <span className="text-blue-500 font-bold mr-2">{idx + 1}</span>
                                  <span className={`text-lg font-bold ${
                                    completedExercises.has(idx) ? 'line-through text-gray-500' : 'text-white'
                                  }`}>
                                    {ex.name}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="text-blue-400 font-medium mb-2">
                                {ex.details || `${ex.sets}x${ex.reps}`}
                              </div>
                              
                              {ex.notes && (
                                <p className="text-sm text-gray-400 mb-3">💡 {ex.notes}</p>
                              )}
                              
                              <div className="flex gap-2">
                                {ex.video && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setVideoModal({show: true, url: ex.video});
                                    }}
                                    className="px-3 py-1.5 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                                  >
                                    🎥 Ver Vídeo
                                  </button>
                                )}
                                
                                {ex.rest && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      startTimer(parseInt(ex.rest));
                                    }}
                                    className="px-3 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                                  >
                                    ⏱️ Descanso {ex.rest}s
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-gray-800 rounded-lg">
                        <div className="text-6xl mb-4">💪</div>
                        <p className="text-gray-400">Nenhum exercício adicionado</p>
                      </div>
                    )}
                  </div>
                ) : workouts.length > 0 ? (
                  <div className="bg-gray-800 rounded-lg p-12 text-center">
                    <div className="text-6xl mb-4">{new Date().getDate()}</div>
                    <h3 className="text-xl font-bold text-white mb-2">
                      Selecione um dia
                    </h3>
                    <p className="text-gray-400 mb-4">Clique em um dia acima para ver os exercícios</p>
                    <p className="text-yellow-400 font-bold text-lg">
                      {[
                        '💪 Bora vencer!',
                        '🔥 Conquistar o shape!',
                        '💯 Ficar trincado!',
                        '🦍 Virar monstro!',
                        '👑 Cavalona mode ON!',
                        '⚡ Sem desculpas!',
                        '🎯 Foco no objetivo!',
                        '💥 Treino pesado hoje!',
                        '🏆 Rumo ao shape dos sonhos!',
                        '🔱 Transformação em andamento!'
                      ][Math.floor(Math.random() * 10)]}
                    </p>
                  </div>
                ) : null}
              </>
            )}
          </div>
        )}

        {activeTab === 'progresso' && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">🔥</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {getMonthStats().thisWeek}
                </div>
                <div className="text-sm text-gray-400">Treinos esta semana</div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-6 text-center">
                <div className="text-4xl mb-2">📅</div>
                <div className="text-3xl font-bold text-white mb-1">
                  {getMonthStats().total}
                </div>
                <div className="text-sm text-gray-400">Treinos este mês</div>
              </div>
            </div>

            {/* Progresso Semanal */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">📊 Treino de Hoje</h3>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">Progresso</span>
                <span className="text-sm font-bold text-white">
                  {completedCount}/{totalExercises} exercícios
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-4 mb-4">
                <div 
                  className={`h-4 rounded-full transition-all ${progress === 100 ? 'bg-green-500' : 'bg-orange-500'}`}
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              
              {progress === 100 && totalExercises > 0 && (
                <div className="bg-green-600 rounded-lg p-4 text-center">
                  <div className="text-3xl mb-2">🎉</div>
                  <div className="font-bold text-white">Treino Completo!</div>
                  <div className="text-sm text-green-100 mt-1">
                    Parabéns! Você completou todos os exercícios de hoje!
                  </div>
                </div>
              )}
            </div>

            {/* Calendário do Mês */}
            <div className="bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">
                📅 {['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'][new Date().getMonth()]} {new Date().getFullYear()}
              </h3>
              
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, i) => (
                  <div key={i} className="text-center text-xs text-gray-400 font-bold">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 gap-2">
                {(() => {
                  const { daysInMonth, firstDay, year, month } = getDaysInMonth();
                  const days = [];
                  
                  // Dias vazios antes do primeiro dia
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                  }
                  
                  // Dias do mês
                  for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = new Date(year, month, day).toISOString().split('T')[0];
                    const isToday = day === new Date().getDate() && 
                                   month === new Date().getMonth() && 
                                   year === new Date().getFullYear();
                    
                    // Verificar treinos completos (100%) e parciais
                    let hasCompleteWorkout = false;
                    let hasPartialWorkout = false;
                    let partialPercentage = 0;
                    
                    workouts.forEach(workout => {
                      const workoutExercises = workout.exercises?.length || 0;
                      if (workoutExercises === 0) return;
                      
                      const completed = exerciseLogs.filter((log: any) => 
                        log.workout_id === workout.id && 
                        log.date === dateStr && 
                        log.completed
                      ).length;
                      
                      if (completed === workoutExercises) {
                        hasCompleteWorkout = true;
                      } else if (completed > 0) {
                        hasPartialWorkout = true;
                        partialPercentage = Math.max(partialPercentage, Math.round((completed / workoutExercises) * 100));
                      }
                    });
                    
                    let bgColor = 'bg-gray-700 text-gray-400';
                    let content = day;
                    
                    if (hasCompleteWorkout) {
                      bgColor = 'bg-green-600 text-white';
                      content = <div className="flex flex-col items-center"><span className="text-xs">100%</span><span>{day}</span></div>;
                    } else if (hasPartialWorkout) {
                      bgColor = 'bg-orange-500 text-white';
                      content = <div className="flex flex-col items-center"><span className="text-[10px]">{partialPercentage}%</span><span className="text-xs">{day}</span></div>;
                    } else if (isToday) {
                      bgColor = 'bg-blue-500 text-white';
                    }
                    
                    days.push(
                      <div
                        key={day}
                        className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium ${bgColor}`}
                      >
                        {content}
                      </div>
                    );
                  }
                  
                  return days;
                })()}
              </div>
              
              <div className="flex gap-4 mt-4 text-xs flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded"></div>
                  <span className="text-gray-400">100%</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  <span className="text-gray-400">Parcial</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-gray-400">Hoje</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'dieta' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">🥗 Minha Dieta</h2>
            {diet ? (
              <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">{diet}</pre>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🥗</div>
                <p className="text-gray-400">Nenhuma dieta cadastrada</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'suplementos' && (
          <div className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-bold text-white mb-6">💊 Suplementação</h2>
            {supplements ? (
              <pre className="text-gray-300 whitespace-pre-wrap leading-relaxed">{supplements}</pre>
            ) : (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💊</div>
                <p className="text-gray-400">Nenhum suplemento cadastrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal de Vídeo */}
      {videoModal.show && (
        <div className="fixed bottom-4 right-4 md:right-4 md:bottom-4 left-4 md:left-auto z-50 bg-gray-900 rounded-lg shadow-2xl border-2 border-blue-500 mx-auto md:mx-0" style={{ maxWidth: '280px' }}>
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
            <span className="text-white font-bold">🎥 Vídeo</span>
            <button
              onClick={() => setVideoModal({show: false, url: ''})}
              className="text-white hover:text-red-500"
            >
              ❌
            </button>
          </div>
          <video
            src={videoModal.url}
            controls
            autoPlay
            muted
            playsInline
            disablePictureInPicture
            controlsList="nodownload nofullscreen"
            className="rounded-b-lg w-full"
            onEnded={() => setVideoModal({show: false, url: ''})}
          />
        </div>
      )}
    </div>
  );
}
