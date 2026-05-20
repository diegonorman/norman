// === NUTRITION TRACKER ===

// Defaults (serão sobrescritos pelo perfil salvo)
let NT_BURN = 2683;
let NT_GOAL = 1700;
let NT_MACROS = { prot: 185, carb: 160, fat: 45 };

const NT_FOODS = []; // Será populado pelo DB + custom foods

function ntGetAllFoods() {
  const custom = JSON.parse(localStorage.getItem('ntCustomFoods') || '[]');
  return [...NT_FOODS_DB, ...custom.map(f => ({...f, cat: 'custom'}))];
}

// === CUSTOM FOODS ===
function ntGetCustomFoods() { return JSON.parse(localStorage.getItem('ntCustomFoods') || '[]'); }
function ntSaveCustomFood(food) {
  const foods = ntGetCustomFoods();
  foods.push(food);
  localStorage.setItem('ntCustomFoods', JSON.stringify(foods));
  ntPopulateSelect();
}
function ntRemoveCustomFood(idx) {
  const foods = ntGetCustomFoods();
  foods.splice(idx, 1);
  localStorage.setItem('ntCustomFoods', JSON.stringify(foods));
  ntPopulateSelect();
}

function ntShowAddCustom() {
  const el = document.getElementById('nt-customForm');
  if (el.style.display === 'none') {
    el.style.display = 'block';
  } else {
    el.style.display = 'none';
  }
}

function ntSaveCustomForm() {
  const name = document.getElementById('nc-name').value.trim();
  const kcal = parseFloat(document.getElementById('nc-kcal').value);
  const prot = parseFloat(document.getElementById('nc-prot').value) || 0;
  const carb = parseFloat(document.getElementById('nc-carb').value) || 0;
  const fat = parseFloat(document.getElementById('nc-fat').value) || 0;
  const unitType = document.getElementById('nc-unit').value;
  const portionG = parseFloat(document.getElementById('nc-portion').value) || 100;
  if (!name || !kcal) return;
  const food = { name, unit: unitType, kcal, prot, carb, fat, default_qty: unitType === 'un' ? 1 : portionG };
  if (unitType === 'un') food.portion_g = portionG;
  ntSaveCustomFood(food);
  document.getElementById('nc-name').value = '';
  document.getElementById('nc-kcal').value = '';
  document.getElementById('nc-prot').value = '';
  document.getElementById('nc-carb').value = '';
  document.getElementById('nc-fat').value = '';
  ntShowAddCustom();
}

// === REFEIÇÕES SALVAS (COMBOS) ===
function ntGetCombos() { return JSON.parse(localStorage.getItem('ntCombos') || '[]'); }
function ntSaveCombos(c) { localStorage.setItem('ntCombos', JSON.stringify(c)); }

function ntSaveCurrentAsCombo() {
  const log = ntGetLog();
  const mealItems = log.items.filter(i => i.meal === ntMeal);
  if (mealItems.length === 0) return alert('Adicione alimentos primeiro');
  const name = prompt('Nome do combo (ex: Meu café padrão):');
  if (!name) return;
  const combos = ntGetCombos();
  combos.push({ name, meal: ntMeal, items: mealItems });
  ntSaveCombos(combos);
  ntRenderCombos();
}

function ntLoadCombo(idx) {
  const combos = ntGetCombos();
  const combo = combos[idx];
  const log = ntGetLog();
  combo.items.forEach(item => log.items.push({...item, meal: ntMeal}));
  ntSaveLog(log);
  ntRender();
}

function ntDeleteCombo(idx) {
  if (!confirm('Remover este combo?')) return;
  const combos = ntGetCombos();
  combos.splice(idx, 1);
  ntSaveCombos(combos);
  ntRenderCombos();
}

function ntRenderCombos() {
  const el = document.getElementById('nt-combos');
  if (!el) return;
  const combos = ntGetCombos();
  if (combos.length === 0) { el.innerHTML = ''; return; }
  el.innerHTML = combos.map((c, i) => {
    const totalKcal = c.items.reduce((s, it) => s + it.kcal, 0);
    return `<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid var(--border,#2a2a2a)">
      <button onclick="ntLoadCombo(${i})" style="flex:1;text-align:left;background:none;border:none;color:var(--text,#f0f0f0);cursor:pointer;font-size:.75rem;padding:4px 0"><b>${c.name}</b> <span style="color:var(--text-3,#666)">(${Math.round(totalKcal)} kcal)</span></button>
      <button onclick="ntDeleteCombo(${i})" style="background:none;border:none;color:var(--red,#ef4444);cursor:pointer;font-size:.8rem">×</button>
    </div>`;
  }).join('');
}

