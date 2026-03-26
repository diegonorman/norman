# 🚀 GH Personal - Guia de Teste

## ✅ Checklist de Funcionalidades Implementadas

### 1. Autenticação
- [x] Login unificado (admin/personal/student)
- [x] JWT com 7 dias
- [x] Proteção de rotas
- [x] Logout

### 2. Painel Admin
- [x] Dashboard com estatísticas
- [x] **CRUD de Personals** ✨
  - Listar personals
  - Criar personal com plano
  - Ver status (ativo/inativo)
- [x] **CRUD de Vídeos** ✨
  - Listar vídeos
  - Criar vídeo (título, URL, categoria, grupo muscular, dificuldade)
  - Visualizar vídeos

### 3. Painel Personal
- [x] Dashboard com estatísticas
- [x] **CRUD de Alunos** ✨
  - Listar alunos
  - Criar aluno (com validação de limite do plano)
  - Ver status

### 4. Painel Aluno
- [x] Dashboard básico
- [ ] Ver treinos (próxima etapa)
- [ ] Marcar progresso (próxima etapa)

---

## 🧪 Como Testar

### Passo 1: Criar Admin
```bash
cd gh-personal
node scripts/create-admin.js
```

**Exemplo:**
```
Nome: Admin
Email: admin@ghpersonal.com
Senha: admin123
Telefone: (11) 99999-9999
```

### Passo 2: Iniciar Servidor
```bash
npm run dev
```

Acesse: **http://localhost:3000**

### Passo 3: Login como Admin
1. Email: `admin@ghpersonal.com`
2. Senha: `admin123`
3. Será redirecionado para `/admin`

### Passo 4: Testar CRUD de Personals
1. Clique em **"Gerenciar Personals"**
2. Clique em **"+ Novo Personal"**
3. Preencha:
   - Nome: `João Personal`
   - Email: `joao@personal.com`
   - Senha: `123456`
   - Telefone: `(11) 98888-8888`
   - Plano: `Starter - 10 alunos - R$ 49`
4. Clique em **"Criar"**
5. ✅ Personal criado!

### Passo 5: Testar CRUD de Vídeos
1. Volte ao dashboard admin (botão ←)
2. Clique em **"Biblioteca de Vídeos"**
3. Clique em **"+ Novo Vídeo"**
4. Preencha:
   - Título: `Supino Reto`
   - URL: `https://youtube.com/shorts/exemplo`
   - Categoria: `Peito`
   - Grupo muscular: `Peitoral`
   - Dificuldade: `Intermediário`
5. Clique em **"Criar"**
6. ✅ Vídeo criado!

### Passo 6: Login como Personal
1. Faça logout
2. Login com:
   - Email: `joao@personal.com`
   - Senha: `123456`
3. Será redirecionado para `/personal`

### Passo 7: Testar CRUD de Alunos
1. Clique em **"Meus Alunos"**
2. Clique em **"+ Novo Aluno"**
3. Preencha:
   - Nome: `Maria Aluna`
   - Email: `maria@aluna.com`
   - Senha: `123456`
   - Telefone: `(11) 97777-7777`
4. Clique em **"Criar"**
5. ✅ Aluno criado!

### Passo 8: Login como Aluno
1. Faça logout
2. Login com:
   - Email: `maria@aluna.com`
   - Senha: `123456`
3. Será redirecionado para `/student`
4. ✅ Dashboard do aluno aparece!

---

## 📊 Status das Tabelas no NocoDB

Acesse: **https://base.archcloud.com.br**

Verifique as tabelas:
- ✅ `users` - 3 usuários (admin, personal, aluno)
- ✅ `plans` - 3 planos
- ✅ `subscriptions` - 1 assinatura (personal)
- ✅ `video_library` - Vídeos cadastrados
- ✅ `students` - 1 aluno vinculado ao personal

---

## 🐛 Troubleshooting

### Erro: "Limite de alunos atingido"
- O personal atingiu o limite do plano
- Solução: Admin pode mudar o plano do personal no NocoDB

### Erro: "Assinatura inativa"
- A assinatura do personal está `pending` ou `suspended`
- Solução: No NocoDB, mudar `subscriptions.status` para `active`

### Erro: "Não autorizado"
- Token JWT expirou ou inválido
- Solução: Fazer logout e login novamente

---

## 🎯 Próximas Implementações

### Fase 3 - Criar Treinos (Personal)
- [ ] Personal seleciona aluno
- [ ] Arrasta vídeos da biblioteca
- [ ] Define séries, repetições, descanso
- [ ] Salva treino por dia da semana

### Fase 4 - App do Aluno
- [ ] Ver treinos do dia
- [ ] Marcar exercícios completos
- [ ] Cronômetro de descanso
- [ ] Progresso semanal

### Fase 5 - Mensalidades
- [ ] Admin gera fatura para personal
- [ ] Gerar QR Code PIX
- [ ] Notificações de pagamento
- [ ] Personal controla mensalidades dos alunos

---

## 📝 Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Criar admin
node scripts/create-admin.js

# Recriar tabelas (CUIDADO: apaga dados!)
node scripts/setup-nocodb.js

# Ver logs
tail -f .next/trace
```

---

**Status Atual:** ✅ CRUDs básicos funcionando
**Próximo:** Criar treinos e migrar app do aluno
