const axios = require('axios');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const API_TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const headers = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json'
};

async function addJsonFields() {
  try {
    // Buscar todas as bases
    const basesRes = await axios.get(`${NOCODB_URL}/meta/bases`, { headers });
    console.log('Bases disponíveis:', basesRes.data.list.map(b => ({ id: b.id, title: b.title })));
    
    const baseId = basesRes.data.list[0].id;
    console.log('Usando base:', baseId);

    // Buscar tabela users
    const tablesRes = await axios.get(`${NOCODB_URL}/meta/bases/${baseId}/tables`, { headers });
    const usersTable = tablesRes.data.list.find(t => t.title === 'users');
    
    if (!usersTable) {
      console.error('❌ Tabela users não encontrada');
      return;
    }

    console.log('✅ Tabela users encontrada:', usersTable.id);

    // Adicionar coluna workouts
    await axios.post(
      `${NOCODB_URL}/meta/tables/${usersTable.id}/columns`,
      {
        column_name: 'workouts',
        title: 'workouts',
        uidt: 'LongText',
        dt: 'text'
      },
      { headers }
    );
    console.log('✅ Coluna workouts adicionada');

    // Adicionar coluna meals
    await axios.post(
      `${NOCODB_URL}/meta/tables/${usersTable.id}/columns`,
      {
        column_name: 'meals',
        title: 'meals',
        uidt: 'LongText',
        dt: 'text'
      },
      { headers }
    );
    console.log('✅ Coluna meals adicionada');

    // Adicionar coluna supplements
    await axios.post(
      `${NOCODB_URL}/meta/tables/${usersTable.id}/columns`,
      {
        column_name: 'supplements',
        title: 'supplements',
        uidt: 'LongText',
        dt: 'text'
      },
      { headers }
    );
    console.log('✅ Coluna supplements adicionada');

    console.log('\n🎉 Campos JSON adicionados com sucesso!');

  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

addJsonFields();
