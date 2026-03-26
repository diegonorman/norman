// === Alarmes, notificações push, horários ===

let alarms = JSON.parse(localStorage.getItem('alarms')) || [];

function showAlarmModal() {
    document.getElementById('alarm-modal').classList.remove('hidden');
}

function closeAlarmModal() {
    document.getElementById('alarm-modal').classList.add('hidden');
    document.getElementById('alarm-time').value = '';
    document.getElementById('alarm-description').value = '';
    document.getElementById('alarm-repeat').value = 'daily';
}

function saveAlarm() {
    const time = document.getElementById('alarm-time').value;
    const description = document.getElementById('alarm-description').value;
    const repeat = document.getElementById('alarm-repeat').value;
    if (!time || !description) { showModal('Preencha todos os campos!'); return; }
    const alarm = { id: Date.now(), time, description, repeat, active: true };
    alarms.push(alarm);
    localStorage.setItem('alarms', JSON.stringify(alarms));
    scheduleNotificationPush(alarm);
    renderAlarms();
    closeAlarmModal();
    createConfetti();
    showModal('Alarme criado com sucesso! 🎉');
}

function deleteAlarm(id) {
    showModal('Deseja excluir este alarme?', () => {
        alarms = alarms.filter(a => a.id !== id);
        localStorage.setItem('alarms', JSON.stringify(alarms));
        renderAlarms();
    });
}

function renderAlarms() {
    const container = document.getElementById('alarm-list');
    if (alarms.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:#666;font-style:italic;">Nenhum alarme configurado</p>';
        return;
    }
    const repeatTexts = { daily: 'Todos os dias', weekdays: 'Dias úteis', weekends: 'Fins de semana', once: 'Uma vez' };
    container.innerHTML = alarms.map(a => `
        <div class="alarm-item">
            <div>
                <div class="alarm-time">${a.time}</div>
                <div class="alarm-desc">${a.description}</div>
                <div style="font-size:12px;color:#999;">${repeatTexts[a.repeat] || a.repeat}</div>
            </div>
            <button class="alarm-delete" onclick="deleteAlarm(${a.id})">×</button>
        </div>
    `).join('');
}

function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
}

function scheduleNotificationPush(alarm) {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    const now = new Date();
    const [hours, minutes] = alarm.time.split(':');
    const alarmTime = new Date();
    alarmTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    if (alarmTime <= now) alarmTime.setDate(alarmTime.getDate() + 1);

    setTimeout(() => {
        new Notification('🔔 GH Personal - Lembrete', {
            body: alarm.description, icon: 'icon-192.png', badge: 'icon-192.png',
            tag: 'alarm-' + alarm.id, requireInteraction: true
        });
        if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 200]);
        if (alarm.repeat !== 'once') {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const dow = tomorrow.getDay();
            const shouldRepeat = alarm.repeat === 'daily' ||
                (alarm.repeat === 'weekdays' && dow >= 1 && dow <= 5) ||
                (alarm.repeat === 'weekends' && (dow === 0 || dow === 6));
            if (shouldRepeat) scheduleNotificationPush(alarm);
        }
    }, alarmTime.getTime() - now.getTime());
}

function initializeAlarms() {
    requestNotificationPermission();
    alarms.forEach(a => { if (a.active) scheduleNotificationPush(a); });
}

function addDefaultAlarms() {
    const defaults = [
        { time: '07:00', description: '🌅 Suplementos ao acordar', repeat: 'daily' },
        { time: '08:30', description: '🍳 1ª Refeição - Manhã', repeat: 'daily' },
        { time: '10:00', description: '🍌 2ª Refeição - Lanche', repeat: 'daily' },
        { time: '12:30', description: '🍽️ 3ª Refeição - Almoço + Enzimas', repeat: 'daily' },
        { time: '15:30', description: '🥤 4ª Refeição - Lanche', repeat: 'daily' },
        { time: '19:00', description: '🌙 5ª Refeição - Jantar', repeat: 'daily' },
        { time: '21:00', description: '💊 Suplementos pós-janta', repeat: 'daily' },
        { time: '08:00', description: '💉 Aplicação - Segunda', repeat: 'once' },
        { time: '08:00', description: '💉 Aplicação - Quinta', repeat: 'once' }
    ];
    if (alarms.length === 0) {
        defaults.forEach((a, i) => alarms.push({ id: Date.now() + i, ...a, active: true }));
        localStorage.setItem('alarms', JSON.stringify(alarms));
        renderAlarms();
        showModal('Alarmes padrão adicionados! 🎉\nVocê pode editá-los ou adicionar novos.');
    }
}

function showIOSInstructions() {
    showModal(`📱 COMO CONFIGURAR ALARMES REAIS NO iOS:

1️⃣ ALARMES NATIVOS (RECOMENDADO):
• Abra: Relógio → Alarme
• Toque: + (adicionar)
• Configure cada horário:

🌅 07:00 - Suplementos ao acordar
🍳 08:30 - 1ª Refeição - Manhã  
🍌 10:00 - 2ª Refeição - Lanche
🍽️ 12:30 - Almoço + Enzimas
🥤 15:30 - 4ª Refeição - Lanche
🌙 19:00 - Jantar
💊 21:00 - Suplementos pós-janta
💉 08:00 - Aplicação (Seg/Qui)

2️⃣ LEMBRETES:
• App Lembretes → Nova Lista
• Nome: "GH Personal"
• Adicionar com horário específico

3️⃣ SIRI (MAIS RÁPIDO):
• "Ei Siri, me lembre de tomar suplementos às 7 da manhã todos os dias"

✅ ASSIM FUNCIONARÁ SEMPRE, mesmo com app fechado!
💡 Use este app como checklist do seu plano.`);
}
