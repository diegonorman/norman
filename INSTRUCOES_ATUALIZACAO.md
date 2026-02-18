# 📋 INSTRUÇÕES PARA ATUALIZAR DIETA E SUPLEMENTOS

## ✅ Alterações Realizadas

### 1. CSS (style.css) - JÁ ATUALIZADO ✓
Adicionados estilos para os botões de alternância de dietas.

### 2. JavaScript (script.js) - JÁ ATUALIZADO ✓
Adicionada função `showDiet()` para alternar entre dietas.

### 3. HTML (index.html) - PRECISA ATUALIZAR MANUALMENTE

## 🔧 Como Atualizar o index.html

### Passo 1: Substituir Seção de Nutrição

Localize no seu `index.html` a linha:
```html
<!-- Seção de Nutrição -->
```

E substitua TODO o conteúdo até o final da seção (antes de `<!-- Seção de Suplementos -->`) pelo conteúdo do arquivo:
📄 **nutrition-update.html**

### Passo 2: Substituir Seção de Suplementos

Localize no seu `index.html` a linha:
```html
<!-- Seção de Suplementos -->
```

E substitua TODO o conteúdo até o final da seção (antes de `<!-- Seção de Horários -->`) pelo conteúdo do arquivo:
📄 **supplements-update.html**

## 🎯 Principais Mudanças

### Dieta:
- ✅ Adicionados botões para alternar entre "1 DIA ALTO CARBO" e "2 DIAS BAIXO CARBO"
- ✅ Dieta Alto Carbo: 3 ovos, pão/tapioca, 250g proteína, 100g carbo
- ✅ Dieta Baixo Carbo: 5 ovos, sem pão, 300g proteína, sem carbo no almoço/jantar
- ✅ Aeróbicos: 45 minutos (corrigido de 40)

### Suplementos:
- ✅ Adicionado Clenbuterol 2ml ao acordar
- ✅ Enzimas digestivas: Faseoalmina + Cassiolamina (corrigido)
- ✅ Protocolo atualizado: Testosterona 500mg, Masteron 300mg, Boldenona 300mg (3x/semana)

## 🚀 Testando

Após aplicar as mudanças:
1. Abra o app no navegador
2. Vá na aba "🥗 Dieta"
3. Teste os botões de alternância entre dietas
4. Verifique se todas as informações estão corretas

## 📱 Deploy

Depois de testar localmente:
```bash
git add .
git commit -m "Atualização dieta e suplementos - Alto/Baixo Carbo"
git push origin main
```

---
**Desenvolvido para Diego Norman** 💪
