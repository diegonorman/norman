'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import { ArrowLeft } from 'lucide-react';
import VideoLibrary from '@/components/VideoLibrary';
import VideoUpload from '@/components/VideoUpload';

export default function AdminVideosPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [videos, setVideos] = useState<any>({});
  const [totalVideos, setTotalVideos] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadVideos();
  }, [user, router]);

  const loadVideos = async () => {
    try {
      const res = await fetch('/api/admin/videos');
      const data = await res.json();
      
      const grouped: any = {};
      data.videos
        .filter((v: any) => v.url && v.url.startsWith('/videos/'))
        .forEach((video: any) => {
          const category = video.category || 'Outros';
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push({
            id: video.Id,
            name: video.title,
            file: video.url.split('/').pop(),
            path: video.url,
            category: video.category,
            thumbnail: video.thumbnail || null,
            description: video.description || '',
            duration: video.duration || null
          });
        });
      
      setVideos(grouped);
      setTotalVideos(data.videos.length);
    } catch (error) {
      console.error('Erro ao carregar vídeos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900 shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/admin')}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎥</div>
              <div>
                <h1 className="text-2xl font-bold text-white">Biblioteca de Vídeos</h1>
                <p className="text-sm text-gray-300">{totalVideos} vídeos disponíveis</p>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Sair
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Carregando...</div>
        ) : (
          <>
            <div className="mb-8">
              <VideoUpload />
            </div>

            {totalVideos > 0 ? (
              <VideoLibrary videos={videos} />
            ) : (
              <div className="text-center py-12 bg-gray-900 rounded-xl">
                <p className="text-gray-400 text-lg">Nenhum vídeo encontrado</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
