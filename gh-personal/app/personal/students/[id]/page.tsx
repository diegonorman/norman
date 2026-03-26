'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';

export default function ManageStudent() {
  const router = useRouter();
  const params = useParams();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState<'treino' | 'dieta' | 'suplementos' | 'relatorio'>('treino');
  const [student, setStudent] = useState({ name: 'Carregando...' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'personal') {
      router.push('/login');
    } else {
      loadStudent();
    }
  }, [user, router]);

  const loadStudent = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      const found = data.students.find((s: any) => s.id == params.id);
      if (found) setStudent(found);
    } catch (error) {
      console.error('Erro ao carregar aluno:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || loading) return null;

  return (
    <DashboardLayout
      title={student.name}
      subtitle="Gerenciar Aluno"
      icon="🎓"
      onLogout={logout}
      showBackButton
      backUrl="/personal/students"
    >
      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('treino')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'treino'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          💪 Treino
        </button>
        <button
          onClick={() => setActiveTab('dieta')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'dieta'
              ? 'bg-green-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          🥗 Dieta
        </button>
        <button
          onClick={() => setActiveTab('suplementos')}
          className={`px-6 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'suplementos'
              ? 'bg-purple-500 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          💊 Suplementos
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'treino' && <TreinoTab studentId={params.id as string} />}
      {activeTab === 'dieta' && <DietaTab studentId={params.id as string} />}
      {activeTab === 'suplementos' && <SuplementosTab studentId={params.id as string} />}
    </DashboardLayout>
  );
}

// Tab de Treino
function TreinoTab({ studentId }: { studentId: string }) {
  const [workouts, setWorkouts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ dayOfWeek: '', name: '', exercises: [] });
  const [videos, setVideos] = useState([]);
  const [exerciseLibrary, setExerciseLibrary] = useState([]);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');

  useEffect(() => {
    loadWorkouts();
    loadVideos();
    loadExerciseLibrary();
  }, []);

  const loadWorkouts = async () => {
    const res = await fetch(`/api/workouts?studentId=${studentId}`);
    const data = await res.json();
    console.log('🏋️ Treinos carregados:', data.workouts);
    setWorkouts(data.workouts || []);
  };

  const loadVideos = async () => {
    const res = await fetch('/api/videos');
    const data = await res.json();
    console.log('📹 Vídeos carregados:', data);
    setVideos(data.videos || []);
  };

  const loadExerciseLibrary = async () => {
    const res = await fetch('/api/exercises');
    const data = await res.json();
    setExerciseLibrary(data.exercises || []);
  };

  const addNewExercise = async () => {
    if (!newExerciseName.trim()) return;
    const res = await fetch('/api/exercises', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newExerciseName })
    });
    const data = await res.json();
    setExerciseLibrary([...exerciseLibrary, data.exercise] as any);
    setNewExerciseName('');
    setShowAddExercise(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Salvar exercícios customizados na biblioteca
    for (const ex of formData.exercises as any[]) {
      if (ex.name && !exerciseLibrary.find((lib: any) => lib.name === ex.name)) {
        await fetch('/api/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: ex.name })
        });
      }
    }
    
    if (editingId) {
      // Editar
      const updated = workouts.map((w: any) => 
        w.id === editingId ? { ...w, ...formData } : w
      );
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentId, workouts: updated })
      });
    } else {
      // Criar
      await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, studentId })
      });
    }
    
    setShowModal(false);
    setEditingId(null);
    setFormData({ dayOfWeek: '', name: '', exercises: [] });
    loadWorkouts();
    loadExerciseLibrary(); // Recarregar lista de exercícios
  };

  const handleEdit = (workout: any) => {
    setEditingId(workout.id);
    setFormData({ 
      dayOfWeek: workout.dayOfWeek, 
      name: workout.name, 
      exercises: workout.exercises || [] 
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Deletar treino?')) return;
    await fetch(`/api/workouts?id=${id}&studentId=${studentId}`, { method: 'DELETE' });
    loadWorkouts();
  };

  const dayNames: any = {
    '1': 'Segunda', '2': 'Terça', '3': 'Quarta', 
    '4': 'Quinta', '5': 'Sexta', '6': 'Sábado', '7': 'Domingo'
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Treinos da Semana</h2>
        <button 
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
        >
          + Adicionar Dia
        </button>
      </div>

      {workouts.length === 0 ? (
        <DashboardCard className="p-12 text-center">
          <div className="text-6xl mb-4">💪</div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum treino criado</h3>
          <p className="text-gray-400">Adicione o primeiro dia de treino</p>
        </DashboardCard>
      ) : (
        <div className="space-y-4">
          {workouts.map((workout: any) => (
            <DashboardCard key={workout.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{dayNames[workout.dayOfWeek]}</h3>
                  <p className="text-gray-300">{workout.name}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {workout.exercises?.length || 0} exercícios
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(workout)}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(workout.id)}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              {/* Lista de exercícios */}
              {workout.exercises && workout.exercises.length > 0 && (
                <div className="border-t border-gray-700 pt-4 space-y-2">
                  {workout.exercises.map((ex: any, idx: number) => (
                    <div key={idx} className="text-sm">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500">{idx + 1}.</span>
                        <span className="text-white font-medium">{ex.name}</span>
                        <span className="text-gray-400">
                          {ex.details || `${ex.sets}x${ex.reps}`} {ex.rest && `• ${ex.rest}s`}
                        </span>
                      </div>
                      {ex.notes && (
                        <p className="text-gray-500 text-xs ml-8 mt-1">💡 {ex.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
              
              <button
                onClick={() => {
                  setEditingId(workout.id);
                  setFormData({ 
                    dayOfWeek: workout.dayOfWeek, 
                    name: workout.name, 
                    exercises: workout.exercises || [] 
                  });
                  setShowModal(true);
                }}
                className="mt-4 w-full px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600 text-sm"
              >
                + Adicionar Exercícios
              </button>
            </DashboardCard>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="w-full max-w-2xl my-8">
            <DashboardCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingId ? 'Editar Treino' : 'Adicionar Treino'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Dia da Semana</label>
                  <select
                    required
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                  >
                    <option value="">Selecione</option>
                    <option value="1">Segunda</option>
                    <option value="2">Terça</option>
                    <option value="3">Quarta</option>
                    <option value="4">Quinta</option>
                    <option value="5">Sexta</option>
                    <option value="6">Sábado</option>
                    <option value="7">Domingo</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Nome do Treino</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    placeholder="Ex: Treino A - Peito e Tríceps"
                  />
                </div>
              
              {/* Lista de exercícios */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-300">Exercícios</label>
                  <button
                    type="button"
                    onClick={() => {
                      const newEx = { name: '', sets: '', reps: '', rest: '', video: '', details: '' };
                      setFormData({ ...formData, exercises: [...formData.exercises, newEx] });
                    }}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    + Exercício
                  </button>
                </div>
                
                <div className="space-y-3">
                  {formData.exercises.map((ex: any, idx: number) => (
                    <div key={idx} className="p-3 bg-gray-800 rounded-lg space-y-2">
                      <div className="flex gap-2">
                        {ex.isCustom || (ex.name && !exerciseLibrary.find((lib: any) => lib.name === ex.name)) ? (
                          <input
                            type="text"
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              updated[idx].name = e.target.value;
                              updated[idx].isCustom = true;
                              setFormData({ ...formData, exercises: updated });
                            }}
                            placeholder="Digite o nome do exercício"
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          />
                        ) : (
                          <select
                            value={ex.name}
                            onChange={(e) => {
                              const updated = [...formData.exercises];
                              if (e.target.value === '__custom__') {
                                updated[idx].isCustom = true;
                                updated[idx].name = '';
                              } else {
                                updated[idx].name = e.target.value;
                              }
                              setFormData({ ...formData, exercises: updated });
                            }}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                          >
                            <option value="">Selecione o exercício</option>
                            {exerciseLibrary.map((lib: any) => (
                              <option key={lib.id} value={lib.name}>{lib.name}</option>
                            ))}
                            <option value="__custom__">➕ Outro (digitar)</option>
                          </select>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.exercises.filter((_: any, i: number) => i !== idx);
                            setFormData({ ...formData, exercises: updated });
                          }}
                          className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                        >
                          🗑️
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <input
                          type="text"
                          placeholder="Séries"
                          value={ex.sets}
                          onChange={(e) => {
                            const updated = [...formData.exercises];
                            updated[idx].sets = e.target.value;
                            setFormData({ ...formData, exercises: updated });
                          }}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Reps"
                          value={ex.reps}
                          onChange={(e) => {
                            const updated = [...formData.exercises];
                            updated[idx].reps = e.target.value;
                            setFormData({ ...formData, exercises: updated });
                          }}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        />
                        <input
                          type="text"
                          placeholder="Descanso (s)"
                          value={ex.rest}
                          onChange={(e) => {
                            const updated = [...formData.exercises];
                            updated[idx].rest = e.target.value;
                            setFormData({ ...formData, exercises: updated });
                          }}
                          className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                        />
                      </div>
                      <select
                        value={ex.video || ''}
                        onChange={(e) => {
                          const updated = [...formData.exercises];
                          updated[idx].video = e.target.value;
                          setFormData({ ...formData, exercises: updated });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      >
                        <option value="">Vídeo (opcional)</option>
                        {videos.map((v: any, i: number) => (
                          <option key={v.id || i} value={v.url}>{v.title}</option>
                        ))}
                      </select>
                      <input
                        type="text"
                        placeholder="Detalhes (ex: 2x14, 2x15 ou 1x15, 3x14)"
                        value={ex.details || ''}
                        onChange={(e) => {
                          const updated = [...formData.exercises];
                          updated[idx].details = e.target.value;
                          setFormData({ ...formData, exercises: updated });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                      <input
                        type="text"
                        placeholder="Observação (ex: Pegada aberta, descer até 90°)"
                        value={ex.notes || ''}
                        onChange={(e) => {
                          const updated = [...formData.exercises];
                          updated[idx].notes = e.target.value;
                          setFormData({ ...formData, exercises: updated });
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingId(null);
                    setFormData({ dayOfWeek: '', name: '', exercises: [] });
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Salvar
                </button>
              </div>
            </form>
          </DashboardCard>
          </div>
        </div>
      )}

      {showAddExercise && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <DashboardCard className="w-full max-w-md p-6">
            <h3 className="text-xl font-bold text-white mb-4">Adicionar Exercício na Biblioteca</h3>
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="Nome do exercício"
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={addNewExercise}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Adicionar
              </button>
              <button
                onClick={() => {
                  setShowAddExercise(false);
                  setNewExerciseName('');
                }}
                className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
              >
                Cancelar
              </button>
            </div>
          </DashboardCard>
        </div>
      )}
    </div>
  );
}

// Tab de Dieta
function DietaTab({ studentId }: { studentId: string }) {
  const [diet, setDiet] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDiet();
  }, []);

  const loadDiet = async () => {
    const res = await fetch(`/api/meals?studentId=${studentId}`);
    const data = await res.json();
    setDiet(data.diet || '');
    setLoading(false);
  };

  const handleSave = async () => {
    await fetch('/api/meals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, diet })
    });
    setEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Plano Alimentar</h2>
        <button 
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
        >
          {editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      <DashboardCard className="p-6">
        {editing ? (
          <textarea
            value={diet}
            onChange={(e) => setDiet(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Ex:&#10;08:00 - Café da Manhã&#10;- 3 ovos mexidos&#10;- 50g aveia&#10;- 1 banana&#10;&#10;12:00 - Almoço&#10;- 150g frango&#10;- 100g arroz&#10;- Salada"
            rows={15}
          />
        ) : diet ? (
          <pre className="text-gray-300 whitespace-pre-wrap">{diet}</pre>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🥗</div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhuma dieta criada</h3>
            <p className="text-gray-400">Clique em Editar para adicionar</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}

// Tab de Suplementos
function SuplementosTab({ studentId }: { studentId: string }) {
  const [supplements, setSupplements] = useState<string>('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSupplements();
  }, []);

  const loadSupplements = async () => {
    const res = await fetch(`/api/supplements?studentId=${studentId}`);
    const data = await res.json();
    setSupplements(data.supplements || '');
    setLoading(false);
  };

  const handleSave = async () => {
    await fetch('/api/supplements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId, supplements })
    });
    setEditing(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-white">Suplementação</h2>
        <button 
          onClick={() => editing ? handleSave() : setEditing(true)}
          className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
        >
          {editing ? 'Salvar' : 'Editar'}
        </button>
      </div>

      <DashboardCard className="p-6">
        {editing ? (
          <textarea
            value={supplements}
            onChange={(e) => setSupplements(e.target.value)}
            className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
            placeholder="Ex:&#10;- Whey Protein: 30g após treino&#10;- Creatina: 5g por dia&#10;- Multivitamínico: 1 cápsula pela manhã"
            rows={10}
          />
        ) : supplements ? (
          <pre className="text-gray-300 whitespace-pre-wrap">{supplements}</pre>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💊</div>
            <h3 className="text-xl font-bold text-white mb-2">Nenhum suplemento adicionado</h3>
            <p className="text-gray-400">Clique em Editar para adicionar</p>
          </div>
        )}
      </DashboardCard>
    </div>
  );
}
