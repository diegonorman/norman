import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import VideoLibrary from '@/components/VideoLibrary';
import { getTableData } from '@/lib/nocodb';

export const dynamic = 'force-dynamic';

export default async function StudentVideosPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  const user = session ? JSON.parse(session.value) : null;
  
  if (!user || user.role !== 'student') {
    redirect('/login');
  }

  let videos: any = {};
  let totalVideos = 0;
  
  try {
    // Buscar treinos do aluno
    const workouts = await getTableData('workouts', {
      where: `student_id,eq,${user.id}`,
      limit: 100
    });

    // Extrair IDs dos vídeos dos exercícios
    const videoIds = new Set<string>();
    workouts.list.forEach((workout: any) => {
      if (workout.exercises) {
        const exercises = JSON.parse(workout.exercises);
        exercises.forEach((ex: any) => {
          if (ex.video_id) {
            videoIds.add(ex.video_id);
          }
        });
      }
    });

    // Buscar apenas os vídeos que estão nos treinos do aluno
    if (videoIds.size > 0) {
      const allVideos = await getTableData('videos', {
        limit: 200
      });

      const studentVideos = allVideos.list.filter((v: any) => 
        videoIds.has(v.Id) && v.url && v.url.startsWith('/videos/')
      );

      studentVideos.forEach((video: any) => {
        const category = video.category || 'Meus Exercícios';
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

      totalVideos = studentVideos.length;
    }
  } catch (error) {
    console.error('Erro ao carregar vídeos:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">🎥 Meus Exercícios</h1>
          <p className="text-gray-600">
            {totalVideos} vídeos do seu treino personalizado
          </p>
        </div>

        {totalVideos > 0 ? (
          <VideoLibrary videos={videos} />
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 text-lg mb-2">Nenhum exercício no seu treino</p>
            <p className="text-sm text-gray-400">Aguarde seu personal adicionar exercícios</p>
          </div>
        )}
      </div>
    </div>
  );
}
