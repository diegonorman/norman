// Teste DESMARCAR
const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';
const TABLE_ID = 'm3pehyuo16yte7j';

async function testarDesmarcar() {
  const testData = {
    student_id: 1,
    workout_id: 1,
    exercise_id: 0,
    date: '2026-03-11'
  };
  
  console.log('🔵 TESTE: Desmarcar exercício');
  
  const where = `(student_id,eq,${testData.student_id})~and(workout_id,eq,${testData.workout_id})~and(exercise_id,eq,${testData.exercise_id})~and(date,eq,${testData.date})`;
  
  const existingRes = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where}`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const existing = await existingRes.json();
  console.log('📊 Existentes:', existing.list?.length || 0);
  
  if (existing.list?.length > 0) {
    console.log('🗑️ Deletando...');
    for (const log of existing.list) {
      const delRes = await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
        body: JSON.stringify([{ id: log.id }]),
      });
      console.log('Resposta:', await delRes.text());
    }
    console.log('✅ Deletado!');
  }
  
  console.log('\n🔵 Verificar se foi deletado:');
  const checkRes = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where}`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const check = await checkRes.json();
  console.log('📊 Encontrados:', check.list?.length || 0);
}

testarDesmarcar().catch(console.error);
