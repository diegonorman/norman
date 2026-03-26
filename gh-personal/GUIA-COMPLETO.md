# 🎯 GUIA COMPLETO - Sistema GH Personal

## 📋 ÍNDICE RÁPIDO
1. [Status Atual](#status-atual)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Banco de Dados](#banco-de-dados)
4. [Sistema de Vídeos](#sistema-de-vídeos)
5. [Autenticação](#autenticação)
6. [Como Continuar](#como-continuar)
7. [Comandos Úteis](#comandos-úteis)

---

## ✅ STATUS ATUAL

### O que está funcionando:
- ✅ Autenticação com persistência (não desloga ao atualizar)
- ✅ 136 vídeos convertidos para MP4 (720p, comprimidos)
- ✅ Vídeos com nomes sanitizados (sem espaços/acentos)
- ✅ Tabela `videos` criada no NocoDB
- ✅ 136 vídeos sincronizados no banco
- ✅ Upload de vídeos pelo painel
- ✅ API de login com mensagens corretas

### ⚠️ Problema Atual:
- **Biblioteca de vídeos mostra "0 vídeos"**
- Vídeos estão no banco mas não aparecem na interface

---

## 📁 ESTRUTURA DO PROJETO

```
gh-personal/
├── app/
│   ├── api/
│   │   ├── auth/login/route.ts          # API de login
│   │   ├── admin/personals/route.ts     # API de personals
│   │   └── videos/upload/route.ts       # Upload de vídeos
│   ├── personal/page.tsx                # Dashboard do personal
│   ├── videos/page.tsx                  # ⚠️ Biblioteca de vídeos
│   └── login/page.tsx                   # Página de login
├── components/
│   ├── VideoLibrary.tsx                 # Componente da biblioteca
│   └── VideoUpload.tsx                  # Upload de vídeos
├── lib/
│   ├── nocodb.ts                        # Helpers do NocoDB
│   ├── store.ts                         # Zustand (auth)
│   └── video-map.json                   # Mapa de vídeos locais
├── scripts/
│   ├── process-videos.js                # Converte e sanitiza vídeos
│   └── sync-videos-db.js                # Sincroniza com banco
├── public/videos/                       # Vídeos convertidos
└── vdeo/                                # Vídeos originais
```

---

## 🗄️ BANCO DE DADOS

### Conexão NocoDB
- **URL**: `https://base.archcloud.com.br/api/v2`
- **Token**: `NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni`

### Tabelas Principais

#### `users`
- ID: `mi1cvcmvz1j1761`
- Campos: email, password_hash, name, phone, role, active

#### `videos` ✅ NOVA
- ID: `mawvcjeh4ekkm8e`
- Campos: id, title, url, category, muscle_group, difficulty
- **136 vídeos cadastrados**

#### `subscriptions`
- ID: `m71i7t0gkdcn5n4`
- Campos: personal_id, plan_id, status, current_period_end

---

## 🎥 SISTEMA DE VÍDEOS

### Fluxo Completo

1. **Vídeos Originais**: `vdeo/[Categoria]/arquivo.mov`
2. **Processamento**: `npm run predev` executa:
   - `process-videos.js` → Converte para MP4, sanitiza nomes
   - `sync-videos-db.js` → Adiciona ao banco NocoDB
3. **Resultado**: `public/videos/[categoria]/arquivo.mp4`
4. **Banco**: Path `/videos/categoria/arquivo.mp4`

### Estrutura de Vídeos

```
public/videos/
├── abdomen/
│   ├── abdominal-com-barra-no-cross.mp4
│   └── ...
├── braco/
├── costas/
├── gluteo/
├── ombro/
├── panturrilha/
├── peito/
├── posterior/
└── quadriceps/
```

### Paths no Banco
```
/videos/abdomen/abdominal-com-barra-no-cross.mp4
/videos/braco/rosca-martelo.mp4
/videos/costas/remada-curvada.mp4
```

---

## 🔐 AUTENTICAÇÃO

### Credenciais Admin
- **Email**: `diegonorman5@gmail.com`
- **Senha**: `admin123`
- **Role**: admin

### Sistema de Auth
- **Store**: Zustand com persist (localStorage)
- **Hook**: `useAuth(role)` em `hooks/useAuth.ts`
- **Persistência**: Não desloga ao atualizar página

---

## 🚀 COMO CONTINUAR

### 1. Corrigir Biblioteca de Vídeos

**Problema**: `app/videos/page.tsx` não está mostrando vídeos

**Verificar**:
```typescript
// app/videos/page.tsx linha ~10
const data = await getTableData('videos', {
  sort: 'category,title',
  limit: 200
});

// Filtro pode estar removendo todos
const localVideos = data.list.filter((v: any) => 
  v.url && v.url.startsWith('/videos/')
);
```

**Solução**:
1. Verificar se `getTableData` está retornando dados
2. Verificar se filtro está correto
3. Adicionar logs para debug

### 2. Testar Sistema

```bash
# Iniciar servidor
cd /home/norman/norman/gh-personal
npm run dev

# Acessar
http://localhost:3000/login
# Login: diegonorman5@gmail.com / admin123

# Testar biblioteca
http://localhost:3000/videos
```

### 3. Verificar Vídeos no Banco

```bash
cd /home/norman/norman/gh-personal
node << 'EOF'
const axios = require('axios');
const api = axios.create({
  baseURL: 'https://base.archcloud.com.br/api/v2',
  headers: { 'xc-token': 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni' }
});

(async () => {
  const basesRes = await api.get('/meta/bases');
  const baseId = basesRes.data.list[0].id;
  const tablesRes = await api.get(`/meta/bases/${baseId}/tables`);
  const table = tablesRes.data.list.find(t => t.title === 'videos');
  const res = await api.get(`/tables/${table.id}/records`, { params: { limit: 5 } });
  
  console.log('Total:', res.data.pageInfo.totalRows);
  res.data.list.forEach(v => console.log(`- ${v.title}: ${v.url}`));
})();
EOF
```

---

## 🛠️ COMANDOS ÚTEIS

### Desenvolvimento
```bash
npm run dev              # Inicia servidor (processa vídeos antes)
npm run build            # Build de produção
npm run start            # Inicia produção
```

### Vídeos
```bash
# Processar vídeos manualmente
node scripts/process-videos.js

# Sincronizar com banco
node scripts/sync-videos-db.js

# Ambos
npm run predev
```

### Banco de Dados
```bash
# Ver tabelas
node -e "
const axios = require('axios');
axios.get('https://base.archcloud.com.br/api/v2/meta/bases', {
  headers: { 'xc-token': 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni' }
}).then(r => axios.get(\`https://base.archcloud.com.br/api/v2/meta/bases/\${r.data.list[0].id}/tables\`, {
  headers: { 'xc-token': 'NGqq6w8rSbkwc5COh_XB3lnOfKOgzi2xt7TpdPni' }
})).then(r => r.data.list.forEach(t => console.log(t.title)));
"
```

---

## 🐛 DEBUG

### Problema: Vídeos não aparecem

1. **Verificar se vídeos existem no banco**:
```bash
# Deve retornar 136
node scripts/sync-videos-db.js
```

2. **Verificar arquivos físicos**:
```bash
find public/videos -name "*.mp4" | wc -l
# Deve retornar 136
```

3. **Verificar página de vídeos**:
- Abrir `app/videos/page.tsx`
- Adicionar `console.log` antes do return
- Ver logs no terminal do `npm run dev`

4. **Verificar componente**:
- Abrir `components/VideoLibrary.tsx`
- Verificar se `videos` prop está chegando
- Ver logs no console do navegador

---

## 📝 PRÓXIMOS PASSOS

1. ✅ Corrigir exibição de vídeos na biblioteca
2. ⬜ Integrar vídeos com criação de treinos
3. ⬜ Adicionar busca e filtros avançados
4. ⬜ Criar sistema de favoritos
5. ⬜ Adicionar thumbnails dos vídeos

---

## 🆘 PROBLEMAS COMUNS

### "Vídeos não aparecem"
- Verificar se `npm run predev` foi executado
- Verificar se tabela `videos` existe
- Verificar se há 136 registros no banco

### "Erro ao fazer login"
- Verificar credenciais: `diegonorman5@gmail.com` / `admin123`
- Verificar se tabela `users` tem o usuário
- Ver mensagem de erro específica

### "Erro ao processar vídeos"
- Verificar se `ffmpeg` está instalado: `which ffmpeg`
- Verificar se pasta `vdeo/` existe
- Ver logs de erro específicos

---

**Última atualização**: 2026-03-05 11:00
**Status**: Sistema 95% funcional, falta apenas corrigir exibição de vídeos
