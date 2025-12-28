// --- MAIN GAME LOGIC ---
import { gameConfig, allQuestionsDB, opponents } from './config.js';
import { playSound, initAudio, setupButtonSounds } from './audio.js';
import { createExplosion } from './particles.js';
import { setPlayerName, renderLeaderboard, simulateOpponentActivity } from './leaderboard.js';
import {
    getLives, decreaseLives, resetLives, updateLivesDisplay,
    updateMyStats, updateMultiplier, getMultiplier,
    updateQuestionText, updateQuestionNumber, updateCategory,
    renderOptions, setAllButtonsDisabled, highlightCorrectAnswer, highlightWrongAnswer,
    startTimer, showGameOver, hideGameOver, showStartScreen, hideStartScreen,
    showMainUI, setCardName, showNameError, hideNameError,
    logChat, getPlayerName, setupEnterKey, shakeScreen
} from './ui.js';

// Game State
let activeSessionQuestions = [];
let currentQIndex = 0;
let myScore = 0;
let myStreak = 0;
let isAnswering = false;
let playerName = "Player";
let timeLeft = gameConfig.timerDuration;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

export function checkNameAndStart() {
    const val = getPlayerName();
    if (!val) {
        showNameError();
        return;
    }
    playerName = val;
    setPlayerName(playerName);
    hideNameError();
    hideStartScreen();
    showMainUI();
    setCardName(playerName);
    initAudio();
    prepareSession();
    renderLeaderboard();
    logChat("System", "Match Started. Good luck. Survive as long as you can!");
    logChat("System", `Mode: Survival (${gameConfig.maxLives} Lives)`);
    loadQuestion(0);
}

function prepareSession() {
    // Reset scores
    myScore = 0;
    myStreak = 0;
    currentQIndex = 0;
    resetLives();
    updateMyStats(0, 0);
    updateMultiplier(0);

    // Randomize all questions (survival mode - use all questions)
    activeSessionQuestions = shuffle([...allQuestionsDB]);
}

export function restartGame() {
    hideGameOver();
    prepareSession();
    logChat("System", "New Match Started.");
    loadQuestion(0);
}

function loadQuestion(index) {
    isAnswering = true;
    currentQIndex = index;
    timeLeft = gameConfig.timerDuration;

    const q = activeSessionQuestions[index];
    updateQuestionText(q.q);
    updateCategory(q.category);
    updateQuestionNumber(index + 1, gameConfig.questionsPerSession);
    renderOptions(q, handleAnswer);
    startTimer(handleTimeUp);
}

function handleAnswer(selectedIndex, btnElement) {
    if (!isAnswering) return;
    isAnswering = false;
    playSound('click');

    const currentQ = activeSessionQuestions[currentQIndex];
    const correctIndex = currentQ.correct;
    const allBtns = document.getElementById('options-container').children;

    setAllButtonsDisabled(true);

    if (selectedIndex === correctIndex) {
        // Correct answer
        btnElement.classList.add('correct-answer');
        playSound('correct');
        
        const basePoints = gameConfig.basePoints;
        const timeBonus = timeLeft * gameConfig.timeBonusMultiplier;
        const streakBonus = myStreak * gameConfig.streakBonusMultiplier;
        const roundScore = Math.round((basePoints + timeBonus + streakBonus) * getMultiplier());

        myScore += roundScore;
        myStreak++;
        updateMultiplier(myStreak);

        const rect = btnElement.getBoundingClientRect();
        createExplosion(rect.left + rect.width / 2, rect.top + rect.height / 2, '#0aff0a');

        logChat("System", `Benar! +${roundScore} Poin. Streak: ${myStreak}. Lives: ${getLives()}`);
        simulateOpponentActivity();

    } else {
        // Wrong answer
        btnElement.classList.add('wrong-answer');
        shakeScreen();
        playSound('wrong');
        
        const livesRemaining = decreaseLives();
        myStreak = 0;
        updateMultiplier(myStreak);
        highlightCorrectAnswer(correctIndex);

        if (livesRemaining <= 0) {
            logChat("System", `Salah! Lives: ${livesRemaining}. GAME OVER!`);
            endGame();
            return;
        }

        logChat("System", `Salah! Lives: ${livesRemaining}/${gameConfig.maxLives}. Hati-hati!`);
    }

    updateMyStats(myScore, myStreak);

    // Load next question after delay
    setTimeout(() => {
        if (getLives() > 0 && currentQIndex < activeSessionQuestions.length - 1) {
            loadQuestion(currentQIndex + 1);
        } else if (getLives() > 0) {
            // Completed all questions but still alive - reshuffle and continue
            logChat("System", "All questions used! Reshuffling...");
            activeSessionQuestions = shuffle([...allQuestionsDB]);
            loadQuestion(0);
        }
    }, 3000);
}

function handleTimeUp() {
    isAnswering = false;
    const currentQ = activeSessionQuestions[currentQIndex];
    const correctIndex = currentQ.correct;
    
    highlightCorrectAnswer(correctIndex);
    playSound('wrong');
    
    const livesRemaining = decreaseLives();
    myStreak = 0;
    updateMultiplier(myStreak);

    if (livesRemaining <= 0) {
        logChat("System", `Waktu habis! Lives: ${livesRemaining}. GAME OVER!`);
        endGame();
        return;
    }

    logChat("System", `Waktu habis! Lives: ${livesRemaining}/${gameConfig.maxLives}.`);
    updateMyStats(myScore, myStreak);

    setTimeout(() => {
        if (getLives() > 0 && currentQIndex < activeSessionQuestions.length - 1) {
            loadQuestion(currentQIndex + 1);
        } else if (getLives() > 0) {
            logChat("System", "All questions used! Reshuffling...");
            activeSessionQuestions = shuffle([...allQuestionsDB]);
            loadQuestion(0);
        }
    }, 3000);
}

function endGame() {
    showGameOver(myScore);
    createExplosion(window.innerWidth / 2, window.innerHeight / 2, '#bc13fe');
    createExplosion(window.innerWidth / 3, window.innerHeight / 3, '#00f3ff');
    createExplosion(window.innerWidth / 1.5, window.innerHeight / 2, '#0aff0a');
    
    const questionsAnswered = currentQIndex + 1;
    logChat("System", `Session Complete! Final Score: ${myScore} | Questions: ${questionsAnswered}`);
}

// Initialize button sounds
setupButtonSounds();
