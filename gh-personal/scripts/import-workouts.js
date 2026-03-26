const axios = require('axios');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const API_TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const headers = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json'
};

const WORKOUT_DATA = {
  "1": {
    "name": "DIA 1 - QUADRÍCEPS",
    "exercises": [
      { "name": "MOBILIDADE TORNOZELO", "sets": "2", "reps": "15", "rest": "15", "details": "", "notes": "" },
      { "name": "CADEIRA ABDUTORA", "sets": "4", "reps": "8-12", "rest": "60", "details": "", "notes": "1 seg isometria. Progressão de carga." },
      { "name": "ELEVAÇÃO PÉLVICA", "sets": "4", "reps": "8-12", "rest": "60", "details": "", "notes": "1 seg isometria. Progressão de carga." },
      { "name": "AGACHAMENTO SMITH", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x4-6, 4x6-10", "notes": "Progressão de carga." },
      { "name": "AGACHAMENTO HACK", "sets": "5", "reps": "6", "rest": "90", "details": "", "notes": "Progressão de carga." },
      { "name": "LEG PRESS", "sets": "4", "reps": "8-12", "rest": "90", "details": "", "notes": "Progressão de carga. Muito peso." },
      { "name": "CADEIRA EXTENSORA (DROP)", "sets": "4", "reps": "", "rest": "90", "details": "4x6+6+6", "notes": "DROP SET: Faça 6 reps até falhar → SEM PAUSA reduza 30% do peso e faça mais 6 → SEM PAUSA reduza mais 30% e faça mais 6. Total: 18 reps sem pausa por série." }
    ]
  },
  "2": {
    "name": "DIA 2 - PEITO E OMBRO",
    "exercises": [
      { "name": "ALONGAMENTO PEITORAL MENOR", "sets": "1", "reps": "20 seg", "rest": "", "details": "", "notes": "" },
      { "name": "ABDOMINAL NO BANCO DECLINADO", "sets": "4", "reps": "15", "rest": "60", "details": "", "notes": "Progressão de carga." },
      { "name": "ABDOMINAL ELEVAÇÃO DE PERNAS NO BANCO RETO", "sets": "4", "reps": "15", "rest": "60", "details": "", "notes": "Com halter no meio dos pés." },
      { "name": "CRUCIFIXO INCLINADO + SUPINO INCLINADO COM HALTERES", "sets": "4", "reps": "", "rest": "90", "details": "4x8-12+8-12", "notes": "Progressão de carga. Mesmo peso pro bi-set." },
      { "name": "CRUCIFIXO INCLINADO NO CROSS", "sets": "4", "reps": "10", "rest": "60", "details": "", "notes": "1 seg isometria. Progressão de carga." },
      { "name": "SUPINO INCLINADO ARTICULADO OU NA MÁQUINA", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x6-8, 2x8-12", "notes": "Progressão de carga." },
      { "name": "VOADOR", "sets": "4", "reps": "6-10", "rest": "60", "details": "", "notes": "Progressão de carga." },
      { "name": "CROSSOVER", "sets": "4", "reps": "6-10", "rest": "60", "details": "", "notes": "Progressão de carga." },
      { "name": "ELEVAÇÃO LATERAL EM PÉ", "sets": "4", "reps": "12-15", "rest": "60", "details": "", "notes": "Progressão de carga." }
    ]
  },
  "3": {
    "name": "DIA 3 - COSTAS E BÍCEPS",
    "exercises": [
      { "name": "ALONGAMENTO ESCÁPULA/OMBRO", "sets": "2", "reps": "15", "rest": "15", "details": "", "notes": "" },
      { "name": "REMADA LIVRE PRONADA", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x4-6, 4x6-10", "notes": "Progressão de carga." },
      { "name": "REMADA TRIÂNGULO MÁQUINA", "sets": "4", "reps": "10-15", "rest": "90", "details": "", "notes": "Progressão de carga." },
      { "name": "PUXADA ALTA SUPINADA", "sets": "4", "reps": "8-12", "rest": "90", "details": "", "notes": "Após falhar + 5 repetições roubadas, pode balançar." },
      { "name": "REMADA ABERTA PRONADA MÁQUINA", "sets": "4", "reps": "8-12", "rest": "90", "details": "", "notes": "1 seg isometria. Progressão de carga." },
      { "name": "MEIO TERRA", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x4-6, 4x6-10", "notes": "Progressão de carga." },
      { "name": "CRUCIFIXO INVERTIDO NO VOADOR", "sets": "4", "reps": "15", "rest": "90", "details": "", "notes": "Cotovelos altos - altura do ombro. Progressão de carga." },
      { "name": "ROSCA DIRETA NO CROSS", "sets": "", "reps": "", "rest": "90", "details": "4x15-20, 10-15, 8-12, 6-10", "notes": "Na última série + 2 drops. Progressão de carga." },
      { "name": "ROSCA DIRETA NA PUXADA ALTA (POLIA ALTA)", "sets": "4", "reps": "8-12", "rest": "90", "details": "", "notes": "1 seg isometria. Progressão de carga." }
    ]
  },
  "4": {
    "name": "DIA 4 - POSTERIOR",
    "exercises": [
      { "name": "ALONGAMENTO GLÚTEO", "sets": "2", "reps": "30 seg", "rest": "15", "details": "", "notes": "" },
      { "name": "ALONGAMENTO POSTERIOR", "sets": "2", "reps": "15 seg", "rest": "15", "details": "", "notes": "" },
      { "name": "MESA FLEXORA", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x4-6, 4x6-10", "notes": "Tronco levantado. Progressão de carga." },
      { "name": "STIFF COM BARRA", "sets": "4", "reps": "8-12", "rest": "60", "details": "", "notes": "Calcanhar para dentro. Progressão de carga." },
      { "name": "FLEXOR DEITADO COM HALTER NO BANCO DECLINADO", "sets": "3", "reps": "12-15", "rest": "60", "details": "", "notes": "3 seg isometria. Progressão de carga." },
      { "name": "CADEIRA ADUTORA", "sets": "4", "reps": "8-12", "rest": "60", "details": "", "notes": "1 seg isometria. Progressão de carga." },
      { "name": "CADEIRA FLEXORA", "sets": "4", "reps": "8-12", "rest": "60", "details": "", "notes": "Calcanhar para dentro. Progressão de carga." },
      { "name": "TERRA SUMÔ", "sets": "5", "reps": "6", "rest": "90", "details": "", "notes": "Progressão de carga. 1 seg isometria." },
      { "name": "ELEVAÇÃO PÉLVICA", "sets": "4", "reps": "6-10", "rest": "60", "details": "", "notes": "3 seg isometria. Progressão de carga." }
    ]
  },
  "5": {
    "name": "DIA 5 - OMBRO E TRÍCEPS",
    "exercises": [
      { "name": "PANTURRILHA EM PÉ", "sets": "3", "reps": "15-20", "rest": "60", "details": "", "notes": "Máxima amplitude. Progressão de carga." },
      { "name": "PANTURRILHA SENTADO", "sets": "3", "reps": "15-20", "rest": "60", "details": "", "notes": "Máxima amplitude. Progressão de carga." },
      { "name": "ALONGAMENTO ESCÁPULA/OMBRO", "sets": "2", "reps": "15", "rest": "15", "details": "", "notes": "" },
      { "name": "DESENVOLVIMENTO COM HALTERES", "sets": "", "reps": "", "rest": "90", "details": "1x12-15, 2x6-8, 2x8-12", "notes": "Progressão de carga." },
      { "name": "ELEVAÇÃO LATERAL PARCIAL NA POLIA", "sets": "4", "reps": "6-10", "rest": "60", "details": "", "notes": "Progressão de carga." },
      { "name": "ELEVAÇÃO LATERAL EM PÉ (DROP)", "sets": "4", "reps": "", "rest": "60", "details": "4x12+12+12", "notes": "DROP SET: 12 reps → reduza 30% → 12 reps → reduza 30% → 12 reps. Total: 36 reps sem pausa." },
      { "name": "ELEVAÇÃO LATERAL NO BANCO INCLINADO", "sets": "4", "reps": "15", "rest": "90", "details": "", "notes": "Banco 45º, descer até o ombro, subir até passar da altura da cabeça." },
      { "name": "CRUCIFIXO INVERTIDO EM PÉ COM HALTERES", "sets": "4", "reps": "", "rest": "60", "details": "4x12+12+12", "notes": "DROP SET: 12 reps → reduza 30% → 12 reps → reduza 30% → 12 reps." },
      { "name": "ELEVAÇÃO FRONTAL COM BARRA W", "sets": "4", "reps": "", "rest": "60", "details": "4x12+12+12", "notes": "DROP SET: 12 reps → reduza 30% → 12 reps → reduza 30% → 12 reps." },
      { "name": "TRÍCEPS TESTA COM BARRA NA POLIA", "sets": "", "reps": "", "rest": "60", "details": "1x12-15, 2x6-8, 2x8-12", "notes": "Progressão de carga. Pode fazer deitado ou sentado." },
      { "name": "TRÍCEPS BARRA", "sets": "4", "reps": "6-10", "rest": "60", "details": "", "notes": "Progressão de carga." },
      { "name": "TRÍCEPS FRANCÊS NO CROSS", "sets": "4", "reps": "12-15", "rest": "60", "details": "", "notes": "Progressão de carga." }
    ]
  }
};

async function importWorkouts() {
  try {
    const studentId = process.argv[2];
    
    if (!studentId) {
      console.error('❌ Uso: node scripts/import-workouts.js <STUDENT_ID>');
      return;
    }

    console.log(`📥 Importando treinos para aluno ID: ${studentId}`);

    // Buscar aluno
    const res = await axios.get(`${NOCODB_URL}/tables/mi1cvcmvz1j1761/records`, { headers });
    const student = res.data.list.find((u) => u.id == studentId);

    if (!student) {
      console.error('❌ Aluno não encontrado');
      return;
    }

    // Criar array de treinos
    const workouts = [];
    for (const [day, data] of Object.entries(WORKOUT_DATA)) {
      workouts.push({
        id: Date.now() + parseInt(day),
        dayOfWeek: day,
        name: data.name,
        exercises: data.exercises
      });
    }

    // Salvar no banco
    await axios.patch(
      `${NOCODB_URL}/tables/mi1cvcmvz1j1761/records`,
      [{
        Id: parseInt(studentId),
        workouts: JSON.stringify(workouts)
      }],
      { headers }
    );

    console.log('✅ Treinos importados com sucesso!');
    console.log(`📊 Total: ${workouts.length} dias de treino`);
    workouts.forEach(w => {
      console.log(`   ${w.name}: ${w.exercises.length} exercícios`);
    });

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

importWorkouts();
