// === Treinos, exercícios, progresso, timer, vídeo ===

let workoutData = {};
let completedExercises = JSON.parse(localStorage.getItem('completedExercises')) || {};
let weeklyProgress = JSON.parse(localStorage.getItem('weeklyProgress')) || {};
let monthlyHistory = JSON.parse(localStorage.getItem('monthlyHistory')) || {};
let currentDay = 1;
let timerInterval;

function loadWorkoutData() {
    workoutData = WORKOUT_DATA;
    showDay(1);
    updateProgress();
}

function showDay(day) {
    currentDay = day;
    const container = document.getElementById('workout-container');
    container.style.opacity = '0.5';
    container.style.transform = 'translateY(20px)';

    document.querySelectorAll('.workout-day-box').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.workout-day-box')[day - 1].classList.add('active');

    setTimeout(() => {
        renderExercises(day);
        updateProgress();
        container.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        container.style.opacity = '1';
        container.style.transform = 'translateY(0)';
    }, 150);
}

function getExerciseIcon(exerciseName) {
    const name = exerciseName.toLowerCase();
    if (name.includes('agachamento') || name.includes('squat')) return '🏋️‍♂️';
    if (name.includes('supino') || name.includes('peito') || name.includes('chest')) return '💪';
    if (name.includes('rosca') || name.includes('bíceps') || name.includes('curl')) return '💪';
    if (name.includes('tríceps') || name.includes('tricep')) return '🔥';
    if (name.includes('ombro') || name.includes('shoulder') || name.includes('elevação')) return '🤸‍♂️';
    if (name.includes('costas') || name.includes('puxada') || name.includes('remada')) return '🏃‍♂️';
    if (name.includes('leg press') || name.includes('press')) return '🦵';
    if (name.includes('extensora') || name.includes('flexora')) return '🦵';
    if (name.includes('panturrilha') || name.includes('calf')) return '🦵';
    if (name.includes('abdômen') || name.includes('abdominal') || name.includes('prancha')) return '🔥';
    if (name.includes('mobilidade') || name.includes('alongamento')) return '🧘‍♂️';
    if (name.includes('cadeira') || name.includes('máquina')) return '⚙️';
    if (name.includes('barra') || name.includes('halteres')) return '🏋️';
    if (name.includes('cardio') || name.includes('esteira') || name.includes('bike')) return '🏃‍♂️';
    return '💪';
}

