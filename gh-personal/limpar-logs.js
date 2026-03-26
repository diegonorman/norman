// Limpar logs antigos
const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';
const TABLE_ID = 'm3pehyuo16yte7j';

async function limparLogsAntigos() {
  const today = new Date().toISOString().split('T')[0];
  console.log('📅 Hoje:', today);
  
  // Buscar todos os logs
  const res = await fetch(
    `${NOCODB_URL}/tables/${TABLE_ID}/records?limit=1000`,
    { headers: { 'xc-token': TOKEN } }
  );
  
  const data = await res.json();
  const logs = data.list || [];
  
  console.log('📊 Total de logs:', logs.length);
  
  // Filtrar logs antigos (não de hoje)
  const oldLogs = logs.filter(log => log.date !== today);
  console.log('🗑️ Logs antigos:', oldLogs.length);
  
  if (oldLogs.length === 0) {
    console.log('✅ Nenhum log antigo para deletar');
    return;
  }
  
  // Deletar logs antigos
  for (const log of oldLogs) {
    console.log('🗑️ Deletando:', log.id, log.date);
    await fetch(`${NOCODB_URL}/tables/${TABLE_ID}/records`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', 'xc-token': TOKEN },
      body: JSON.stringify([{ id: log.id }]),
    });
  }
  
  console.log('✅ Logs antigos deletados!');
}

limparLogsAntigos().catch(console.error);
