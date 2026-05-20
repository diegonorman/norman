// === NUTRITION TRACKER ===

// Defaults (serão sobrescritos pelo perfil salvo)
let NT_BURN = 2683;
let NT_GOAL = 1700;
let NT_MACROS = { prot: 185, carb: 160, fat: 45 };

const NT_FOODS = [
  { name: "Cuscuz de milho (cozido)", unit: "g", kcal: 112, prot: 2.5, carb: 25, fat: 0.3, default_qty: 150 },
  { name: "Ovo inteiro", unit: "un", portion_g: 50, kcal: 146, prot: 13, carb: 0.6, fat: 10, default_qty: 3 },
  { name: "Peito de frango grelhado", unit: "g", kcal: 159, prot: 32, carb: 0, fat: 3.2, default_qty: 150 },
  { name: "Músculo bovino cozido", unit: "g", kcal: 171, prot: 32, carb: 0, fat: 4.5, default_qty: 150 },
  { name: "Fígado bovino acebolado", unit: "g", kcal: 150, prot: 25, carb: 4, fat: 4, default_qty: 150 },
  { name: "Moela de frango cozida", unit: "g", kcal: 130, prot: 22, carb: 0, fat: 4.5, default_qty: 150 },
  { name: "Carré (lombo suíno) grelhado", unit: "g", kcal: 164, prot: 27, carb: 0, fat: 6, default_qty: 150 },
  { name: "Queijo muçarela (fatia)", unit: "un", portion_g: 20, kcal: 300, prot: 22, carb: 1, fat: 23, default_qty: 1 },
  { name: "Leite desnatado líquido", unit: "ml", kcal: 35, prot: 3.4, carb: 5, fat: 0.1, default_qty: 200 },
  { name: "Leite em pó desnatado (colher)", unit: "un", portion_g: 10, kcal: 360, prot: 36, carb: 52, fat: 0.5, default_qty: 3 },
  { name: "Whey Protein (scoop)", unit: "un", portion_g: 30, kcal: 400, prot: 80, carb: 7, fat: 3, default_qty: 1 },
  { name: "Melancia", unit: "g", kcal: 30, prot: 0.6, carb: 7.5, fat: 0.2, default_qty: 250 },
  { name: "Pão francês", unit: "un", portion_g: 50, kcal: 300, prot: 9, carb: 58, fat: 3, default_qty: 1 },
  { name: "Arroz branco cozido", unit: "g", kcal: 128, prot: 2.5, carb: 28, fat: 0.2, default_qty: 100 },
  { name: "Feijão carioca cozido", unit: "g", kcal: 76, prot: 4.8, carb: 13.6, fat: 0.5, default_qty: 100 },
  { name: "Chocolate meio amargo", unit: "g", kcal: 530, prot: 5, carb: 60, fat: 30, default_qty: 20 },
  { name: "Doce de leite", unit: "g", kcal: 310, prot: 6, carb: 55, fat: 7, default_qty: 20 },
  { name: "Brócolis cozido", unit: "g", kcal: 35, prot: 2.4, carb: 7, fat: 0.4, default_qty: 100 },
  { name: "Abobrinha cozida", unit: "g", kcal: 15, prot: 1, carb: 3, fat: 0.1, default_qty: 100 },
  { name: "Chuchu cozido", unit: "g", kcal: 17, prot: 0.6, carb: 4, fat: 0.1, default_qty: 100 },
  { name: "Banana", unit: "un", portion_g: 100, kcal: 89, prot: 1.1, carb: 23, fat: 0.3, default_qty: 1 },
  { name: "Café preto (sem açúcar)", unit: "ml", kcal: 2, prot: 0.1, carb: 0, fat: 0, default_qty: 100 },
  { name: "Batata doce cozida", unit: "g", kcal: 77, prot: 1.3, carb: 18, fat: 0.1, default_qty: 150 },
  { name: "Tapioca (goma hidratada)", unit: "g", kcal: 68, prot: 0, carb: 17, fat: 0, default_qty: 50 },
];

let ntMeal = 'cafe';
const NT_MEAL_ICONS = { cafe: '☕', almoco: '🍛', lanche: '🍉', janta: '🍽️' };
const NT_TODAY = new Date().toISOString().slice(0, 10);

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
  NT_GOAL = tdee - deficit;
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
    el.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
        <h3 style="font-size:.8rem;margin:0">⚙️ Meu Perfil</h3>
        <button onclick="ntEditProfile()" style="background:var(--surface-3,#242424);color:var(--text-2,#a0a0a0);border:1px solid var(--border,#2a2a2a);padding:4px 10px;border-radius:6px;font-size:.65rem;cursor:pointer">✏️ Editar</button>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;font-size:.7rem;text-align:center">
        <div><div style="color:var(--text-3,#666)">TDEE REAL</div><div style="font-weight:700;font-size:.9rem">${tdee}</div></div>
        <div><div style="color:var(--text-3,#666)">META</div><div style="font-weight:700;font-size:.9rem;color:var(--green,#22c55e)">${NT_GOAL}</div></div>
        <div><div style="color:var(--text-3,#666)">PERDA/SEM</div><div style="font-weight:700;font-size:.9rem;color:var(--orange,#f59e0b)">~${projSemanal}kg</div></div>
      </div>
      <div style="font-size:.6rem;color:var(--text-3,#666);margin-top:6px;text-align:center">${profile.peso}kg · ${profile.altura}cm · ${profile.idade}a · Déficit: ${defLabels[profile.deficit]}${profile.boost ? ' · 🔥 Boost: +' + profile.boost + ' kcal' : ''}</div>
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
    boost: parseInt(document.getElementById('np-boost').value) || 0
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
  const f = NT_FOODS[document.getElementById('nt-foodSelect').selectedIndex];
  const u = document.getElementById('nt-unitLabel');
  const q = document.getElementById('nt-qty');
  if (f.unit === 'un') { u.textContent = 'un.'; q.value = f.default_qty; q.step = '1'; }
  else if (f.unit === 'ml') { u.textContent = 'ml'; q.value = f.default_qty; q.step = '50'; }
  else { u.textContent = 'g'; q.value = f.default_qty; q.step = '10'; }
}

function ntAddFood() {
  const sel = document.getElementById('nt-foodSelect');
  const qty = parseFloat(document.getElementById('nt-qty').value);
  if (!qty || qty <= 0) return;
  const f = NT_FOODS[sel.selectedIndex];
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

// === INIT ===
(function ntInit() {
  const sel = document.getElementById('nt-foodSelect');
  if (!sel) return;

  // Carregar perfil
  const profile = ntGetProfile();
  if (profile) ntApplyProfile(profile);
  ntShowProfile();

  // Popular select
  NT_FOODS.forEach(f => { const o = document.createElement('option'); o.textContent = f.name; sel.appendChild(o); });
  ntUpdateUnit();
  ntRenderWeight();
  ntRender();
})();
