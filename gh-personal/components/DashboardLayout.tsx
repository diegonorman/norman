'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  icon?: string;
  onLogout: () => void;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function DashboardLayout({
  children,
  title,
  subtitle,
  icon = '💪',
  onLogout,
  showBackButton = false,
  backUrl = '/'
}: DashboardLayoutProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-black">
      {/* Header Padrão */}
      <header className="bg-gray-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {showBackButton && (
              <button
                onClick={() => router.push(backUrl)}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                title="Voltar"
              >
                <ArrowLeft className="w-6 h-6 text-white" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="text-3xl">{icon}</div>
              <div>
                <h1 className="text-2xl font-bold text-white">{title}</h1>
                {subtitle && <p className="text-sm text-gray-300">{subtitle}</p>}
              </div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
