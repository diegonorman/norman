const axios = require('axios');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const exercises = [
  // Peito
  { name: 'Supino Reto', muscle_group: 'Peito' },
  { name: 'Supino Inclinado', muscle_group: 'Peito' },
  { name: 'Supino Declinado', muscle_group: 'Peito' },
  { name: 'Crucifixo Reto', muscle_group: 'Peito' },
  { name: 'Crucifixo Inclinado', muscle_group: 'Peito' },
  { name: 'Crossover', muscle_group: 'Peito' },
  { name: 'Flexão', muscle_group: 'Peito' },
  
  // Costas
  { name: 'Puxada Frontal', muscle_group: 'Costas' },
  { name: 'Puxada Triângulo', muscle_group: 'Costas' },
  { name: 'Remada Curvada', muscle_group: 'Costas' },
  { name: 'Remada Cavalinho', muscle_group: 'Costas' },
  { name: 'Remada Unilateral', muscle_group: 'Costas' },
  { name: 'Levantamento Terra', muscle_group: 'Costas' },
  { name: 'Pullover', muscle_group: 'Costas' },
  { name: 'Barra Fixa', muscle_group: 'Costas' },
  
  // Pernas
  { name: 'Agachamento Livre', muscle_group: 'Pernas' },
  { name: 'Agachamento Smith', muscle_group: 'Pernas' },
  { name: 'Leg Press 45°', muscle_group: 'Pernas' },
  { name: 'Hack Machine', muscle_group: 'Pernas' },
  { name: 'Cadeira Extensora', muscle_group: 'Pernas' },
  { name: 'Cadeira Flexora', muscle_group: 'Pernas' },
  { name: 'Stiff', muscle_group: 'Pernas' },
  { name: 'Afundo', muscle_group: 'Pernas' },
  { name: 'Búlgaro', muscle_group: 'Pernas' },
  { name: 'Panturrilha em Pé', muscle_group: 'Pernas' },
  { name: 'Panturrilha Sentado', muscle_group: 'Pernas' },
  { name: 'Cadeira Abdutora', muscle_group: 'Pernas' },
  { name: 'Cadeira Adutora', muscle_group: 'Pernas' },
  
  // Ombros
  { name: 'Desenvolvimento Barra', muscle_group: 'Ombros' },
  { name: 'Desenvolvimento Halter', muscle_group: 'Ombros' },
  { name: 'Desenvolvimento Arnold', muscle_group: 'Ombros' },
  { name: 'Elevação Lateral', muscle_group: 'Ombros' },
  { name: 'Elevação Frontal', muscle_group: 'Ombros' },
  { name: 'Crucifixo Invertido', muscle_group: 'Ombros' },
  { name: 'Remada Alta', muscle_group: 'Ombros' },
  
  // Bíceps
  { name: 'Rosca Direta Barra', muscle_group: 'Bíceps' },
  { name: 'Rosca Direta Halter', muscle_group: 'Bíceps' },
  { name: 'Rosca Alternada', muscle_group: 'Bíceps' },
  { name: 'Rosca Martelo', muscle_group: 'Bíceps' },
  { name: 'Rosca Scott', muscle_group: 'Bíceps' },
  { name: 'Rosca Concentrada', muscle_group: 'Bíceps' },
  { name: 'Rosca 21', muscle_group: 'Bíceps' },
  
  // Tríceps
  { name: 'Tríceps Testa', muscle_group: 'Tríceps' },
  { name: 'Tríceps Corda', muscle_group: 'Tríceps' },
  { name: 'Tríceps Barra', muscle_group: 'Tríceps' },
  { name: 'Tríceps Francês', muscle_group: 'Tríceps' },
  { name: 'Tríceps Coice', muscle_group: 'Tríceps' },
  { name: 'Mergulho', muscle_group: 'Tríceps' },
  { name: 'Supino Fechado', muscle_group: 'Tríceps' },
  
  // Abdômen
  { name: 'Abdominal Supra', muscle_group: 'Abdômen' },
  { name: 'Abdominal Infra', muscle_group: 'Abdômen' },
  { name: 'Abdominal Oblíquo', muscle_group: 'Abdômen' },
  { name: 'Prancha', muscle_group: 'Abdômen' },
  { name: 'Abdominal Canivete', muscle_group: 'Abdômen' },
  { name: 'Elevação de Pernas', muscle_group: 'Abdômen' },
  
  // Antebraço
  { name: 'Rosca Punho', muscle_group: 'Antebraço' },
  { name: 'Rosca Inversa', muscle_group: 'Antebraço' },
  
  // Trapézio
  { name: 'Encolhimento Barra', muscle_group: 'Trapézio' },
  { name: 'Encolhimento Halter', muscle_group: 'Trapézio' },
  
  // Glúteos
  { name: 'Elevação Pélvica', muscle_group: 'Glúteos' },
  { name: 'Coice na Polia', muscle_group: 'Glúteos' },
  { name: 'Glúteo 4 Apoios', muscle_group: 'Glúteos' }
];

async function seedExercises() {
  try {
    const tablesRes = await axios.get(`${NOCODB_URL}/meta/bases`, {
      headers: { 'xc-token': TOKEN }
    });
    
    const baseId = tablesRes.data.list[0].id;
    const tablesListRes = await axios.get(`${NOCODB_URL}/meta/bases/${baseId}/tables`, {
      headers: { 'xc-token': TOKEN }
    });
    
    const exerciseTable = tablesListRes.data.list.find(t => t.title === 'exercise_library');
    if (!exerciseTable) {
      console.error('❌ Tabela exercise_library não encontrada');
      return;
    }
    
    for (const ex of exercises) {
      await axios.post(
        `${NOCODB_URL}/tables/${exerciseTable.id}/records`,
        ex,
        { headers: { 'xc-token': TOKEN } }
      );
      console.log(`✅ ${ex.name}`);
    }
    
    console.log('\n✅ Exercícios populados!');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

seedExercises();
