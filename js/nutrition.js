// === NUTRITION TRACKER ===
const NT_BURN = 2683;
const NT_GOAL = 1700;
const NT_MACROS = { prot: 185, carb: 160, fat: 45 };

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
  document.getElementById('nt-remaining').style.color = rem >= 0 ? '#4CAF50' : '#f44336';
  document.getElementById('nt-deficit').textContent = Math.round(def);
  document.getElementById('nt-deficit').style.color = def > 0 ? '#4CAF50' : '#f44336';
  document.getElementById('nt-mainBar').style.width = Math.min((kcal / NT_GOAL) * 100, 100) + '%';

  document.getElementById('nt-prot').textContent = Math.round(prot) + '/' + NT_MACROS.prot + 'g';
  document.getElementById('nt-carb').textContent = Math.round(carb) + '/' + NT_MACROS.carb + 'g';
  document.getElementById('nt-fat').textContent = Math.round(fat) + '/' + NT_MACROS.fat + 'g';
  document.getElementById('nt-protBar').style.width = Math.min((prot / NT_MACROS.prot) * 100, 100) + '%';
  document.getElementById('nt-carbBar').style.width = Math.min((carb / NT_MACROS.carb) * 100, 100) + '%';
  document.getElementById('nt-fatBar').style.width = Math.min((fat / NT_MACROS.fat) * 100, 100) + '%';

  const el = document.getElementById('nt-log');
  if (log.items.length === 0) {
    el.innerHTML = '<p style="text-align:center;color:#666;font-size:.75rem">Nenhum alimento registrado</p>';
  } else {
    el.innerHTML = log.items.map((item, i) => `
      <div style="display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-bottom:1px solid #222">
        <div style="flex:1;font-size:.75rem">
          ${NT_MEAL_ICONS[item.meal]||''} ${item.name} <span style="color:#888">(${item.display})</span>
          <div style="font-size:.6rem;color:#666;margin-top:2px"><b>P:</b>${item.prot.toFixed(1)}g · <b>C:</b>${item.carb.toFixed(1)}g · <b>G:</b>${item.fat.toFixed(1)}g</div>
        </div>
        <div style="font-size:.8rem;font-weight:600;color:#FF9800;margin:0 6px">${item.kcal.toFixed(0)}</div>
        <button onclick="ntRemoveFood(${i})" style="background:none;border:none;color:#f44336;cursor:pointer;font-size:1rem">×</button>
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
  let html = '<span style="color:#aaa">' + last.kg + 'kg</span> (' + last.date + ')';
  if (w.length >= 2) {
    const prev = w[w.length - 2];
    const diff = last.kg - prev.kg;
    const color = diff <= 0 ? '#4CAF50' : '#f44336';
    const sign = diff <= 0 ? '' : '+';
    html += ' <span style="color:' + color + '">' + sign + diff.toFixed(2) + 'kg</span>';
  }
  el.innerHTML = html;
}

// === INIT ===
(function ntInit() {
  const sel = document.getElementById('nt-foodSelect');
  if (!sel) return;
  NT_FOODS.forEach(f => { const o = document.createElement('option'); o.textContent = f.name; sel.appendChild(o); });
  ntUpdateUnit();
  ntRenderWeight();
  ntRender();
})();
