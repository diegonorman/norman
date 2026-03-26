# 💪 GH Personal - Sistema de Gestão de Academia

Sistema completo para gestão de academia com 3 níveis de acesso: **Admin**, **Personal Trainer** e **Aluno**.

## 🚀 Tecnologias

- **Next.js 15** + TypeScript
- **TailwindCSS** para UI
- **NocoDB** como backend (API REST)
- **Zustand** para state management
- **JWT** para autenticação
- **bcryptjs** para hash de senhas

---

## 📦 Instalação

### 1. Instalar dependências
```bash
cd gh-personal
npm install
```

### 2. Configurar variáveis de ambiente
Já está configurado em `.env.local`:
```env
NEXT_PUBLIC_NOCODB_URL=https://base.archcloud.com.br/api/v2
NOCODB_API_TOKEN=NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni
JWT_SECRET=gh_personal_super_secret_key_2026_change_in_prod
```

### 3. Criar tabelas no NocoDB
```bash
node scripts/setup-nocodb.js
```

✅ **Resultado:**
- 12 tabelas criadas
- 3 planos inseridos (Starter, Pro, Premium)

### 4. Criar usuário admin
```bash
node scripts/create-admin.js
```

Preencha:
- Nome
- Email
- Senha
- Telefone (opcional)

### 5. Iniciar aplicação
```bash
npm run dev
```

Acesse: **http://localhost:3000**

---

## 🎯 Estrutura do Sistema

### **3 Painéis:**

#### 1️⃣ **Admin** (`/admin`)
- Gerenciar personals trainers
- Biblioteca de vídeos de exercícios
- Controlar mensalidades dos personals (PIX)
- Gerenciar planos
- Relatórios gerais

#### 2️⃣ **Personal** (`/personal`)
- Gerenciar alunos (limite por plano)
- Criar treinos usando biblioteca de vídeos
- Criar dietas personalizadas
- Controlar mensalidades dos alunos
- Ver progresso dos alunos

#### 3️⃣ **Aluno** (`/student`)
- Ver treinos do dia
- Marcar exercícios completos
- Cronômetro de descanso
- Ver dieta
- Acompanhar progresso

---

## 🗄️ Banco de Dados (NocoDB)

### Tabelas criadas:

1. **users** - Usuários do sistema
2. **plans** - Planos para personals
3. **subscriptions** - Assinaturas dos personals
4. **invoices** - Faturas/mensalidades dos personals
5. **video_library** - Biblioteca de vídeos (admin)
6. **students** - Alunos dos personals
7. **workouts** - Treinos dos alunos
8. **workout_exercises** - Exercícios dos treinos
9. **meal_plans** - Dietas dos alunos
10. **exercise_logs** - Progresso dos alunos
11. **student_payments** - Mensalidades dos alunos
12. **notifications** - Notificações do sistema

---

## 🔐 Autenticação

### Login Unificado
- Detecta automaticamente o tipo de usuário (admin/personal/student)
- Redireciona para o painel correto
- JWT com validade de 7 dias

### Criar usuários:

**Admin:**
```bash
node scripts/create-admin.js
```

**Personal/Aluno:**
- Admin cria personals pelo painel
- Personal cria alunos pelo painel

---

## 💳 Sistema de Pagamentos (PIX)

### Fluxo:
1. Admin gera fatura para personal (30 dias)
2. Sistema gera QR Code PIX automaticamente
3. Personal recebe notificação
4. Após pagamento, status atualiza automaticamente

### Integração PIX (próxima etapa):
- API de pagamento (a definir)
- Geração de QR Code
- Webhook de confirmação

---

## 📱 Próximas Etapas

### Fase 1 - Funcionalidades Core ✅
- [x] Setup NocoDB
- [x] Autenticação JWT
- [x] Painéis básicos (Admin/Personal/Aluno)
- [x] Estrutura de dados

### Fase 2 - CRUD Completo
- [ ] Admin: Gerenciar personals
- [ ] Admin: Upload de vídeos
- [ ] Personal: Gerenciar alunos
- [ ] Personal: Criar treinos
- [ ] Personal: Criar dietas

### Fase 3 - App do Aluno
- [ ] Migrar app atual (index.html)
- [ ] Integrar com backend
- [ ] Progresso em tempo real
- [ ] PWA otimizado

### Fase 4 - Pagamentos
- [ ] Integração PIX
- [ ] Geração de QR Code
- [ ] Notificações de pagamento
- [ ] Controle de inadimplência

### Fase 5 - Melhorias
- [ ] Gráficos de progresso
- [ ] Relatórios PDF
- [ ] Notificações push
- [ ] Modo offline

---

## 🛠️ Comandos Úteis

```bash
# Desenvolvimento
npm run dev

# Build produção
npm run build
npm start

# Criar admin
node scripts/create-admin.js

# Recriar tabelas (cuidado!)
node scripts/setup-nocodb.js
```

---

## 📂 Estrutura de Pastas

```
gh-personal/
├── app/
│   ├── admin/          # Painel admin
│   ├── personal/       # Painel personal
│   ├── student/        # Painel aluno
│   ├── login/          # Tela de login
│   └── api/
│       └── auth/       # API de autenticação
├── lib/
│   ├── nocodb.ts       # Cliente NocoDB
│   └── store.ts        # Zustand store
├── scripts/
│   ├── setup-nocodb.js # Criar tabelas
│   └── create-admin.js # Criar admin
└── .env.local          # Variáveis de ambiente
```

---

## 🎨 Planos Disponíveis

| Plano | Alunos | Preço | Recursos |
|-------|--------|-------|----------|
| **Starter** | 10 | R$ 49/mês | Básico |
| **Pro** | 30 | R$ 99/mês | + Relatórios |
| **Premium** | 100 | R$ 199/mês | + API + Suporte VIP |

---

## 🔒 Segurança

- ✅ Senhas com bcrypt (hash)
- ✅ JWT com expiração
- ✅ Validação de roles
- ✅ HTTPS obrigatório em produção
- ✅ Variáveis de ambiente protegidas

---

## 📞 Suporte

Desenvolvido para **Diego Norman Morais Barros do Nascimento**

**Status:** ✅ Base funcional pronta
**Próximo:** Implementar CRUDs completos

---

**Versão:** 1.0.0 (Base)
**Data:** Março 2026
