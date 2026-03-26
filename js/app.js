// === Inicialização, navegação, dieta ===

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js');
}

function showSection(section) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.top-nav-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById(section + '-section').classList.add('active');
    document.querySelector(`[onclick="showSection('${section}')"]`).classList.add('active');
    if (section === 'schedule') renderAlarms();
}

function showDiet(type) {
    document.querySelectorAll('.diet-plan').forEach(p => { p.classList.remove('active'); p.style.display = 'none'; });
    document.querySelectorAll('.diet-btn').forEach(b => b.classList.remove('active'));
    const diet = document.getElementById(`diet-${type}`);
    if (diet) { diet.classList.add('active'); diet.style.display = 'block'; }
    document.querySelector(`.diet-btn[onclick="showDiet('${type}')"]`).classList.add('active');
}

document.addEventListener('DOMContentLoaded', function() {
    loadWorkoutData();
    initializeAlarms();
    updateWeeklyDisplay();
    setTimeout(() => {
        if (alarms.length === 0) {
            showModal('Deseja adicionar os alarmes padrão do plano alimentar?', () => addDefaultAlarms());
        }
    }, 2000);
});
