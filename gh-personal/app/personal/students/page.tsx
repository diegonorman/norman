'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';

export default function PersonalStudents() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [students, setStudents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = editingStudent 
        ? { ...formData, id: editingStudent.id }
        : formData;

      const res = await fetch('/api/students', {
        method: editingStudent ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      console.log('Resposta:', data);

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao salvar aluno');
      }

      await loadStudents();
      setShowModal(false);
      setFormData({ name: '', email: '', phone: '', password: '' });
      setEditingStudent(null);
    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message || 'Erro ao salvar aluno');
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingStudent(null);
    setFormData({ name: '', email: '', phone: '', password: '' });
    setShowModal(true);
  };

  const openEditModal = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      phone: student.phone || '',
      password: ''
    });
    setShowModal(true);
  };

  const handleToggleActive = async (student: any) => {
    if (!confirm(`${student.active ? 'Desativar' : 'Ativar'} aluno ${student.name}?`)) return;

    try {
      const res = await fetch('/api/students', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: student.id, active: !student.active })
      });

      if (!res.ok) throw new Error('Erro ao atualizar');
      await loadStudents();
    } catch (error) {
      alert('Erro ao atualizar aluno');
    }
  };

  const handleDelete = async (student: any) => {
    if (!confirm(`Deletar aluno ${student.name}? Esta ação não pode ser desfeita!`)) return;

    try {
      const res = await fetch(`/api/students?id=${student.id}`, {
        method: 'DELETE'
      });

      if (!res.ok) throw new Error('Erro ao deletar');
      await loadStudents();
    } catch (error) {
      alert('Erro ao deletar aluno');
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      title="Meus Alunos"
      subtitle={user.name}
      icon="🎓"
      onLogout={logout}
      showBackButton
      backUrl="/personal"
    >
      {/* Botão Adicionar Aluno */}
      <div className="mb-6">
        <button 
          onClick={openAddModal}
          className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
        >
          + Adicionar Aluno
        </button>
      </div>

      {/* Lista de Alunos */}
      {loading ? (
        <DashboardCard className="p-12 text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-400">Carregando...</p>
        </DashboardCard>
      ) : students.length === 0 ? (
        <DashboardCard className="p-12 text-center">
          <div className="text-6xl mb-4">🎓</div>
          <h3 className="text-xl font-bold text-white mb-2">Nenhum aluno cadastrado</h3>
          <p className="text-gray-400">Adicione seu primeiro aluno para começar</p>
        </DashboardCard>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {students.map((student: any) => (
            <DashboardCard key={student.id} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-2xl">
                  👤
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-white">{student.name}</h3>
                  <p className="text-sm text-gray-400">{student.email}</p>
                  <span className={`text-xs px-2 py-1 rounded ${student.active ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {student.active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => router.push(`/personal/students/${student.id}`)}
                  className="flex-1 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  Gerenciar
                </button>
                <button
                  onClick={() => openEditModal(student)}
                  className="px-3 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 text-sm"
                  title="Editar"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleToggleActive(student)}
                  className={`px-3 py-2 rounded-lg text-sm ${student.active ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-green-500 hover:bg-green-600'} text-white`}
                  title={student.active ? 'Desativar' : 'Ativar'}
                >
                  {student.active ? '⏸️' : '▶️'}
                </button>
                <button
                  onClick={() => handleDelete(student)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
                  title="Deletar"
                >
                  🗑️
                </button>
              </div>
            </DashboardCard>
          ))}
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <DashboardCard className="w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingStudent ? 'Editar Aluno' : 'Adicionar Aluno'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="João Silva"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="joao@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                  placeholder="(11) 99999-9999"
                />
              </div>

              {!editingStudent && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Senha *
                  </label>
                  <input
                    type="password"
                    required={!editingStudent}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingStudent(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  {editingStudent ? 'Salvar' : 'Adicionar'}
                </button>
              </div>
            </form>
          </DashboardCard>
        </div>
      )}
    </DashboardLayout>
  );
}
