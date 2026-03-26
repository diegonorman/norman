// Teste direto no NocoDB
const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';
const TABLE_ID = 'm3pehyuo16yte7j';

async function testarToggle() {
  const testData = {
    student_id: 1,
    workout_id: 1,
    exercise_id: 0,
    completed: true,
    date: '2026-03-11'
  };
  
  console.log('🔵 TESTE 1: Marcar exercício');
  console.log('Dados:', testData);
  
  // Buscar existente
  const where = `(student_id,eq,${testData.student_id})~and(workout_id,eq,${testData.workout_id})~and(exercise_id,eq,${testData.exercise_id})~and(date,eq,${testData.date})`;
  
  const existingRes = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where}`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const existing = await existingRes.json();
  console.log('📊 Existentes:', existing.list?.length || 0);
  
  if (existing.list?.length > 0) {
    console.log('🗑️ Deletando existentes...');
    for (const log of existing.list) {
      await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
        body: JSON.stringify([{ Id: log.Id }]),
      });
    }
    console.log('✅ Deletado!');
  }
  
  console.log('💾 Salvando novo...');
  const saveRes = await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
    body: JSON.stringify(testData),
  });
  
  const saved = await saveRes.json();
  console.log('✅ Salvo:', saved);
  
  console.log('\n🔵 TESTE 2: Buscar de volta');
  const checkRes = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where}`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const check = await checkRes.json();
  console.log('📊 Encontrados:', check.list?.length || 0);
  console.log('Dados:', check.list);
}

testarToggle().catch(console.error);
