# 🧪 Guia de Teste Completo - GH Personal

## ✅ Servidor Rodando
- URL: **http://localhost:3000**
- Status: ✅ Online

---

## 📋 Passo a Passo

### **PASSO 1: Criar Usuário Admin**

```bash
cd /home/norman/norman/gh-personal
node scripts/create-admin.js
```

**Preencha:**
```
Nome: Admin Sistema
Email: admin@ghpersonal.com
Senha: admin123
Telefone: (11) 99999-9999
```

✅ **Resultado esperado:** "Admin criado com sucesso!"

---

### **PASSO 2: Login como Admin**

1. Abra: **http://localhost:3000**
2. Será redirecionado para `/login`
3. Faça login:
   - Email: `admin@ghpersonal.com`
   - Senha: `admin123`
4. Clique em **"Entrar"**

✅ **Resultado esperado:** Redirecionado para `/admin` (Dashboard Admin)

---

### **PASSO 3: Criar Personal Trainer**

1. No dashboard admin, clique em **"Gerenciar Personals"**
2. Clique em **"+ Novo Personal"**
3. Preencha:
   - Nome: `João Silva`
   - Email: `joao@personal.com`
   - Senha: `123456`
   - Telefone: `(11) 98888-8888`
   - Plano: `Starter - 10 alunos - R$ 49`
4. Clique em **"Criar"**

✅ **Resultado esperado:** Personal aparece na lista

---

### **PASSO 4: Criar Vídeos de Exercícios**

1. Volte ao dashboard (botão ←)
2. Clique em **"Biblioteca de Vídeos"**
3. Clique em **"+ Novo Vídeo"**

**Vídeo 1:**
```
Título: Supino Reto
URL: https://youtube.com/shorts/exemplo1
Categoria: Peito
Grupo muscular: Peitoral
Dificuldade: Intermediário
```

**Vídeo 2:**
```
Título: Agachamento Livre
URL: https://youtube.com/shorts/exemplo2
Categoria: Pernas
Grupo muscular: Quadríceps
Dificuldade: Intermediário
```

**Vídeo 3:**
```
Título: Rosca Direta
URL: https://youtube.com/shorts/exemplo3
Categoria: Braços
Grupo muscular: Bíceps
Dificuldade: Iniciante
```

✅ **Resultado esperado:** 3 vídeos aparecem na biblioteca

---

### **PASSO 5: Logout e Login como Personal**

1. Clique em **"Sair"** (canto superior direito)
2. Faça login:
   - Email: `joao@personal.com`
   - Senha: `123456`

✅ **Resultado esperado:** Redirecionado para `/personal` (Dashboard Personal)

---

### **PASSO 6: Criar Aluno**

1. Clique em **"Meus Alunos"**
2. Clique em **"+ Novo Aluno"**
3. Preencha:
   - Nome: `Maria Santos`
   - Email: `maria@aluna.com`
   - Senha: `123456`
   - Telefone: `(11) 97777-7777`
4. Clique em **"Criar"**

✅ **Resultado esperado:** Aluno aparece na lista

---

### **PASSO 7: Criar Treino para o Aluno**

1. Volte ao dashboard (botão ←)
2. Clique em **"Criar Treino"**
3. Configure:
   - Aluno: `Aluno [id]` (selecione o aluno criado)
   - Nome: `DIA 1 - PEITO E TRÍCEPS`
   - Dia: `Segunda-feira`

4. **Adicionar Exercícios:**
   - Na seção "Adicionar Exercícios", clique em **"Supino Reto"**
   - Configure:
     - Séries: `4x10`
     - Descanso: `90 seg`
     - Observações: `Progressão de carga`
   
   - Clique em **"Rosca Direta"**
   - Configure:
     - Séries: `3x12`
     - Descanso: `60 seg`
     - Observações: `Controlar movimento`

5. Clique em **"Criar Treino"**

✅ **Resultado esperado:** "Treino criado com sucesso!"

