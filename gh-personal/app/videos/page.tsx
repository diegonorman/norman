import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function VideosPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('session');
  
  if (!session) {
    redirect('/login');
  }

  const user = JSON.parse(session.value);

  // Redirecionar baseado no tipo de usuário
  if (user.role === 'admin') {
    redirect('/admin/videos');
  } else if (user.role === 'personal') {
    redirect('/personal/videos');
  } else if (user.role === 'student') {
    redirect('/student/videos');
  }

  return null;
}
