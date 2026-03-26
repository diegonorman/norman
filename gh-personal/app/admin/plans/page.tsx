'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';

interface Plan {
  id: string;
  name: string;
  price: number;
  max_students: number;
  features: string;
  active: boolean;
}

export default function PlansPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    max_students: '',
    features: '',
    active: true
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadPlans();
  }, [user, router]);

  const loadPlans = async () => {
    try {
      const res = await fetch('/api/plans');
      const data = await res.json();
      setPlans(data.plans || []);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingPlan ? 'PUT' : 'POST';
      const url = editingPlan ? `/api/plans/${editingPlan.id}` : '/api/plans';
      
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          max_students: parseInt(formData.max_students)
        })
      });
      
      setShowModal(false);
      setEditingPlan(null);
      setFormData({ name: '', price: '', max_students: '', features: '', active: true });
      loadPlans();
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      price: plan.price.toString(),
      max_students: plan.max_students.toString(),
      features: plan.features,
      active: plan.active
    });
    setShowModal(true);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      <header className="bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/admin')} className="text-2xl text-white">←</button>
            <h1 className="text-2xl font-bold text-white">Gerenciar Planos</h1>
          </div>
          <button
            onClick={() => {
              setEditingPlan(null);
              setFormData({ name: '', price: '', max_students: '', features: '', active: true });
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            + Novo Plano
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-white">Carregando...</div>
        ) : plans.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <div className="text-6xl mb-4">📊</div>
            <p>Nenhum plano cadastrado</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-2xl font-bold text-white">{plan.name}</h3>
                  {plan.active ? (
                    <span className="px-2 py-1 bg-green-900 text-green-200 rounded text-xs">Ativo</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-900 text-red-200 rounded text-xs">Inativo</span>
                  )}
                </div>
                
                <div className="mb-4">
                  <div className="text-4xl font-bold text-white mb-2">
                    R$ {plan.price}
                    <span className="text-lg text-gray-400">/mês</span>
                  </div>
                  <div className="text-gray-300">
                    Até {plan.max_students} alunos
                  </div>
                </div>

                <div className="mb-6 text-gray-300 text-sm whitespace-pre-line">
                  {plan.features}
                </div>

                <button
                  onClick={() => handleEdit(plan)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Editar Plano
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingPlan ? 'Editar Plano' : 'Novo Plano'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Nome do plano"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                required
              />
              <input
                type="number"
                step="0.01"
                placeholder="Preço mensal (R$)"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                required
              />
              <input
                type="number"
                placeholder="Máximo de alunos"
                value={formData.max_students}
                onChange={(e) => setFormData({ ...formData, max_students: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg"
                required
              />
              <textarea
                placeholder="Recursos (um por linha)"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg h-32"
                required
              />
              <label className="flex items-center gap-2 text-white">
                <input
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4"
                />
                Plano ativo
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingPlan(null);
                  }}
                  className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingPlan ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
