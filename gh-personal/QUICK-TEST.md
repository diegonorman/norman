# ⚡ Teste Rápido - 5 Minutos

## 🚀 Início Rápido

```bash
# 1. Criar admin
node scripts/create-admin.js
# Nome: Admin
# Email: admin@test.com
# Senha: 123456

# 2. Servidor já está rodando em:
# http://localhost:3000
```

---

## 🎯 Fluxo de Teste (5 min)

### 1️⃣ **Admin** (1 min)
```
Login: admin@test.com / 123456
→ Criar Personal: João / joao@test.com / 123456 / Plano Starter
→ Criar 2 Vídeos: Supino / Agachamento
```

### 2️⃣ **Personal** (2 min)
```
Login: joao@test.com / 123456
→ Criar Aluno: Maria / maria@test.com / 123456
→ Criar Treino: DIA 1 - PEITO
   - Adicionar Supino (4x10, 90 seg)
   - Adicionar Agachamento (3x12, 60 seg)
```

### 3️⃣ **Aluno** (2 min)
```
Login: maria@test.com / 123456
→ Ver Treino (SEG)
→ Marcar exercício ✓
→ Testar cronômetro ⏱️
→ Ver progresso 📊
```

---

## ✅ Checklist Rápido

- [ ] Admin cria personal ✅
- [ ] Admin cria vídeos ✅
- [ ] Personal cria aluno ✅
- [ ] Personal cria treino ✅
- [ ] Aluno vê treino ✅
- [ ] Aluno marca progresso ✅
- [ ] Cronômetro funciona ✅

---

## 🎉 Sucesso!

Se todos os itens funcionaram:
**Sistema 100% operacional!** 🚀

Próximo: Fase 4 - Melhorias