// === FILTRO POR CATEGORIA ===
let ntCurrentCat = 'all';

function ntFilterCat(cat) {
  ntCurrentCat = cat;
  ntPopulateSelect();
  document.querySelectorAll('#nt-catBtns button').forEach(b => b.style.opacity = '0.5');
  event.target.style.opacity = '1';
}

function ntPopulateSelect() {
  const sel = document.getElementById('nt-foodSelect');
  if (!sel) return;
  sel.innerHTML = '';
  const foods = ntGetAllFoods();
  const filtered = ntCurrentCat === 'all' ? foods : foods.filter(f => f.cat === ntCurrentCat);
  filtered.forEach((f, i) => {
    const o = document.createElement('option');
    o.textContent = f.name;
    o.dataset.idx = foods.indexOf(f);
    sel.appendChild(o);
  });
  ntUpdateUnit();
}

let ntMeal = 'cafe';
const NT_MEAL_ICONS = { cafe: '☕', almoco: '🍛', lanche: '🍉', janta: '🍽️' };
const NT_TODAY = new Date().toISOString().slice(0, 10);

// === TDEE ADAPTATIVO (baseado em dados reais) ===
function ntCalcRealTDEE() {
  const weights = ntGetWeights();
  const history = ntGetHistory();
  if (weights.length < 2) return null;

  // Pegar primeiro e último peso com pelo menos 7 dias de diferença
  const first = weights[0];
  const last = weights[weights.length - 1];
  const d1 = new Date(first.date);
  const d2 = new Date(last.date);
  const days = Math.round((d2 - d1) / 86400000);
  if (days < 7) return null;

  // Calcular média de kcal consumidas no período
  let totalKcal = 0;
  let daysLogged = 0;
  const keys = Object.keys(history);
  keys.forEach(k => {
    const date = new Date(k);
    if (date >= d1 && date <= d2) {
      totalKcal += history[k].kcal;
      daysLogged++;
    }
  });
  // Incluir hoje se está no range
  if (daysLogged < 5) return null; // precisa de pelo menos 5 dias de dados

  const avgKcal = totalKcal / daysLogged;
  const weightChange = first.kg - last.kg; // positivo = perdeu peso
  const tdeeReal = Math.round(avgKcal + (weightChange * 7700 / days));

  return { tdee: tdeeReal, days, daysLogged, weightChange: weightChange.toFixed(2), avgKcal: Math.round(avgKcal) };
}

// === PERFIL / CALCULADORA TDEE ===
function ntGetProfile() { return JSON.parse(localStorage.getItem('ntProfile') || 'null'); }
function ntSaveProfile(p) { localStorage.setItem('ntProfile', JSON.stringify(p)); }

function ntCalcTDEE(peso, altura, idade, sexo, atividade, boost) {
  // Mifflin-St Jeor
  let tmb;
  if (sexo === 'M') tmb = 10 * peso + 6.25 * altura - 5 * idade + 5;
  else tmb = 10 * peso + 6.25 * altura - 5 * idade - 161;
  const multipliers = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725, muito_intenso: 1.9 };
  return Math.round(tmb * (multipliers[atividade] || 1.55)) + (boost || 0);
}

function ntApplyProfile(profile) {
  const tdee = ntCalcTDEE(profile.peso, profile.altura, profile.idade, profile.sexo, profile.atividade, profile.boost || 0);
  const deficits = { leve: 300, moderado: 500, agressivo: 750, extremo: 1000 };
  const deficit = deficits[profile.deficit] || 500;
  NT_BURN = tdee;
  NT_GOAL = profile.metaFixa > 0 ? profile.metaFixa : tdee - deficit;
  // Macros: 2.2g/kg prot, restante divide carb/fat
  const prot = Math.round(profile.peso * 2.2);
  const protKcal = prot * 4;
  const fatKcal = NT_GOAL * 0.25;
  const fat = Math.round(fatKcal / 9);
  const carbKcal = NT_GOAL - protKcal - fatKcal;
  const carb = Math.round(carbKcal / 4);
  NT_MACROS = { prot, carb: Math.max(carb, 50), fat };
  // Atualizar UI
  const goalEl = document.getElementById('nt-goal');
  if (goalEl) goalEl.textContent = NT_GOAL;
}

