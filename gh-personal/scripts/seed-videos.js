/**
 * Script para popular biblioteca de vídeos
 * Executa: node scripts/seed-videos.js
 */

const axios = require('axios');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const api = axios.create({
  baseURL: NOCODB_URL,
  headers: {
    'xc-token': TOKEN,
    'Content-Type': 'application/json'
  }
});

// Lista de vídeos para cadastrar
const VIDEOS = [
  // PEITO
  { title: 'Supino Reto', url: 'https://youtube.com/shorts/ZSLSanHSuf0', category: 'Peito', muscle_group: 'Peitoral', difficulty: 'intermediate' },
  { title: 'Supino Inclinado', url: 'https://youtube.com/shorts/exemplo', category: 'Peito', muscle_group: 'Peitoral Superior', difficulty: 'intermediate' },
  { title: 'Crucifixo', url: 'https://youtube.com/shorts/exemplo', category: 'Peito', muscle_group: 'Peitoral', difficulty: 'beginner' },
  { title: 'Flexão de Braço', url: 'https://youtube.com/shorts/exemplo', category: 'Peito', muscle_group: 'Peitoral', difficulty: 'beginner' },
  
  // COSTAS
  { title: 'Puxada Frontal', url: 'https://youtube.com/shorts/exemplo', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'intermediate' },
  { title: 'Remada Curvada', url: 'https://youtube.com/shorts/exemplo', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'intermediate' },
  { title: 'Remada Cavalinho', url: 'https://youtube.com/shorts/exemplo', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'beginner' },
  { title: 'Pullover', url: 'https://youtube.com/shorts/exemplo', category: 'Costas', muscle_group: 'Dorsal', difficulty: 'intermediate' },
  
  // PERNAS
  { title: 'Agachamento Livre', url: 'https://youtube.com/shorts/Zw8kGqE5pZv', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'advanced' },
  { title: 'Leg Press', url: 'https://youtube.com/shorts/d1W2YnVMtJs', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'intermediate' },
  { title: 'Cadeira Extensora', url: 'https://youtube.com/shorts/exemplo', category: 'Pernas', muscle_group: 'Quadríceps', difficulty: 'beginner' },
  { title: 'Cadeira Flexora', url: 'https://youtube.com/shorts/exemplo', category: 'Pernas', muscle_group: 'Posterior', difficulty: 'beginner' },
  { title: 'Stiff', url: 'https://youtube.com/shorts/exemplo', category: 'Pernas', muscle_group: 'Posterior', difficulty: 'intermediate' },
  { title: 'Elevação Pélvica', url: 'https://youtube.com/shorts/vc88T3fi30w', category: 'Pernas', muscle_group: 'Glúteos', difficulty: 'beginner' },
  { title: 'Panturrilha em Pé', url: 'https://youtube.com/shorts/exemplo', category: 'Pernas', muscle_group: 'Panturrilha', difficulty: 'beginner' },
  
  // OMBROS
  { title: 'Desenvolvimento com Barra', url: 'https://youtube.com/shorts/exemplo', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'intermediate' },
  { title: 'Elevação Lateral', url: 'https://youtube.com/shorts/exemplo', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'beginner' },
  { title: 'Elevação Frontal', url: 'https://youtube.com/shorts/exemplo', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'beginner' },
  { title: 'Remada Alta', url: 'https://youtube.com/shorts/exemplo', category: 'Ombros', muscle_group: 'Deltoides', difficulty: 'intermediate' },
  
  // BÍCEPS
  { title: 'Rosca Direta', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'beginner' },
  { title: 'Rosca Alternada', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'beginner' },
  { title: 'Rosca Martelo', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'beginner' },
  { title: 'Rosca Scott', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Bíceps', difficulty: 'intermediate' },
  
  // TRÍCEPS
  { title: 'Tríceps Testa', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'intermediate' },
  { title: 'Tríceps Corda', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'beginner' },
  { title: 'Tríceps Francês', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'intermediate' },
  { title: 'Mergulho', url: 'https://youtube.com/shorts/exemplo', category: 'Braços', muscle_group: 'Tríceps', difficulty: 'advanced' },
  
  // ABDÔMEN
  { title: 'Abdominal Supra', url: 'https://youtube.com/shorts/exemplo', category: 'Abdômen', muscle_group: 'Reto Abdominal', difficulty: 'beginner' },
  { title: 'Prancha', url: 'https://youtube.com/shorts/exemplo', category: 'Abdômen', muscle_group: 'Core', difficulty: 'beginner' },
  { title: 'Abdominal Bicicleta', url: 'https://youtube.com/shorts/exemplo', category: 'Abdômen', muscle_group: 'Oblíquos', difficulty: 'intermediate' },
  { title: 'Elevação de Pernas', url: 'https://youtube.com/shorts/exemplo', category: 'Abdômen', muscle_group: 'Reto Abdominal', difficulty: 'intermediate' }
];

async function seedVideos() {
  try {
    console.log('🎥 Populando biblioteca de vídeos...\n');

    // Buscar ID da tabela
    const basesRes = await api.get('/meta/bases');
    const baseId = basesRes.data.list[0].id;
    const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
    const videoTable = tablesRes.data.list.find(t => t.title === 'video_library');

    if (!videoTable) {
      console.error('❌ Tabela video_library não encontrada');
      return;
    }

    let created = 0;
    let skipped = 0;

    for (const video of VIDEOS) {
      try {
        await api.post(`/tables/${videoTable.id}/records`, video);
        console.log(`  ✅ ${video.title} (${video.category})`);
        created++;
      } catch (error) {
        console.log(`  ⚠️  ${video.title} (já existe ou erro)`);
        skipped++;
      }
    }

    console.log(`\n✨ Concluído!`);
    console.log(`   Criados: ${created}`);
    console.log(`   Ignorados: ${skipped}`);
    console.log(`   Total: ${VIDEOS.length} vídeos\n`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

seedVideos();
