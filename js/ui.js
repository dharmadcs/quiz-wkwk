// --- UI SYSTEM ---
import { gameConfig } from './config.js';
import { setPlayerName, setPlayerScore, setPlayerStreak, renderLeaderboard } from './leaderboard.js';

let currentLives = gameConfig.maxLives;
let multiplier = 1.0;

// DOM Elements
const questionEl = document.getElementById('question-text');
const categoryEl = document.getElementById('q-category');
const optionsContainer = document.getElementById('options-container');
const timerText = document.getElementById('timer-text');
const timerCircle = document.getElementById('timer-circle');
const myScoreEl = document.getElementById('my-score');
const myStreakEl = document.getElementById('my-streak');
const livesEl = document.getElementById('lives-display');
const qNumberEl = document.getElementById('q-number');
const chatLog = document.getElementById('chat-log');
const multiplierDisplay = document.getElementById('multiplier-display');
const multiplierBar = document.getElementById('multiplier-bar');
const cardName = document.getElementById('card-name');
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const nameInput = document.getElementById('player-name-input');
const nameError = document.getElementById('name-error');

export function getLives() {
    return currentLives;
}

export function decreaseLives() {
    currentLives--;
    updateLivesDisplay();
    return currentLives;
}

export function resetLives() {
    currentLives = gameConfig.maxLives;
    updateLivesDisplay();
}

export function updateLivesDisplay() {
    if (!livesEl) return;
    // Display hearts for lives
    const hearts = '❤️'.repeat(currentLives) + '🖤'.repeat(gameConfig.maxLives - currentLives);
    livesEl.innerHTML = hearts;
}

export function updateMyStats(score, streak) {
    myScoreEl.innerText = score;
    myStreakEl.innerText = streak;
    setPlayerScore(score);
    setPlayerStreak(streak);
    myScoreEl.parentElement.classList.add('scale-110');
    setTimeout(() => myScoreEl.parentElement.classList.remove('scale-110'), 200);
}

export function updateMultiplier(streak) {
    let newMultiplier = 1.0;
    if (streak > 0) {
        newMultiplier = 1.0 + (Math.floor(streak / 3) * 0.5);
        if (newMultiplier > 5.0) newMultiplier = 5.0;
    }
    multiplier = newMultiplier;
    multiplierDisplay.innerText = `x${multiplier.toFixed(1)}`;
    const percentage = (streak % 3) / 3 * 100;
    multiplierBar.style.width = `${percentage}%`;

    if (multiplier > 1.0) {
        multiplierDisplay.classList.add('text-purple-400', 'neon-text-pink');
    } else {
        multiplierDisplay.classList.remove('text-purple-400', 'neon-text-pink');
    }
}

export function getMultiplier() {
    return multiplier;
}

export function updateQuestionText(text) {
    questionEl.style.opacity = 0;
    questionEl.classList.remove('animate-slide-left');
    void questionEl.offsetWidth;
    
    setTimeout(() => {
        questionEl.innerText = text;
        questionEl.style.opacity = 1;
        questionEl.classList.add('animate-slide-left');
    }, 300);
}

export function updateQuestionNumber(number, total) {
    if (total === Infinity) {
        // Survival mode - just show the question number
        qNumberEl.innerText = number;
    } else {
        // Fixed mode - show "X/total"
        qNumberEl.innerText = `${number}/${total}`;
    }
}

export function updateCategory(category) {
    categoryEl.innerText = category;
}

export function renderOptions(question, onOptionClick) {
    optionsContainer.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D'];
    question.options.forEach((opt, i) => {
        const btn = document.createElement('button');
        btn.className = `option-btn glass-panel p-4 md:p-6 rounded-xl text-left text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-cyan-50 hover:bg-white/10 relative group min-h-[60px] md:min-h-[80px]`;
        btn.innerHTML = `
            <div class="absolute top-2 left-2 w-2 h-2 border-t border-l border-cyan-500/50 group-hover:border-white transition-colors"></div>
            <div class="absolute bottom-2 right-2 w-2 h-2 border-b border-r border-cyan-500/50 group-hover:border-white transition-colors"></div>
            <span class="relative z-10 font-mono mr-2 md:mr-3 text-cyan-400 text-sm md:text-lg">${letters[i]}</span>
            <span class="relative z-10 group-hover:text-white transition-colors">${opt}</span>
        `;
        btn.addEventListener('click', () => onOptionClick(i, btn));
        optionsContainer.appendChild(btn);
    });
}