function ntShowProfile() {
  const profile = ntGetProfile();
  const el = document.getElementById('nt-profile-section');
  if (!el) return;

  if (profile && !el.dataset.editing) {
    // Mostrar resumo
    const defLabels = { leve: 'Leve (-300)', moderado: 'Moderado (-500)', agressivo: 'Agressivo (-750)', extremo: 'Extremo (-1000)' };
    const tdee = ntCalcTDEE(profile.peso, profile.altura, profile.idade, profile.sexo, profile.atividade, profile.boost || 0);
    const projSemanal = ((tdee - NT_GOAL) * 7 / 7700).toFixed(2);
    const realTDEE = ntCalcRealTDEE();
    const tdeeDisplay = realTDEE ? realTDEE.tdee : tdee;
    const tdeeLabel = realTDEE ? 'TDEE REAL ✓' : 'TDEE (estimado)';
    const projDisplay = ((tdeeDisplay - NT_GOAL) * 7 / 7700).toFixed(2);
    // Se temos TDEE real, usar ele como NT_BURN
    if (realTDEE) NT_BURN = realTDEE.tdee;

    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="font-size:.8rem;margin:0">⚙️ Meu Perfil</h3>
        <button onclick="ntEditProfile()" style="background:var(--surface-3,#242424);color:var(--text-2,#a0a0a0);border:1px solid var(--border,#2a2a2a);padding:4px 10px;border-radius:6px;font-size:.65rem;cursor:pointer">✏️ Editar</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:.7rem;text-align:center">
        <div><div style="color:var(--text-3,#666)">${tdeeLabel}</div><div style="font-weight:700;font-size:.9rem">${tdeeDisplay}</div></div>
        <div><div style="color:var(--text-3,#666)">META</div><div style="font-weight:700;font-size:.9rem;color:var(--green,#22c55e)">${NT_GOAL}</div></div>
        <div><div style="color:var(--text-3,#666)">PERDA/SEM</div><div style="font-weight:700;font-size:.9rem;color:var(--orange,#f59e0b)">~${projDisplay}kg</div></div>
      </div>
      <div style="font-size:.6rem;color:var(--text-3,#666);margin-top:6px;text-align:center">${profile.peso}kg · ${profile.altura}cm · ${profile.idade}a · Déficit: ${defLabels[profile.deficit]}${profile.boost ? ' · 🔥+' + profile.boost : ''}</div>
      ${realTDEE ? '<div style="font-size:.55rem;color:var(--green,#22c55e);margin-top:4px;text-align:center">📊 Calculado com ' + realTDEE.daysLogged + ' dias de dados · média ' + realTDEE.avgKcal + ' kcal · ' + realTDEE.weightChange + 'kg perdidos em ' + realTDEE.days + ' dias</div>' : '<div style="font-size:.55rem;color:var(--text-3,#666);margin-top:4px;text-align:center">⏳ Registre peso + comida por 7+ dias para TDEE real adaptativo</div>'}
      <div style="display:flex;gap:4px;margin-top:8px;align-items:center;border-top:1px solid var(--border,#2a2a2a);padding-top:8px">
        <span style="font-size:.65rem;color:var(--text-3,#666)">⚖️</span>
        <input type="number" id="nt-weight" placeholder="kg" step="0.1" style="flex:1;padding:5px 8px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem">
        <button onclick="ntSaveWeight()" style="padding:5px 10px;border-radius:6px;border:none;background:var(--blue,#3b82f6);color:#fff;font-size:.7rem;font-weight:600;cursor:pointer">Salvar</button>
      </div>
      <div id="nt-weightInfo" style="font-size:.65rem;color:var(--text-3,#666);margin-top:4px;text-align:center"></div>
    `;
    ntRenderWeight();
  } else {
    // Mostrar formulário
    const p = profile || { peso: 83, altura: 169, idade: 32, sexo: 'M', atividade: 'intenso', deficit: 'agressivo' };
    el.innerHTML = `
      <h3 style="font-size:.8rem;margin-bottom:10px">⚙️ Configurar Perfil</h3>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:.75rem">
        <div><label style="color:var(--text-3,#666);font-size:.6rem">PESO (kg)</label><input type="number" id="np-peso" value="${p.peso}" step="0.1" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem"></div>
        <div><label style="color:var(--text-3,#666);font-size:.6rem">ALTURA (cm)</label><input type="number" id="np-altura" value="${p.altura}" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem"></div>
        <div><label style="color:var(--text-3,#666);font-size:.6rem">IDADE</label><input type="number" id="np-idade" value="${p.idade}" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem"></div>
        <div><label style="color:var(--text-3,#666);font-size:.6rem">SEXO</label><select id="np-sexo" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem"><option value="M" ${p.sexo==='M'?'selected':''}>Masculino</option><option value="F" ${p.sexo==='F'?'selected':''}>Feminino</option></select></div>
      </div>
      <div style="margin-top:8px"><label style="color:var(--text-3,#666);font-size:.6rem">NÍVEL DE ATIVIDADE</label><select id="np-atividade" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem;margin-top:4px"><option value="sedentario" ${p.atividade==='sedentario'?'selected':''}>Sedentário</option><option value="leve" ${p.atividade==='leve'?'selected':''}>Leve (1-3x/sem)</option><option value="moderado" ${p.atividade==='moderado'?'selected':''}>Moderado (3-5x/sem)</option><option value="intenso" ${p.atividade==='intenso'?'selected':''}>Intenso (6-7x/sem)</option><option value="muito_intenso" ${p.atividade==='muito_intenso'?'selected':''}>Muito Intenso (2x/dia)</option></select></div>
      <div style="margin-top:8px"><label style="color:var(--text-3,#666);font-size:.6rem">TIPO DE DÉFICIT</label><select id="np-deficit" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem;margin-top:4px"><option value="leve" ${p.deficit==='leve'?'selected':''}>Leve (-300 kcal) ~0.3kg/sem</option><option value="moderado" ${p.deficit==='moderado'?'selected':''}>Moderado (-500 kcal) ~0.5kg/sem</option><option value="agressivo" ${p.deficit==='agressivo'?'selected':''}>Agressivo (-750 kcal) ~0.7kg/sem</option><option value="extremo" ${p.deficit==='extremo'?'selected':''}>Extremo (-1000 kcal) ~1kg/sem</option></select></div>
      <div style="margin-top:8px"><label style="color:var(--text-3,#666);font-size:.6rem">🔥 BOOST METABÓLICO (clembu/hormônios/mounjaro)</label><select id="np-boost" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem;margin-top:4px"><option value="0" ${(p.boost||0)===0?'selected':''}>Nenhum (+0 kcal)</option><option value="200" ${p.boost===200?'selected':''}>Leve (+200 kcal) - só termogênico</option><option value="350" ${p.boost===350?'selected':''}>Moderado (+350 kcal) - clembu + hormônios</option><option value="500" ${p.boost===500?'selected':''}>Alto (+500 kcal) - clembu + hormônios + mounjaro</option></select></div>
      <div style="margin-top:8px"><label style="color:var(--text-3,#666);font-size:.6rem">🎯 META CALÓRICA (deixe 0 para calcular automático)</label><input type="number" id="np-metaFixa" value="${p.metaFixa||0}" placeholder="0 = automático" style="width:100%;padding:6px;border-radius:6px;border:1px solid var(--border,#2a2a2a);background:var(--surface-2,#1c1c1c);color:var(--text,#f0f0f0);font-size:.8rem;margin-top:4px"></div>
      <button onclick="ntSaveProfileForm()" style="width:100%;margin-top:10px;padding:8px;background:var(--accent,#6366f1);color:#fff;border:none;border-radius:6px;font-weight:700;font-size:.8rem;cursor:pointer">💾 Salvar e Calcular</button>
    `;
    el.dataset.editing = '';
  }
}

function ntEditProfile() {
  const el = document.getElementById('nt-profile-section');
  el.dataset.editing = '1';
  ntShowProfile();
}

function ntSaveProfileForm() {
  const profile = {
    peso: parseFloat(document.getElementById('np-peso').value),
    altura: parseFloat(document.getElementById('np-altura').value),
    idade: parseInt(document.getElementById('np-idade').value),
    sexo: document.getElementById('np-sexo').value,
    atividade: document.getElementById('np-atividade').value,
    deficit: document.getElementById('np-deficit').value,
    boost: parseInt(document.getElementById('np-boost').value) || 0,
    metaFixa: parseInt(document.getElementById('np-metaFixa').value) || 0
  };
  if (!profile.peso || !profile.altura || !profile.idade) return;
  ntSaveProfile(profile);
  const el = document.getElementById('nt-profile-section');
  delete el.dataset.editing;
  ntApplyProfile(profile);
  ntShowProfile();
  ntRender();
}

// === LOG ===
function ntGetLog() {
  const d = JSON.parse(localStorage.getItem('ntLog') || '{}');
  if (!d.date || d.date !== NT_TODAY) return { date: NT_TODAY, items: [] };
  return d;
}
function ntSaveLog(l) { localStorage.setItem('ntLog', JSON.stringify(l)); }

function ntSetMeal(meal, btn) {
  ntMeal = meal;
  document.querySelectorAll('#nt-mealBtns .diet-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
}

function ntUpdateUnit() {
  const sel = document.getElementById('nt-foodSelect');
  if (!sel || sel.options.length === 0) return;
  const foods = ntGetAllFoods();
  const idx = parseInt(sel.options[sel.selectedIndex].dataset.idx) || 0;
  const f = foods[idx];
  if (!f) return;
  const u = document.getElementById('nt-unitLabel');
  const q = document.getElementById('nt-qty');
  if (f.unit === 'un') { u.textContent = 'un.'; q.value = f.default_qty; q.step = '1'; }
  else if (f.unit === 'ml') { u.textContent = 'ml'; q.value = f.default_qty; q.step = '50'; }
  else { u.textContent = 'g'; q.value = f.default_qty; q.step = '10'; }
}

function ntAddFood() {
  const sel = document.getElementById('nt-foodSelect');
  const qty = parseFloat(document.getElementById('nt-qty').value);
  if (!qty || qty <= 0 || sel.options.length === 0) return;
  const foods = ntGetAllFoods();
  const idx = parseInt(sel.options[sel.selectedIndex].dataset.idx) || 0;
  const f = foods[idx];
  if (!f) return;
  let grams, display;
  if (f.unit === 'un') { grams = qty * f.portion_g; display = qty + ' un (' + grams + 'g)'; }
  else { grams = qty; display = qty + (f.unit === 'ml' ? 'ml' : 'g'); }
  const factor = grams / 100;
  const log = ntGetLog();
  log.items.push({ name: f.name, display, meal: ntMeal, kcal: f.kcal * factor, prot: f.prot * factor, carb: f.carb * factor, fat: f.fat * factor });
  ntSaveLog(log);
  ntRender();
}

function ntRemoveFood(i) {
  const log = ntGetLog();
  log.items.splice(i, 1);
  ntSaveLog(log);
  ntRender();
}

function ntResetDay() {
  if (confirm('Resetar consumo de hoje?')) { ntSaveLog({ date: NT_TODAY, items: [] }); ntRender(); }
}

function ntRender() {
  const log = ntGetLog();
  let kcal = 0, prot = 0, carb = 0, fat = 0;
  log.items.forEach(i => { kcal += i.kcal; prot += i.prot; carb += i.carb; fat += i.fat; });

  const rem = NT_GOAL - kcal;
  const def = NT_BURN - kcal;

  document.getElementById('nt-consumed').textContent = Math.round(kcal);
  document.getElementById('nt-remaining').textContent = Math.round(rem);
  document.getElementById('nt-remaining').style.color = rem >= 0 ? 'var(--green,#22c55e)' : 'var(--red,#ef4444)';
  document.getElementById('nt-deficit').textContent = Math.round(def);
  document.getElementById('nt-deficit').style.color = def > 0 ? 'var(--green,#22c55e)' : 'var(--red,#ef4444)';
  document.getElementById('nt-goal').textContent = NT_GOAL;
  document.getElementById('nt-mainBar').style.width = Math.min((kcal / NT_GOAL) * 100, 100) + '%';

  document.getElementById('nt-prot').textContent = Math.round(prot) + '/' + NT_MACROS.prot + 'g';
  document.getElementById('nt-carb').textContent = Math.round(carb) + '/' + NT_MACROS.carb + 'g';
  document.getElementById('nt-fat').textContent = Math.round(fat) + '/' + NT_MACROS.fat + 'g';
  document.getElementById('nt-protBar').style.width = Math.min((prot / NT_MACROS.prot) * 100, 100) + '%';
  document.getElementById('nt-carbBar').style.width = Math.min((carb / NT_MACROS.carb) * 100, 100) + '%';
  document.getElementById('nt-fatBar').style.width = Math.min((fat / NT_MACROS.fat) * 100, 100) + '%';

  const el = document.getElementById('nt-log');
  if (log.items.length === 0) {
    el.innerHTML = '<p style="text-align:center;color:var(--text-3,#666);font-size:.75rem">Nenhum alimento registrado</p>';
  } else {
    el.innerHTML = log.items.map((item, i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid var(--border,#2a2a2a)">
        <div style="flex:1;font-size:.75rem">
          ${NT_MEAL_ICONS[item.meal]||''} ${item.name} <span style="color:var(--text-3,#666)">(${item.display})</span>
          <div style="font-size:.6rem;color:var(--text-3,#666);margin-top:2px"><b>P:</b>${item.prot.toFixed(1)}g · <b>C:</b>${item.carb.toFixed(1)}g · <b>G:</b>${item.fat.toFixed(1)}g</div>
        </div>
        <div style="font-size:.8rem;font-weight:600;color:var(--orange,#f59e0b);margin:0 6px">${item.kcal.toFixed(0)}</div>
        <button onclick="ntRemoveFood(${i})" style="background:none;border:none;color:var(--red,#ef4444);cursor:pointer;font-size:1rem">×</button>
      </div>
    `).join('');
  }

  ntSaveHistory();
  ntRenderWeekly();
  ntRenderStreak();
}