function renderExercises(day) {
    const container = document.getElementById('workout-container');
    const workout = workoutData[day];
    container.innerHTML = `<h2>${workout.name}</h2>`;

    const formatSets = (sets) => {
        if (!sets) return '';
        return sets.replace(/xx/gi, '×').replace(/x/gi, '×').replace(/\s*×\s*/g, '× ').replace(/\s+/g, ' ').trim();
    };

    workout.exercises.forEach((exercise, index) => {
        const exerciseId = `${day}-${index}`;
        const isCompleted = completedExercises[exerciseId] || false;
        const card = document.createElement('div');
        card.className = `exercise-card ${isCompleted ? 'completed' : ''}`;
        card.innerHTML = `
            <div class="exercise-header" onclick="toggleCard(this)">
                <div class="exercise-name">
                    <span class="exercise-icon">${getExerciseIcon(exercise.name)}</span>
                    ${exercise.name}
                </div>
                <div class="card-controls">
                    <span class="expand-icon">▼</span>
                    <div class="check-btn ${isCompleted ? 'checked' : ''}" onclick="event.stopPropagation(); toggleExercise('${exerciseId}')">
                        ${isCompleted ? '✓' : ''}
                    </div>
                </div>
            </div>
            <div class="exercise-summary">
                <span class="sets-preview">${formatSets(exercise.sets)}</span>
                <span class="rest-preview">${exercise.rest}</span>
            </div>
            <div class="exercise-details collapsed">
                <div class="detail-row"><strong>Séries:</strong> ${formatSets(exercise.sets)}</div>
                <div class="detail-row"><strong>Pausa:</strong> ${exercise.rest}</div>
                <div class="detail-row"><strong>Observações:</strong> ${exercise.details || 'Progressão de carga.'}</div>
                <div class="exercise-actions">
                    ${exercise.video ? `<button class="video-link" onclick="openVideo('${exercise.video}')">Ver Vídeo</button>` : ''}
                    ${exercise.rest !== '-' && exercise.rest !== '' ? `<button class="timer-btn" onclick="startTimer('${exercise.rest}')">Cronômetro</button>` : ''}
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function toggleExercise(exerciseId) {
    const wasCompleted = completedExercises[exerciseId] || false;
    completedExercises[exerciseId] = !completedExercises[exerciseId];
    localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
    renderExercises(currentDay);
    updateProgress();
    if (!wasCompleted && completedExercises[exerciseId]) {
        createConfetti();
        showSaveNotification();
        if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    }
}

function toggleCard(header) {
    const details = header.parentElement.querySelector('.exercise-details');
    const icon = header.querySelector('.expand-icon');
    details.classList.toggle('collapsed');
    icon.textContent = details.classList.contains('collapsed') ? '▼' : '▲';
}

function updateProgress() {
    const workout = workoutData[currentDay];
    const total = workout.exercises.length;
    let done = 0;
    workout.exercises.forEach((_, i) => { if (completedExercises[`${currentDay}-${i}`]) done++; });
    document.getElementById('progress').style.width = (done / total * 100) + '%';
    document.getElementById('progress-count').textContent = done;
    document.getElementById('total-count').textContent = total;
    if (done === total && total > 0) markDayCompleted(currentDay);
    updateWeeklyDisplay();
}

// Timer
function parseRestTime(restTime) {
    if (!restTime || restTime === '-') return 0;
    const str = restTime.toLowerCase();
    if (str.includes('min')) {
        const match = str.match(/(\d+)/);
        return match ? parseInt(match[1]) * 60 : 60;
    }
    const match = str.match(/(\d+)/);
    return match ? parseInt(match[1]) : 60;
}

function formatTime(seconds) {
    if (seconds <= 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function startTimer(restTime) {
    const timeInSeconds = parseRestTime(restTime);
    if (timeInSeconds <= 0) return;
    const existing = document.getElementById('floating-timer');
    if (existing) { clearInterval(timerInterval); existing.remove(); }

    const timer = document.createElement('div');
    timer.id = 'floating-timer';
    timer.style.cssText = `position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:150px;height:100px;background:rgba(0,0,0,0.9);color:white;border-radius:15px;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:1000;box-shadow:0 10px 30px rgba(0,0,0,0.5);font-family:Arial,sans-serif;`;
    timer.innerHTML = `
        <div style="font-size:24px;font-weight:bold;color:#4CAF50;">${formatTime(timeInSeconds)}</div>
        <div style="font-size:12px;opacity:0.8;margin-top:5px;">Descanso</div>
        <button onclick="closeTimer()" style="position:absolute;top:5px;right:8px;background:none;border:none;color:white;font-size:16px;cursor:pointer;">×</button>
    `;
    document.body.appendChild(timer);

    let remaining = timeInSeconds;
    timerInterval = setInterval(() => {
        remaining--;
        const display = timer.querySelector('div');
        if (display) display.textContent = formatTime(remaining);
        if (remaining <= 0) {
            clearInterval(timerInterval);
            timer.remove();
            showNotification('Tempo de descanso acabou! 💪');
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
        }
    }, 1000);
}

function closeTimer() {
    clearInterval(timerInterval);
    const timer = document.getElementById('floating-timer');
    if (timer) timer.remove();
}

// Vídeo
function openVideo(url) {
    if (url.includes(' | ')) {
        const videos = url.split(' | ');
        const videoList = videos.map((v, i) => `<a href="#" onclick="openSingleVideo('${v.trim()}'); return false;" style="display:block;padding:15px;margin:10px 0;background:linear-gradient(135deg,#1e3c72,#2a5298);color:white;text-decoration:none;border-radius:10px;text-align:center;font-weight:bold;">🎥 Vídeo ${i + 1}</a>`).join('');
        const iframe = document.getElementById('video-frame');
        iframe.style.display = 'none';
        iframe.innerHTML = `<div style="padding:20px;text-align:center;"><h3 style="color:white;margin-bottom:20px;">Escolha qual vídeo assistir:</h3>${videoList}</div>`;
        document.getElementById('video-modal').classList.remove('hidden');
        return;
    }
    openSingleVideo(url);
}

function openSingleVideo(url) {
    const iframe = document.getElementById('video-frame');
    const videoPlayer = document.getElementById('video-player');

    if (url.includes('drive.google.com')) {
        const fileId = url.split('/d/')[1]?.split('/')[0];
        videoPlayer.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = `https://drive.google.com/file/d/${fileId}/preview`;
    } else {
        let embedUrl = url;
        if (url.includes('youtube.com/watch')) {
            const id = url.split('v=')[1]?.split('&')[0];
            embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&loop=1&mute=1&playlist=${id}`;
        } else if (url.includes('youtube.com/shorts')) {
            const id = url.split('/shorts/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&loop=1&mute=1&playlist=${id}`;
        } else if (url.includes('youtu.be')) {
            const id = url.split('youtu.be/')[1]?.split('?')[0];
            embedUrl = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0&loop=1&mute=1&playlist=${id}`;
        }
        videoPlayer.style.display = 'none';
        iframe.style.display = 'block';
        iframe.src = embedUrl;
    }
    document.getElementById('video-modal').classList.remove('hidden');
}

function closeVideo() {
    document.getElementById('video-frame').src = '';
    document.getElementById('video-player').src = '';
    document.getElementById('video-modal').classList.add('hidden');
}

// Progresso semanal e histórico
function markDayCompleted(day) {
    const today = new Date();
    const monthKey = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const dayNumber = today.getDate();
    weeklyProgress[day] = today.toDateString();
    localStorage.setItem('weeklyProgress', JSON.stringify(weeklyProgress));
    if (!monthlyHistory[monthKey]) monthlyHistory[monthKey] = [];
    if (!monthlyHistory[monthKey].includes(dayNumber)) {
        monthlyHistory[monthKey].push(dayNumber);
        monthlyHistory[monthKey].sort((a, b) => a - b);
    }
    localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
}

function updateWeeklyDisplay() {
    for (let day = 1; day <= 5; day++) {
        const dayBox = document.querySelector(`[data-day="${day}"]`);
        if (weeklyProgress[day]) dayBox.classList.add('completed');
        else dayBox.classList.remove('completed');
    }
}

function resetWeek() {
    showModal('Deseja iniciar uma nova semana? Todo o progresso será resetado.', () => {
        completedExercises = {};
        weeklyProgress = {};
        localStorage.setItem('completedExercises', JSON.stringify(completedExercises));
        localStorage.setItem('weeklyProgress', JSON.stringify(weeklyProgress));
        renderExercises(currentDay);
        updateProgress();
        updateWeeklyDisplay();
        showNotification('Nova semana iniciada! 🗓️');
    });
}

function showHistory() {
    document.getElementById('history-modal').classList.remove('hidden');
    renderHistory();
}

function closeHistory() {
    document.getElementById('history-modal').classList.add('hidden');
}

function renderHistory() {
    const historyList = document.getElementById('history-list');
    if (Object.keys(monthlyHistory).length === 0) {
        historyList.innerHTML = '<p style="text-align:center;opacity:0.7;">Nenhum treino registrado ainda</p>';
        return;
    }
    const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    historyList.innerHTML = Object.keys(monthlyHistory).sort().reverse().map(monthKey => {
        const [year, month] = monthKey.split('-');
        const days = monthlyHistory[monthKey];
        return `<div class="month-item"><div class="month-title">${months[parseInt(month)-1]} ${year} (${days.length} dias)</div><div class="month-days">${days.map(d => `<div class="history-day">${d}</div>`).join('')}</div></div>`;
    }).join('');
}

function clearHistory() {
    showModal('Deseja limpar TODO o histórico? Esta ação não pode ser desfeita.', () => {
        monthlyHistory = {};
        localStorage.setItem('monthlyHistory', JSON.stringify(monthlyHistory));
        renderHistory();
        showNotification('Histórico limpo! 🗑️');
    });
}
