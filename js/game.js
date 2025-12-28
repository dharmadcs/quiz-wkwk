// --- MAIN GAME LOGIC ---
import { gameConfig, allQuestionsDB, opponents, playerAvatars } from './config.js';
import { playSound, initAudio, setupButtonSounds } from './audio.js';
import { createExplosion } from './particles.js';
import { setPlayerName, renderLeaderboard, simulateOpponentActivity, fetchRealScores } from './leaderboard.js';
import { saveScore, checkPlayerExists } from './supabase.js';
import {
    getLives, decreaseLives, resetLives, updateLivesDisplay,
    updateMyStats, updateMultiplier, getMultiplier,
    updateQuestionText, updateQuestionNumber, updateCategory,
    renderOptions, setAllButtonsDisabled, highlightCorrectAnswer, highlightWrongAnswer,
    startTimer, showGameOver, hideGameOver, showStartScreen, hideStartScreen,
    showMainUI, setCardName, showNameError, hideNameError, showDuplicateNameError,
    logChat, getPlayerName, setupEnterKey, shakeScreen, updateCardAvatar
} from './ui.js';

// Game State
let activeSessionQuestions = [];
let currentQIndex = 0;
let myScore = 0;
let myStreak = 0;
let maxStreak = 0; // Track best streak
let isAnswering = false;
let playerName = "Player";
let selectedAvatar = playerAvatars[0].icon;
let timeLeft = gameConfig.timerDuration;
let currentShuffledQuestion = null;

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function shuffleQuestion(question) {
    const shuffledOptions = question.options.map((opt, index) => ({
        text: opt,
        isCorrect: index === question.correct
    }));
    shuffle(shuffledOptions);
    const newCorrectIndex = shuffledOptions.findIndex(opt => opt.isCorrect);
    return {
        ...question,
        options: shuffledOptions.map(opt => opt.text),
        correct: newCorrectIndex
    };
}

export function selectAvatar(avatarIcon) {
    selectedAvatar = avatarIcon;
}

export async function checkNameAndStart() {
    const val = getPlayerName();
    if (!val) {
        showNameError();
        return;
    }
    
    // Check if player name already exists
    const nameExists = await checkPlayerExists(val);
    if (nameExists) {
        showDuplicateNameError();
        return;
    }
    
    playerName = val;
    setPlayerName(playerName);
    updateCardAvatar(selectedAvatar);
    hideNameError();
    hideStartScreen();
    showMainUI();
    setCardName(playerName);
    initAudio();
    prepareSession();
    
    // Fetch real scores from Supabase
    fetchRealScores().then(() => {
        renderLeaderboard();
    });
    
    logChat("System", "Match Started. Good luck. Survive as long as you can!");
    logChat("System", `Mode: Survival (${gameConfig.maxLives} Lives)`);
    loadQuestion(0);
}

function prepareSession() {
    // Reset scores
    myScore = 0;
    myStreak = 0;
    maxStreak = 0;
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

    // Shuffle the question options and store it
    const originalQ = activeSessionQuestions[index];
    currentShuffledQuestion = shuffleQuestion(originalQ);
    
    updateQuestionText(currentShuffledQuestion.q);
    updateCategory(currentShuffledQuestion.category);
    updateQuestionNumber(index + 1, gameConfig.questionsPerSession);
    renderOptions(currentShuffledQuestion, handleAnswer);
    startTimer(handleTimeUp);
}

function handleAnswer(selectedIndex, btnElement) {
    if (!isAnswering) return;
    isAnswering = false;
    playSound('click');

    const correctIndex = currentShuffledQuestion.correct;
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
        // Update max streak
        if (myStreak > maxStreak) {
            maxStreak = myStreak;
        }
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
    const correctIndex = currentShuffledQuestion.correct;
    
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
    
    // Save score to Supabase with max streak (not current streak)
    if (myScore > 0) {
        saveScore(playerName, myScore, maxStreak, selectedAvatar).then(() => {
            logChat("System", "Score saved to leaderboard!");
            fetchRealScores().then(() => {
                renderLeaderboard();
            });
        });
    }
}

// Initialize button sounds
setupButtonSounds();