// === HISTÓRICO SEMANAL ===
function ntGetHistory() { return JSON.parse(localStorage.getItem('ntHistory') || '{}'); }
function ntSaveHistory() {
  const log = ntGetLog();
  if (log.items.length === 0) return;
  const h = ntGetHistory();
  let kcal = 0; log.items.forEach(i => kcal += i.kcal);
  h[log.date] = { kcal, deficit: NT_BURN - kcal };
  localStorage.setItem('ntHistory', JSON.stringify(h));
}

function ntRenderWeekly() {
  const h = ntGetHistory();
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (k === NT_TODAY) { const log = ntGetLog(); let kc = 0; log.items.forEach(x => kc += x.kcal); if (kc > 0) total += NT_BURN - kc; }
    else if (h[k]) total += h[k].deficit;
  }
  document.getElementById('nt-weeklyDeficit').textContent = Math.round(total) + ' kcal';
  document.getElementById('nt-weeklyLoss').textContent = '~' + (total / 7700).toFixed(2) + ' kg';

  // Renderizar dias da semana
  const el = document.getElementById('nt-weekDays');
  if (!el) return;
  const dayNames = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // segunda desta semana
  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const k = d.toISOString().slice(0, 10);
    const isToday = k === NT_TODAY;
    let logged = false;
    if (k === NT_TODAY) { const log = ntGetLog(); logged = log.items.length > 0; }
    else { logged = !!h[k]; }
    const bg = logged ? 'var(--green,#22c55e)' : 'var(--surface-3,#242424)';
    const color = logged ? '#fff' : 'var(--text-3,#666)';
    const border = isToday ? '2px solid var(--accent,#6366f1)' : '1px solid var(--border,#2a2a2a)';
    html += `<div style="width:32px;height:32px;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;background:${bg};color:${color};border:${border}">${dayNames[d.getDay()]}</div>`;
  }
  el.innerHTML = html;
}

