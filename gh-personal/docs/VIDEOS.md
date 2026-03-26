# 🎥 Sistema de Vídeos Locais

## ✅ Processamento Automático

Os vídeos são processados automaticamente quando você roda:
- `npm run dev` - Desenvolvimento
- `npm run build` - Build de produção

### 📊 Como Funciona

1. Script verifica se vídeos já foram processados
2. Se houver novos vídeos em `vdeo/`, copia para `public/videos/`
3. Gera `lib/video-map.json` com índice de todos os vídeos
4. Sistema sobe normalmente

### 🎯 Funcionalidades

**Biblioteca de Vídeos** (`/videos`)
- 136 vídeos organizados por grupo muscular
- Busca por nome de exercício
- Filtro por categoria
- Visualização grid/lista
- Player integrado
- 100% local

### 📁 Estrutura

```
vdeo/                    # Vídeos originais (não commitados)
├── Abdômen/
├── Braço/
└── ...

public/videos/           # Gerado automaticamente
lib/video-map.json       # Gerado automaticamente
```

### 🔄 Adicionar Novos Vídeos

1. Coloque vídeos em `vdeo/[categoria]/`
2. Rode `npm run dev` ou `npm run build`
3. Vídeos são processados automaticamente

### ⚙️ Configuração

**package.json:**
```json
"predev": "node scripts/process-videos.js",
"prebuild": "node scripts/process-videos.js"
```

**Scripts executam antes de:**
- `npm run dev` → desenvolvimento
- `npm run build` → produção

### 💡 Otimizações Futuras

- Comprimir vídeos com ffmpeg
- Converter .mov para .mp4
- Reduzir resolução para 720p
- Gerar thumbnails

---

**Status**: ✅ Sistema automático funcionando
