import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import VideoLibrary from '@/components/VideoLibrary';
import { getTableData } from '@/lib/nocodb';

export const dynamic = 'force-dynamic';

export default async function PersonalVideosPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    redirect('/login');
  }

  let videos: any = {};
  let totalVideos = 0;
  
  try {
    const data = await getTableData('videos', {
      sort: 'category,title',
      limit: 200
    });

    const localVideos = data.list.filter((v: any) => 
      v.url && v.url.startsWith('/videos/')
    );

    localVideos.forEach((video: any) => {
      const category = video.category || 'Outros';
      if (!videos[category]) {
        videos[category] = [];
      }
      videos[category].push({
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

    totalVideos = localVideos.length;
  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">📚 Biblioteca de Exercícios</h1>
          <p className="text-gray-600">
            {totalVideos} vídeos para adicionar aos treinos dos alunos
          </p>
        </div>

        {totalVideos > 0 ? (
          <VideoLibrary videos={videos} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-2">Nenhum vídeo encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}
