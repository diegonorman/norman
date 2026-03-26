// Testar MARCAR e DESMARCAR
const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';
const TABLE_ID = 'm3pehyuo16yte7j';

async function testarToggleCompleto() {
  const testData = {
    student_id: 1,
    workout_id: 1772729469162, // DIA 3
    exercise_id: 6, // ROSCA DIRETA NO CROSS
    date: '2026-03-11'
  };
  
  console.log('🔵 TESTE 1: MARCAR exercício 6');
  
  // Marcar
  await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
    body: JSON.stringify({ ...testData, completed: true }),
  });
  console.log('✅ Marcado!');
  
  // Verificar
  const where1 = `(student_id,eq,${testData.student_id})~and(workout_id,eq,${testData.workout_id})~and(exercise_id,eq,${testData.exercise_id})~and(date,eq,${testData.date})`;
  const check1 = await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where1}`, { headers: { 'xc-token': TOKEN } });
  const data1 = await check1.json();
  console.log('📊 Logs encontrados:', data1.list?.length);
  
  console.log('\n🔵 TESTE 2: DESMARCAR exercício 6');
  
  // Desmarcar (deletar)
  if (data1.list?.length > 0) {
    for (const log of data1.list) {
      await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
        body: JSON.stringify([{ id: log.id }]),
      });
    }
    console.log('✅ Desmarcado!');
  }
  
  // Verificar
  const check2 = await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where1}`, { headers: { 'xc-token': TOKEN } });
  const data2 = await check2.json();
  console.log('📊 Logs encontrados:', data2.list?.length);
  
  console.log('\n🔵 TESTE 3: MARCAR NOVAMENTE exercício 6');
  
  // Marcar de novo
  await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
    body: JSON.stringify({ ...testData, completed: true }),
  });
  console.log('✅ Marcado novamente!');
  
  // Verificar
  const check3 = await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records?where=${where1}`, { headers: { 'xc-token': TOKEN } });
  const data3 = await check3.json();
  console.log('📊 Logs encontrados:', data3.list?.length);
}

testarToggleCompleto().catch(console.error);
