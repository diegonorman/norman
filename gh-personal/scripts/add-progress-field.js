const axios = require('axios');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const API_TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const headers = {
  'xc-token': API_TOKEN,
  'Content-Type': 'application/json'
};

async function addProgressField() {
  try {
    const basesRes = await axios.get(`${NOCODB_URL}/meta/bases`, { headers });
    const baseId = basesRes.data.list[0].id;

    const tablesRes = await axios.get(`${NOCODB_URL}/meta/bases/${baseId}/tables`, { headers });
    const usersTable = tablesRes.data.list.find(t => t.title === 'users');

    await axios.post(
      `${NOCODB_URL}/meta/tables/${usersTable.id}/columns`,
      {
        column_name: 'progress',
        title: 'progress',
        uidt: 'LongText',
        dt: 'text'
      },
      { headers }
    );
    console.log('✅ Coluna progress adicionada');
  } catch (error) {
    console.error('❌ Erro:', error.response?.data || error.message);
  }
}

addProgressField();
