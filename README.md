# 💪 Norman Training

App PWA completo para treino, nutrição e suplementação. Mobile-first, dark mode, funciona offline.

**Live:** https://diegonorman.github.io/norman/

## Funcionalidades

### 🏋️ Treino
- Exercícios carregados do Excel (5 dias/semana)
- Progresso visual com check por exercício
- Botões SEG-SEX ficam verdes ao completar o treino do dia
- Highlight do dia atual da semana
- Auto-reset semanal (toda segunda limpa o progresso)
- Timer de descanso fixo no rodapé (não bloqueia a tela)
- Vídeos explicativos por exercício
- Histórico semanal e mensal de treinos

### 🥗 Dieta - Tracker de Calorias
- Calculadora TDEE com perfil configurável (peso, altura, idade, atividade)
- Boost metabólico para protocolos hormonais/termogênicos
- Meta calórica fixa ou calculada automaticamente
- TDEE adaptativo real baseado em dados de consumo + variação de peso (7+ dias)
- 100+ alimentos pré-cadastrados em categorias (proteínas, carbs, frutas, doces, fast food...)
- Cadastro custom de alimentos com macros da tabela nutricional
- Refeições salvas (combos com 1 clique)
- Filtro por categoria (emoji buttons)
- Macros em tempo real (proteína, carbo, gordura) com barras de progresso
- Registro de peso com comparação automática
- Gráfico de evolução de peso (canvas, últimos 30 registros)
- Streak de dias consecutivos na dieta
- Dias da semana registrados (visual)
- Déficit diário e semanal com projeção de perda em kg
- Plano alimentar fixo com substituições equivalentes

### 💊 Suplementos
- Protocolo completo com horários
- Dosagens e instruções de aplicação

### ⏰ Horários
- Alarmes de referência configuráveis
- Rotina de aeróbicos, sono e higiene

## Tech Stack

- HTML/CSS/JS puro (zero dependências)
- PWA com Service Worker (cache offline, auto-update com versionamento)
- localStorage para persistência
- Canvas API para gráficos
- GitHub Pages para deploy

## Como Usar

```bash
# Clonar
git clone https://github.com/diegonorman/norman.git

# Atualizar treinos do Excel
python3 convert_excel.py
./update_treinos.sh

# Testar local
python3 -m http.server 8000
```

## Instalar no Celular

1. Abra https://diegonorman.github.io/norman/ no Safari/Chrome
2. "Adicionar à Tela de Início"
3. Pronto, funciona como app nativo

## Estrutura

```
├── index.html          # Interface principal
├── style.css           # Design system dark mode
├── workout-data.js     # Dados de treino (gerado do Excel)
├── js/
│   ├── app.js          # Navegação, init, auto-reset semanal
│   ├── ui.js           # Modais e efeitos
│   ├── workout.js      # Lógica de treino, timer e progresso
│   ├── alarms.js       # Sistema de alarmes
│   ├── foods-db.js     # Banco de 100+ alimentos
│   └── nutrition.js    # Tracker de calorias completo
├── sw.js               # Service Worker (cache versionado, auto-update)
├── manifest.json       # PWA config
├── treinor.xlsx        # Dados de treino (fonte)
└── convert_excel.py    # Conversor Excel → JSON
```
