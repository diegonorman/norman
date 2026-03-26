/**
 * Script para criar automaticamente as tabelas no NocoDB
 * Executa: node scripts/setup-nocodb.js
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

// Schema das tabelas
const TABLES_SCHEMA = {
  users: {
    title: 'users',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'email', title: 'email', uidt: 'Email', unique: true },
      { column_name: 'password_hash', title: 'password_hash', uidt: 'SingleLineText' },
      { column_name: 'name', title: 'name', uidt: 'SingleLineText' },
      { column_name: 'phone', title: 'phone', uidt: 'PhoneNumber' },
      { column_name: 'avatar_url', title: 'avatar_url', uidt: 'URL' },
      { column_name: 'role', title: 'role', uidt: 'SingleSelect', dtxp: "'admin','personal','student'" },
      { column_name: 'active', title: 'active', uidt: 'Checkbox', cdf: 'true' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'updated_at', title: 'updated_at', uidt: 'DateTime' }
    ]
  },

  plans: {
    title: 'plans',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'name', title: 'name', uidt: 'SingleLineText' },
      { column_name: 'max_students', title: 'max_students', uidt: 'Number' },
      { column_name: 'price', title: 'price', uidt: 'Currency' },
      { column_name: 'features', title: 'features', uidt: 'LongText' },
      { column_name: 'active', title: 'active', uidt: 'Checkbox', cdf: 'true' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  subscriptions: {
    title: 'subscriptions',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'plan_id', title: 'plan_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'status', title: 'status', uidt: 'SingleSelect', dtxp: "'active','pending','overdue','suspended','cancelled'", cdf: "'pending'" },
      { column_name: 'current_period_start', title: 'current_period_start', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'current_period_end', title: 'current_period_end', uidt: 'DateTime' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'updated_at', title: 'updated_at', uidt: 'DateTime' }
    ]
  },

  invoices: {
    title: 'invoices',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'subscription_id', title: 'subscription_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'amount', title: 'amount', uidt: 'Currency' },
      { column_name: 'due_date', title: 'due_date', uidt: 'Date' },
      { column_name: 'paid_at', title: 'paid_at', uidt: 'DateTime' },
      { column_name: 'status', title: 'status', uidt: 'SingleSelect', dtxp: "'pending','paid','overdue','cancelled'", cdf: "'pending'" },
      { column_name: 'pix_qr_code', title: 'pix_qr_code', uidt: 'LongText' },
      { column_name: 'pix_copy_paste', title: 'pix_copy_paste', uidt: 'LongText' },
      { column_name: 'payment_link', title: 'payment_link', uidt: 'URL' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  video_library: {
    title: 'video_library',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'title', title: 'title', uidt: 'SingleLineText' },
      { column_name: 'url', title: 'url', uidt: 'URL' },
      { column_name: 'category', title: 'category', uidt: 'SingleLineText' },
      { column_name: 'muscle_group', title: 'muscle_group', uidt: 'SingleLineText' },
      { column_name: 'difficulty', title: 'difficulty', uidt: 'SingleSelect', dtxp: "'beginner','intermediate','advanced'" },
      { column_name: 'thumbnail_url', title: 'thumbnail_url', uidt: 'URL' },
      { column_name: 'description', title: 'description', uidt: 'LongText' },
      { column_name: 'created_by', title: 'created_by', uidt: 'LinkToAnotherRecord' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  exercise_library: {
    title: 'exercise_library',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'name', title: 'name', uidt: 'SingleLineText' },
      { column_name: 'muscle_group', title: 'muscle_group', uidt: 'SingleLineText' },
      { column_name: 'video_id', title: 'video_id', uidt: 'Number' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  students: {
    title: 'students',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'user_id', title: 'user_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'status', title: 'status', uidt: 'SingleSelect', dtxp: "'active','inactive','suspended'", cdf: "'active'" },
      { column_name: 'joined_at', title: 'joined_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  workouts: {
    title: 'workouts',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'student_id', title: 'student_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'name', title: 'name', uidt: 'SingleLineText' },
      { column_name: 'day_of_week', title: 'day_of_week', uidt: 'Number' },
      { column_name: 'active', title: 'active', uidt: 'Checkbox', cdf: 'true' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'updated_at', title: 'updated_at', uidt: 'DateTime' }
    ]
  },

  workout_exercises: {
    title: 'workout_exercises',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'workout_id', title: 'workout_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'video_id', title: 'video_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'sets', title: 'sets', uidt: 'SingleLineText' },
      { column_name: 'rest', title: 'rest', uidt: 'SingleLineText' },
      { column_name: 'notes', title: 'notes', uidt: 'LongText' },
      { column_name: 'order_index', title: 'order_index', uidt: 'Number' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  meal_plans: {
    title: 'meal_plans',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'student_id', title: 'student_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'name', title: 'name', uidt: 'SingleLineText' },
      { column_name: 'calories', title: 'calories', uidt: 'Number' },
      { column_name: 'active', title: 'active', uidt: 'Checkbox', cdf: 'true' },
      { column_name: 'content', title: 'content', uidt: 'LongText' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'updated_at', title: 'updated_at', uidt: 'DateTime' }
    ]
  },

  exercise_logs: {
    title: 'exercise_logs',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'student_id', title: 'student_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'workout_exercise_id', title: 'workout_exercise_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'completed_at', title: 'completed_at', uidt: 'DateTime', cdf: 'now()' },
      { column_name: 'weight_used', title: 'weight_used', uidt: 'Decimal' },
      { column_name: 'notes', title: 'notes', uidt: 'LongText' }
    ]
  },

  student_payments: {
    title: 'student_payments',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'student_id', title: 'student_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'personal_id', title: 'personal_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'amount', title: 'amount', uidt: 'Currency' },
      { column_name: 'due_date', title: 'due_date', uidt: 'Date' },
      { column_name: 'paid_at', title: 'paid_at', uidt: 'DateTime' },
      { column_name: 'status', title: 'status', uidt: 'SingleSelect', dtxp: "'pending','paid','overdue'", cdf: "'pending'" },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  },

  notifications: {
    title: 'notifications',
    columns: [
      { column_name: 'id', title: 'id', uidt: 'ID', pk: true },
      { column_name: 'user_id', title: 'user_id', uidt: 'LinkToAnotherRecord' },
      { column_name: 'title', title: 'title', uidt: 'SingleLineText' },
      { column_name: 'message', title: 'message', uidt: 'LongText' },
      { column_name: 'type', title: 'type', uidt: 'SingleSelect', dtxp: "'payment','workout','system','alert'" },
      { column_name: 'read', title: 'read', uidt: 'Checkbox', cdf: 'false' },
      { column_name: 'created_at', title: 'created_at', uidt: 'DateTime', cdf: 'now()' }
    ]
  }
};

// Dados iniciais
const SEED_DATA = {
  plans: [
    {
      name: 'Starter',
      max_students: 10,
      price: 49.00,
      features: '["10 alunos", "Biblioteca de vídeos", "Suporte básico"]',
      active: true
    },
    {
      name: 'Pro',
      max_students: 30,
      price: 99.00,
      features: '["30 alunos", "Biblioteca de vídeos", "Relatórios", "Suporte prioritário"]',
      active: true
    },
    {
      name: 'Premium',
      max_students: 100,
      price: 199.00,
      features: '["100 alunos", "Biblioteca completa", "Relatórios avançados", "Suporte VIP", "API"]',
      active: true
    }
  ]
};

async function setup() {
  try {
    console.log('🚀 Iniciando setup do NocoDB...\n');

    // 1. Listar bases existentes
    console.log('📋 Listando bases...');
    const basesRes = await api.get('/meta/bases');
    const bases = basesRes.data.list;
    
    if (!bases || bases.length === 0) {
      console.error('❌ Nenhuma base encontrada. Crie uma base no NocoDB primeiro.');
      return;
    }

    const baseId = bases[0].id;
    console.log(`✅ Usando base: ${bases[0].title} (${baseId})\n`);

    // 2. Criar tabelas
    console.log('📊 Criando tabelas...');
    for (const [tableName, schema] of Object.entries(TABLES_SCHEMA)) {
      try {
        const response = await api.post(`/meta/bases/${baseId}/tables`, schema);
        console.log(`  ✅ Tabela "${tableName}" criada`);
      } catch (error) {
        if (error.response?.data?.msg?.includes('already exists')) {
          console.log(`  ⚠️  Tabela "${tableName}" já existe`);
        } else {
          console.error(`  ❌ Erro ao criar "${tableName}":`, error.response?.data || error.message);
        }
      }
    }

    // 3. Inserir dados iniciais
    console.log('\n🌱 Inserindo dados iniciais...');
    
    // Buscar ID da tabela plans
    const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
    const plansTable = tablesRes.data.list.find(t => t.title === 'plans');
    
    if (plansTable) {
      for (const plan of SEED_DATA.plans) {
        try {
          await api.post(`/tables/${plansTable.id}/records`, plan);
          console.log(`  ✅ Plano "${plan.name}" inserido`);
        } catch (error) {
          console.log(`  ⚠️  Plano "${plan.name}" pode já existir`);
        }
      }
    }

    console.log('\n✨ Setup concluído com sucesso!');
    console.log('\n📝 Próximos passos:');
    console.log('1. Acesse o NocoDB e verifique as tabelas');
    console.log('2. Configure os relacionamentos (LinkToAnotherRecord)');
    console.log('3. Crie o primeiro usuário admin manualmente');
    console.log('4. Execute: npm run dev\n');

  } catch (error) {
    console.error('❌ Erro no setup:', error.response?.data || error.message);
  }
}

setup();
