/**
 * Script para fazer match automático de vídeos com exercícios dos treinos
 * Executa: node scripts/match-videos.js <student_id>
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

async function getTableId(tableName) {
  const basesRes = await api.get('/meta/bases');
  const baseId = basesRes.data.list[0].id;
  const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
  const table = tablesRes.data.list.find(t => t.title === tableName);
  return table.id;
}

async function matchVideos(studentId) {
  try {
    console.log(`\n🔍 Buscando treinos do aluno ${studentId}...\n`);
    
    // Buscar aluno na tabela users
    const usersTableId = await getTableId('users');
    const userRes = await api.get(`/tables/${usersTableId}/records/${studentId}`);
    const student = userRes.data;
    
    if (!student.workouts) {
      console.log('❌ Nenhum treino encontrado para este aluno');
      return;
    }
    
    // Parse do JSON se for string
    const studentWorkouts = typeof student.workouts === 'string' 
      ? JSON.parse(student.workouts) 
      : student.workouts;
    
    if (studentWorkouts.length === 0) {
      console.log('❌ Nenhum treino encontrado para este aluno');
      return;
    }
    
    // Buscar todos os vídeos
    const videosTableId = await getTableId('videos');
    const videosRes = await api.get(`/tables/${videosTableId}/records`, {
      params: { limit: 500 }
    });
    const videos = videosRes.data.list;
    
    console.log(`📹 ${videos.length} vídeos disponíveis\n`);
    
    let totalMatches = 0;
    let totalExercises = 0;
    
    // Para cada treino
    for (const workout of studentWorkouts) {
      if (!workout.exercises || workout.exercises.length === 0) continue;
      
      console.log(`\n📋 Treino: ${workout.name}`);
      let workoutUpdated = false;
      
      // Para cada exercício
      for (let i = 0; i < workout.exercises.length; i++) {
        const exercise = workout.exercises[i];
        totalExercises++;
        
        // Se já tem vídeo, pula
        if (exercise.video) {
          console.log(`  ⏭️  ${exercise.name} - já tem vídeo`);
          continue;
        }
        
        // Buscar vídeo que faça match (prioriza match exato)
        const videoTitle = exercise.name.toLowerCase();
        
        // 1. Tenta match exato primeiro
        let match = videos.find(v => v.title.toLowerCase() === videoTitle);
        
        // 2. Se não achar, tenta match parcial
        if (!match) {
          match = videos.find(v => {
            const vTitle = v.title.toLowerCase();
            return vTitle.includes(videoTitle) || videoTitle.includes(vTitle);
          });
        }
        
        if (match) {
          workout.exercises[i].video = match.url;
          console.log(`  ✅ ${exercise.name} → ${match.title}`);
          totalMatches++;
          workoutUpdated = true;
        } else {
          console.log(`  ❌ ${exercise.name} - sem match`);
        }
      }
      
      // Atualizar treino se teve mudanças
      if (workoutUpdated) {
        await api.patch(`/tables/${usersTableId}/records`, [{
          id: studentId,
          workouts: JSON.stringify(studentWorkouts)
        }]);
      }
    }
    
    console.log(`\n\n📊 RESUMO:`);
    console.log(`   Total de exercícios: ${totalExercises}`);
    console.log(`   Vídeos adicionados: ${totalMatches}`);
    console.log(`   Sem match: ${totalExercises - totalMatches}`);
    console.log(`\n✅ Processo concluído!\n`);
    
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

// Pegar student_id da linha de comando
const studentId = process.argv[2];

if (!studentId) {
  console.log('❌ Uso: node scripts/match-videos.js <student_id>');
  console.log('   Exemplo: node scripts/match-videos.js 1');
  process.exit(1);
}

matchVideos(studentId);
