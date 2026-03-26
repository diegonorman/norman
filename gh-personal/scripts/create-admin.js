/**
 * Script para criar usuário admin inicial
 * Executa: node scripts/create-admin.js
 */

const axios = require('axios');
const bcrypt = require('bcryptjs');
const readline = require('readline');

const NOCODB_URL = 'https://base.archcloud.com.br/api/v2';
const TOKEN = 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni';

const api = axios.create({
  baseURL: NOCODB_URL,
  headers: {
    'xc-token': TOKEN,
    'Content-Type': 'application/json'
  }
});

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  try {
    console.log('🔐 Criar Usuário Admin\n');

    const name = await question('Nome: ');
    const email = await question('Email: ');
    const password = await question('Senha: ');
    const phone = await question('Telefone (opcional): ');

    console.log('\n⏳ Criando usuário...');

    // Hash da senha
    const password_hash = await bcrypt.hash(password, 10);

    // Buscar ID da tabela users
    const basesRes = await api.get('/meta/bases');
    const baseId = basesRes.data.list[0].id;
    
    const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
    const usersTable = tablesRes.data.list.find(t => t.title === 'users');

    if (!usersTable) {
      console.error('❌ Tabela users não encontrada');
      rl.close();
      return;
    }

    // Criar usuário admin
    const userData = {
      email,
      password_hash,
      name,
      phone: phone || null,
      role: 'admin',
      active: true
    };

    await api.post(`/tables/${usersTable.id}/records`, userData);

    console.log('\n✅ Admin criado com sucesso!');
    console.log('\n📝 Credenciais:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log('\n🚀 Agora você pode fazer login no sistema!');

  } catch (error) {
    console.error('\n❌ Erro:', error.response?.data || error.message);
  } finally {
    rl.close();
  }
}

createAdmin();