// === PESO ===
function ntGetWeights() { return JSON.parse(localStorage.getItem('ntWeights') || '[]'); }
function ntSaveWeight() {
  const val = parseFloat(document.getElementById('nt-weight').value);
  if (!val || val < 40) return;
  const w = ntGetWeights();
  const idx = w.findIndex(x => x.date === NT_TODAY);
  if (idx >= 0) w[idx].kg = val; else w.push({ date: NT_TODAY, kg: val });
  w.sort((a, b) => a.date.localeCompare(b.date));
  localStorage.setItem('ntWeights', JSON.stringify(w));
  document.getElementById('nt-weight').value = '';
  ntRenderWeight();
  ntRenderChart();
}

function ntRenderWeight() {
  const w = ntGetWeights();
  const el = document.getElementById('nt-weightInfo');
  if (w.length === 0) { el.innerHTML = ''; return; }
  const last = w[w.length - 1];
  let html = '<span style="color:var(--text-2,#a0a0a0)">' + last.kg + 'kg</span> (' + last.date + ')';
  if (w.length >= 2) {
    const prev = w[w.length - 2];
    const diff = last.kg - prev.kg;
    const color = diff <= 0 ? 'var(--green,#22c55e)' : 'var(--red,#ef4444)';
    const sign = diff <= 0 ? '' : '+';
    html += ' <span style="color:' + color + '">' + sign + diff.toFixed(2) + 'kg</span>';
  }
  el.innerHTML = html;
}

