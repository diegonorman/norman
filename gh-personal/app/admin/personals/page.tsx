'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft, Trash2, Edit2, Key } from 'lucide-react';

interface Personal {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  created_at: string;
}

interface Plan {
  id: string;
  name: string;
  max_students: number;
  price: number;
}

export default function PersonalsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [personals, setPersonals] = useState<Personal[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedPersonal, setSelectedPersonal] = useState<Personal | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    plan_id: ''
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, router]);

  const loadData = async () => {
    try {
      const [personalsRes, plansRes] = await Promise.all([
        fetch('/api/admin/personals'),
        fetch('/api/plans')
      ]);
      const personalsData = await personalsRes.json();
      const plansData = await plansRes.json();
      setPersonals(personalsData.personals || []);
      setPlans(plansData.plans || []);
    } catch (error) {
      console.error('Erro ao carregar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/admin/personals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', email: '', password: '', phone: '', plan_id: '' });
        await loadData();
        alert('Personal criado com sucesso!');
      } else {
        // Se o erro for de email duplicado, recarregar mesmo assim
        if (data.error?.includes('Duplicate') || data.error?.includes('duplicate') || data.error?.includes('exists')) {
          await loadData();
          setShowModal(false);
          setFormData({ name: '', email: '', password: '', phone: '', plan_id: '' });
          alert('Personal já existe ou foi criado com sucesso!');
        } else {
          alert(data.error || 'Erro ao criar personal');
        }
      }
    } catch (error) {
      console.error('Erro ao criar:', error);
      // Tentar recarregar mesmo com erro
      await loadData();
      alert('Erro ao criar personal, mas verifique se foi criado');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (id: string, name: string, currentStatus: boolean) => {
    const action = currentStatus ? 'desativar' : 'ativar';
    if (!confirm(`Deseja realmente ${action} ${name}?`)) return;
    
    try {
      const res = await fetch(`/api/admin/personals?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !currentStatus })
      });
      
      if (res.ok) {
        await loadData();
      } else {
        alert(`Erro ao ${action} personal`);
      }
    } catch (error) {
      console.error('Erro:', error);
      alert(`Erro ao ${action} personal`);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedPersonal || !newPassword) return;
    if (newPassword.length < 6) {
      alert('Senha deve ter no mínimo 6 caracteres');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/admin/personals/password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: selectedPersonal.id,
          new_password: newPassword 
        })
      });

      if (res.ok) {
        setShowPasswordModal(false);
        setNewPassword('');
        setSelectedPersonal(null);
        alert('Senha alterada com sucesso!');
      } else {
        alert('Erro ao alterar senha');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao alterar senha');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-3xl">👥</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gerenciar Personals</h1>
                <p className="text-sm text-gray-300">{personals.length} personals cadastrados</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Novo Personal
            </button>
            <button
              onClick={logout}
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Sair
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : personals.length === 0 ? (
          <div className="text-center py-12 bg-gray-900 rounded-xl">
            <div className="text-6xl mb-4">👥</div>
            <p className="text-gray-400">Nenhum personal cadastrado</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {personals.map((p) => (
              <div key={p.id} className="bg-gray-900 p-6 rounded-xl shadow-lg border border-gray-800 hover:border-gray-700 transition-all">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{p.name}</h3>
                    <p className="text-gray-300">{p.email}</p>
                    {p.phone && <p className="text-gray-500 text-sm mt-1">📱 {p.phone}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-sm ${p.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'}`}>
                      {p.active ? 'Ativo' : 'Inativo'}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPersonal(p);
                        setShowPasswordModal(true);
                      }}
                      className="p-2 hover:bg-blue-900 rounded-lg transition-colors"
                      title="Alterar senha"
                    >
                      <Key className="w-5 h-5 text-blue-400" />
                    </button>
                    <button
                      onClick={() => handleToggleActive(p.id, p.name, p.active)}
                      className={`p-2 rounded-lg transition-colors ${p.active ? 'hover:bg-red-900' : 'hover:bg-green-900'}`}
                      title={p.active ? 'Desativar' : 'Ativar'}
                    >
                      {p.active ? (
                        <Trash2 className="w-5 h-5 text-red-400" />
                      ) : (
                        <Edit2 className="w-5 h-5 text-green-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Criar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-6 text-white">Novo Personal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                required
              />
              <input
                type="password"
                placeholder="Senha"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                required
                minLength={6}
              />
              <input
                type="tel"
                placeholder="Telefone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
              />
              <select
                value={formData.plan_id}
                onChange={(e) => setFormData({ ...formData, plan_id: e.target.value })}
                className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                required
              >
                <option value="">Selecione o plano</option>
                {plans.map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - {plan.max_students} alunos - R$ {plan.price}
                  </option>
                ))}
              </select>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-800"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700"
                  disabled={submitting}
                >
                  {submitting ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Alterar Senha */}
      {showPasswordModal && selectedPersonal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-2 text-white">Alterar Senha</h2>
            <p className="text-gray-400 mb-6">{selectedPersonal.name}</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Nova Senha</label>
                <input
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-800 text-white border border-gray-700 rounded-lg"
                  minLength={6}
                  autoFocus
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedPersonal(null);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-700 text-white rounded-lg hover:bg-gray-800"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700"
                  disabled={submitting || !newPassword || newPassword.length < 6}
                >
                  {submitting ? 'Alterando...' : 'Alterar Senha'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
