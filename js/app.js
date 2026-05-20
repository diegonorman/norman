// === Inicialização, navegação, dieta ===

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
        reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'activated') location.reload();
            });
        });
    });
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.top-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    if (section === 'schedule') renderAlarms();
    const wds = document.querySelector('.workout-days-section');
    if (wds) wds.style.display = section === 'workout' ? '' : 'none';
}

function showDiet(type) {
    document.querySelectorAll('.diet-plan').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('active'));
    const diet = document.getElementById(`diet-${type}`);
    if (diet) { diet.classList.add('active'); diet.style.display = 'block'; }
    document.querySelector(`.diet-btn[onclick="showDiet('${type}')"]`).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    autoResetWeek();
    loadWorkoutData();
    initializeAlarms();
    updateWeeklyDisplay();
    highlightToday();
    setTimeout(() => {
        if (alarms.length === 0) {
            showModal('Deseja adicionar os alarmes padrão do plano alimentar?', () => addDefaultAlarms());
        }
    }, 2000);
});

function autoResetWeek() {
    const today = new Date();
    const lastReset = localStorage.getItem('lastWeekReset');
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - ((today.getDay() + 6) % 7)); // Monday
    weekStart.setHours(0, 0, 0, 0);
    if (!lastReset || new Date(lastReset) < weekStart) {
        localStorage.setItem('completedExercises', '{}');
        localStorage.setItem('weeklyProgress', '{}');
        localStorage.setItem('lastWeekReset', weekStart.toISOString());
        completedExercises = {};
        weeklyProgress = {};
    }
}

function highlightToday() {
    const day = new Date().getDay(); // 0=Dom, 1=Seg...5=Sex, 6=Sab
    if (day >= 1 && day <= 5) {
        const box = document.querySelector(`.day-box[data-day="${day}"]`);
        if (box) box.classList.add('today');
    }
}