// === STREAK ===
function ntCalcStreak() {
  const h = ntGetHistory();
  let streak = 0;
  const today = new Date();
  // Checar hoje
  const log = ntGetLog();
  if (log.items.length > 0) streak = 1;
  else return 0;
  // Checar dias anteriores
  for (let i = 1; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (h[k]) streak++;
    else break;
  }
  return streak;
}

function ntRenderStreak() {
  const el = document.getElementById('nt-streak');
  if (!el) return;
  const streak = ntCalcStreak();
  el.textContent = streak + ' dia' + (streak !== 1 ? 's' : '');
  if (streak >= 7) el.style.color = 'var(--green,#22c55e)';
  else if (streak >= 3) el.style.color = 'var(--orange,#f59e0b)';
  else el.style.color = 'var(--text-3,#666)';
}

// === GRÁFICO DE PESO ===
function ntRenderChart() {
  const canvas = document.getElementById('nt-weightChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const w = ntGetWeights();
  if (w.length < 2) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#666';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Registre peso em 2+ dias para ver o gráfico', canvas.width / 2, canvas.height / 2);
    return;
  }

  const last30 = w.slice(-30);
  const width = canvas.width;
  const height = canvas.height;
  const padding = { top: 20, bottom: 25, left: 35, right: 10 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const values = last30.map(p => p.kg);
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const range = max - min || 1;

  ctx.clearRect(0, 0, width, height);

  // Grid lines
  ctx.strokeStyle = '#2a2a2a';
  ctx.lineWidth = 0.5;
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartH / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillStyle = '#555';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText((max - (range / 4) * i).toFixed(1), padding.left - 4, y + 3);
  }

  // Line
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  last30.forEach((p, i) => {
    const x = padding.left + (i / (last30.length - 1)) * chartW;
    const y = padding.top + ((max - p.kg) / range) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Points
  last30.forEach((p, i) => {
    const x = padding.left + (i / (last30.length - 1)) * chartW;
    const y = padding.top + ((max - p.kg) / range) * chartH;
    ctx.fillStyle = '#6366f1';
    ctx.beginPath();
    ctx.arc(x, y, 3, 0, Math.PI * 2);
    ctx.fill();
  });

  // Labels (first and last date)
  ctx.fillStyle = '#555';
  ctx.font = '8px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(last30[0].date.slice(5), padding.left, height - 5);
  ctx.textAlign = 'right';
  ctx.fillText(last30[last30.length - 1].date.slice(5), width - padding.right, height - 5);
}

// === INIT ===
(function ntInit() {
  const sel = document.getElementById('nt-foodSelect');
  if (!sel) return;

  // Carregar perfil
  const profile = ntGetProfile();
  if (profile) ntApplyProfile(profile);
  ntShowProfile();

  // Popular select com banco expandido
  ntPopulateSelect();
  ntRenderCombos();
  ntRenderWeight();
  ntRenderStreak();
  ntRenderChart();
  ntRender();
})();
