'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, loading, logout } = useAuthStore();

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <DashboardLayout
      title="Painel Admin"
      subtitle={user.name}
      icon="👑"
      onLogout={logout}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">👥</div>
          <h3 className="text-gray-300 text-sm">Personals Ativos</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">🎓</div>
          <h3 className="text-gray-300 text-sm">Total de Alunos</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-gray-300 text-sm">Receita Mensal</h3>
          <p className="text-3xl font-bold text-white">R$ 0</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">🎥</div>
          <h3 className="text-gray-300 text-sm">Vídeos Cadastrados</h3>
          <p className="text-3xl font-bold text-white">0</p>
        </DashboardCard>
      </div>

      {/* Menu de Ações */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button onClick={() => router.push('/admin/personals')}>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">👥</div>
            <h3 className="text-xl font-bold text-white mb-2">Gerenciar Personals</h3>
            <p className="text-gray-300">Adicionar, editar e gerenciar personals trainers</p>
          </DashboardCard>
        </button>

        <button onClick={() => router.push('/admin/videos')}>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-bold text-white mb-2">Biblioteca de Vídeos</h3>
            <p className="text-gray-300">Gerenciar vídeos de exercícios</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">Mensalidades</h3>
            <p className="text-gray-300">Controlar pagamentos dos personals</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Planos</h3>
            <p className="text-gray-300">Gerenciar planos e preços</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">📈</div>
            <h3 className="text-xl font-bold text-white mb-2">Relatórios</h3>
            <p className="text-gray-300">Visualizar estatísticas e relatórios</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-white mb-2">Configurações</h3>
            <p className="text-gray-300">Configurações do sistema</p>
          </DashboardCard>
        </button>
      </div>
    </DashboardLayout>
  );
}
