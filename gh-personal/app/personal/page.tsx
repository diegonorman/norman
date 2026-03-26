'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import DashboardLayout from '@/components/DashboardLayout';
import DashboardCard from '@/components/DashboardCard';

export default function PersonalDashboard() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [stats, setStats] = useState({
    students: 0,
    workouts: 0,
    diets: 0,
    revenue: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'personal') {
      router.push('/login');
    } else {
      loadStats();
    }
  }, [user, router]);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      const students = data.students || [];
      
      let workoutCount = 0;
      let dietCount = 0;
      let totalRevenue = 0;
      
      students.forEach((student: any) => {
        if (student.workouts) {
          const workouts = JSON.parse(student.workouts);
          workoutCount += workouts.length;
        }
        if (student.meals) {
          dietCount++;
        }
        if (student.monthly_fee) {
          totalRevenue += parseFloat(student.monthly_fee);
        }
      });
      
      setStats({
        students: students.length,
        workouts: workoutCount,
        diets: dietCount,
        revenue: totalRevenue
      });
    } catch (error) {
      console.error('Erro ao carregar stats:', error);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout
      title="Painel Personal"
      subtitle={user.name}
      icon="💪"
      onLogout={logout}
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">🎓</div>
          <h3 className="text-gray-300 text-sm">Alunos Ativos</h3>
          <p className="text-3xl font-bold text-white">{stats.students}/10</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">💪</div>
          <h3 className="text-gray-300 text-sm">Treinos Criados</h3>
          <p className="text-3xl font-bold text-white">{stats.workouts}</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">🥗</div>
          <h3 className="text-gray-300 text-sm">Dietas Criadas</h3>
          <p className="text-3xl font-bold text-white">{stats.diets}</p>
        </DashboardCard>
        
        <DashboardCard className="p-6">
          <div className="text-3xl mb-2">💰</div>
          <h3 className="text-gray-300 text-sm">Receita Mensal</h3>
          <p className="text-3xl font-bold text-white">R$ {stats.revenue.toFixed(2)}</p>
        </DashboardCard>
      </div>

      {/* Menu de Ações */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <button onClick={() => router.push('/personal/students')}>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-bold text-white mb-2">Meus Alunos</h3>
            <p className="text-gray-300">Gerenciar treino, dieta e suplementos</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">💳</div>
            <h3 className="text-xl font-bold text-white mb-2">Mensalidades</h3>
            <p className="text-gray-300">Controlar pagamentos dos alunos</p>
          </DashboardCard>
        </button>

        <button onClick={() => router.push('/personal/reports')}>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-2">Relatórios</h3>
            <p className="text-gray-300">Ver estatísticas e progresso</p>
          </DashboardCard>
        </button>

        <button>
          <DashboardCard className="p-8 text-left">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-white mb-2">Configurações</h3>
            <p className="text-gray-300">Ajustes da conta</p>
          </DashboardCard>
        </button>
      </div>
    </DashboardLayout>
  );
}