export function showDuplicateNameError() {
    nameError.innerText = "Nama sudah digunakan! Pilih nama lain.";
    nameError.style.opacity = 1;
}

export function updateCardAvatar(avatarIcon) {
    const avatarEl = document.getElementById('card-avatar');
    if (!avatarEl) return;
    
    // Check if avatar is an image path or emoji
    const isImage = avatarIcon && (
        avatarIcon.startsWith('/') ||        // Local path
        avatarIcon.startsWith('http://') ||   // HTTP URL
        avatarIcon.startsWith('https://')     // HTTPS URL (Supabase)
    );
    
    if (isImage) {
        // Render image avatar with circle style
        avatarEl.innerHTML = `<img src="${avatarIcon}" alt="Avatar" class="w-full h-full rounded-full object-cover" />`;
        avatarEl.className = 'w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-cyan-400 shadow-lg shadow-cyan-500/30';
    } else {
        // Render emoji avatar
        avatarEl.innerText = avatarIcon;
        avatarEl.className = 'text-4xl md:text-5xl';
    }
}

export function setAllButtonsDisabled(disabled) {
    const allBtns = optionsContainer.children;
    Array.from(allBtns).forEach(btn => {
        btn.style.pointerEvents = disabled ? 'none' : 'auto';
    });
}

export function highlightCorrectAnswer(correctIndex) {
    const allBtns = optionsContainer.children;
    allBtns[correctIndex].classList.add('correct-answer');
}

export function highlightWrongAnswer(button) {
    button.classList.add('wrong-answer');
}

export function resetTimer() {
    clearInterval(window.timerInterval);
    timerText.innerText = gameConfig.timerDuration;
    const circumference = 175.9;
    timerCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    timerCircle.style.strokeDashoffset = 0;
    timerCircle.style.stroke = '#00f3ff';
    timerText.classList.remove('text-red-500');
}

export function startTimer(onTimeUp) {
    let timeLeft = gameConfig.timerDuration;
    resetTimer();
    
    window.timerInterval = setInterval(() => {
        timeLeft--;
        timerText.innerText = timeLeft;
        const circumference = 175.9;
        const offset = circumference - (timeLeft / gameConfig.timerDuration) * circumference;
        timerCircle.style.strokeDashoffset = offset;

        if (timeLeft <= 5) {
            timerText.classList.add('text-red-500');
            timerCircle.style.stroke = '#ff003c';
        }

        if (timeLeft <= 0) {
            clearInterval(window.timerInterval);
            onTimeUp();
        }
    }, 1000);
}

export function showGameOver(score) {
    gameOverScreen.classList.remove('hidden');
    gameOverScreen.classList.add('flex');
    document.getElementById('final-score').innerText = score;
}

export function hideGameOver() {
    gameOverScreen.classList.add('hidden');
    gameOverScreen.classList.remove('flex');
}

export function showStartScreen() {
    startScreen.style.display = 'flex';
}

export function hideStartScreen() {
    startScreen.style.display = 'none';
}

export function showMainUI() {
    document.getElementById('main-ui').style.opacity = '1';
}

export function setCardName(name) {
    cardName.innerText = name;
}

export function showNameError() {
    nameError.style.opacity = 1;
}

export function hideNameError() {
    nameError.style.opacity = 0;
}

export function logChat(user, msg) {
    const entry = document.createElement('div');
    const userColor = user === "System" ? "text-cyan-400" : "text-purple-400";
    entry.className = "animate-slide-left opacity-0";
    entry.innerHTML = `<span class="${userColor} font-bold">${user}:</span><span class="text-gray-300">${msg}</span>`;
    chatLog.appendChild(entry);
    requestAnimationFrame(() => entry.classList.remove('opacity-0'));
    chatLog.scrollTop = chatLog.scrollHeight;
}

export function getPlayerName() {
    return nameInput.value.trim();
}

export function setupEnterKey(callback) {
    nameInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            callback();
        }
    });
}

export function shakeScreen() {
    document.body.classList.add('shake');
    setTimeout(() => document.body.classList.remove('shake'), 500);
}

export function createGameEndExplosions() {
    // Import createExplosion from particles
    const { createExplosion } = require('./particles.js');
    createExplosion(window.innerWidth / 2, window.innerHeight / 2, '#bc13fe');
    createExplosion(window.innerWidth / 3, window.innerHeight / 3, '#00f3ff');
    createExplosion(window.innerWidth / 1.5, window.innerHeight / 2, '#0aff0a');
}