---

### **PASSO 8: Logout e Login como Aluno**

1. Clique em **"Sair"**
2. Faça login:
   - Email: `maria@aluna.com`
   - Senha: `123456`

✅ **Resultado esperado:** Redirecionado para `/student` (Dashboard Aluno)

---

### **PASSO 9: Ver Treino e Testar Funcionalidades**

1. Clique em **"Meu Treino"**
2. Clique em **"SEG"** (Segunda-feira)

✅ **Resultado esperado:** Treino "DIA 1 - PEITO E TRÍCEPS" aparece

**Teste as funcionalidades:**

#### ✅ **Marcar Exercício Completo**
- Clique no botão circular (⚪) ao lado do exercício
- Deve ficar verde com ✓
- Barra de progresso deve atualizar

#### ✅ **Ver Vídeo**
- Clique em **"📹 Ver Vídeo"**
- Deve abrir o link do YouTube em nova aba

#### ✅ **Cronômetro de Descanso**
- Clique em **"⏱️ Cronômetro"**
- Modal deve aparecer com contagem regressiva
- Aguarde ou clique em **"Parar"**
- Ao finalizar, deve mostrar alerta "Tempo de descanso acabou! 💪"

#### ✅ **Progresso Visual**
- Marque todos os exercícios
- Barra de progresso deve chegar a 100%

---

## 🎯 Checklist de Funcionalidades

### **Admin** ✅
- [x] Login
- [x] Dashboard com estatísticas
- [x] Criar personal
- [x] Listar personals
- [x] Criar vídeo
- [x] Listar vídeos
- [x] Logout

### **Personal** ✅
- [x] Login
- [x] Dashboard com estatísticas
- [x] Criar aluno (com validação de limite)
- [x] Listar alunos
- [x] Criar treino
- [x] Selecionar exercícios da biblioteca
- [x] Configurar séries/descanso/observações
- [x] Logout

### **Aluno** ✅
- [x] Login
- [x] Dashboard
- [x] Ver treinos por dia da semana
- [x] Marcar exercícios completos
- [x] Ver vídeos dos exercícios
- [x] Usar cronômetro de descanso
- [x] Progresso visual
- [x] Persistência de progresso (localStorage)
- [x] Logout

---

## 🐛 Possíveis Problemas

### **Erro: "Limite de alunos atingido"**
**Solução:** 
1. Acesse NocoDB: https://base.archcloud.com.br
2. Vá em `subscriptions`
3. Mude `status` para `active`

### **Erro: "Não autorizado"**
**Solução:** Fazer logout e login novamente

### **Treino não aparece**
**Solução:** Verificar se:
- Treino foi criado para o aluno correto
- Dia da semana está correto
- Treino está `active: true` no NocoDB

---

## 📊 Verificar no NocoDB

Acesse: **https://base.archcloud.com.br**

**Tabelas para verificar:**
1. `users` - 3 usuários (admin, personal, aluno)
2. `plans` - 3 planos
3. `subscriptions` - 1 assinatura do personal
4. `video_library` - 3 vídeos
5. `students` - 1 aluno vinculado ao personal
6. `workouts` - 1 treino criado
7. `workout_exercises` - 2 exercícios do treino

---

## ✅ Teste Completo

Se todos os passos funcionaram:
- ✅ Sistema está 100% operacional
- ✅ Todas as funcionalidades implementadas estão funcionando
- ✅ Pronto para Fase 4 (Melhorias)

---

## 🚀 Próximos Passos

Após validar que tudo funciona:
1. Testar com mais dados (mais personals, alunos, treinos)
2. Implementar Fase 4 (Confete, progresso semanal, histórico)
3. Implementar Fase 5 (Pagamentos PIX)
4. Implementar Fase 6 (Dietas)

---

**Data do Teste:** 05/03/2026
**Status:** ✅ Pronto para teste
**Servidor:** http://localhost:3000
