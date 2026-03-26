// === UI: Modal, notificações, confete, efeitos visuais ===

function showModal(message, onConfirm) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:2000;backdrop-filter:blur(5px);';
    const isConfirm = typeof onConfirm === 'function';
    modal.innerHTML = `
        <div style="background:white;border-radius:15px;padding:25px;max-width:85%;text-align:center;box-shadow:0 20px 40px rgba(0,0,0,0.3);white-space:pre-line;">
            <p style="font-size:14px;line-height:1.5;margin-bottom:20px;color:#333;">${message}</p>
            <div style="display:flex;gap:10px;justify-content:center;">
                ${isConfirm ? '<button id="modal-cancel" style="flex:1;padding:10px;border:none;border-radius:10px;background:rgba(255,107,107,0.2);color:#FF6B6B;font-weight:600;cursor:pointer;">Cancelar</button>' : ''}
                <button id="modal-ok" style="flex:1;padding:10px;border:none;border-radius:10px;background:linear-gradient(135deg,#1e3c72,#2a5298);color:white;font-weight:600;cursor:pointer;">OK</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    modal.querySelector('#modal-ok').onclick = () => { modal.remove(); if (isConfirm) onConfirm(); };
    const cancel = modal.querySelector('#modal-cancel');
    if (cancel) cancel.onclick = () => modal.remove();
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });
}

function showNotification(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: linear-gradient(135deg, #4CAF50, #45a049); color: white;
        padding: 15px 25px; border-radius: 10px; z-index: 1001; font-weight: 600;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3); animation: slideDown 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideUp 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function showSaveNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #4CAF50, #45a049); color: white;
        padding: 20px 30px; border-radius: 15px; z-index: 1001; font-weight: 600;
        box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3); text-align: center;
        animation: saveNotificationPop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.2);
    `;
    notification.innerHTML = `
        <div style="font-size: 32px; margin-bottom: 8px;">💪</div>
        <div style="font-size: 16px; font-weight: bold; margin-bottom: 4px;">Exercício Salvo!</div>
        <div style="font-size: 12px; opacity: 0.9;">GH Personal</div>
    `;
    document.body.appendChild(notification);
    setTimeout(() => {
        notification.style.animation = 'saveNotificationOut 0.3s ease-in';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

function createConfetti() {
    const colors = ['#667eea', '#764ba2', '#4CAF50', '#FF6B6B', '#FFD93D'];
    const confettiCount = 25;
    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'fixed';
        confetti.style.width = '10px';
        confetti.style.height = '10px';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = Math.random() * 100 + 'vw';
        confetti.style.top = '-10px';
        confetti.style.zIndex = '9999';
        confetti.style.borderRadius = '50%';
        confetti.style.pointerEvents = 'none';
        document.body.appendChild(confetti);
        const animation = confetti.animate([
            { transform: 'translateY(0) rotate(0deg)', opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], { duration: Math.random() * 2000 + 1000, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' });
        animation.onfinish = () => confetti.remove();
    }
}

// Efeito ripple nos botões
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('top-nav-btn') ||
        e.target.classList.contains('video-link') ||
        e.target.classList.contains('timer-btn') ||
        e.target.classList.contains('check-btn')) {
        const ripple = document.createElement('span');
        const rect = e.target.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - rect.left - size/2}px;top:${e.clientY - rect.top - size/2}px;position:absolute;border-radius:50%;background:rgba(255,255,255,0.6);transform:scale(0);animation:ripple 0.6s linear;pointer-events:none;`;
        e.target.style.position = 'relative';
        e.target.style.overflow = 'hidden';
        e.target.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
});

// Injetar CSS de animações
(function() {
    const css = `
        @keyframes ripple { to { transform: scale(4); opacity: 0; } }
        @keyframes slideDown { from { opacity:0; transform:translateX(-50%) translateY(-20px); } to { opacity:1; transform:translateX(-50%) translateY(0); } }
        @keyframes slideUp { from { opacity:1; transform:translateX(-50%) translateY(0); } to { opacity:0; transform:translateX(-50%) translateY(-20px); } }
        @keyframes saveNotificationPop { 0% { transform:translate(-50%,-50%) scale(0.3); opacity:0; } 50% { transform:translate(-50%,-50%) scale(1.1); } 100% { transform:translate(-50%,-50%) scale(1); opacity:1; } }
        @keyframes saveNotificationOut { 0% { transform:translate(-50%,-50%) scale(1); opacity:1; } 100% { transform:translate(-50%,-50%) scale(0.8); opacity:0; } }
    `;
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
})();
