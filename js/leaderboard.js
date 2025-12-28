// --- LEADERBOARD SYSTEM ---
import { opponents } from './config.js';

let playerName = "Player";
let myScore = 0;
let myStreak = 0;

export function setPlayerName(name) {
    playerName = name;
}

export function setPlayerScore(score) {
    myScore = score;
}

export function setPlayerStreak(streak) {
    myStreak = streak;
}

export function renderLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    if (!leaderboardList) return;

    const allPlayers = [
        { name: playerName, score: myScore, streak: myStreak, isUser: true },
        ...opponents
    ];
    
    // Sort by score (descending)
    allPlayers.sort((a, b) => b.score - a.score);
    
    // Get top 10
    const top10Players = allPlayers.slice(0, 10);
    
    leaderboardList.innerHTML = '';

    top10Players.forEach((p, i) => {
        const item = document.createElement('div');
        const rankColor = i === 0 ? 'text-yellow-400' : (i === 1 ? 'text-gray-300' : (i === 2 ? 'text-orange-400' : 'text-gray-500'));
        let streakIcon = '';
        if (p.streak >= 3) streakIcon = '<span class="text-orange-500 text-lg animate-pulse">🔥</span>';

        if (p.isUser) {
            item.className = "flex items-center justify-between p-2 rounded bg-cyan-900/20 border border-cyan-500/50";
        } else {
            item.className = "flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors";
        }

        item.innerHTML = `
            <div class="flex items-center gap-3">
                <span class="font-mono font-bold w-4 ${rankColor}">${i + 1}</span>
                <div class="w-8 h-8 rounded bg-gray-700 flex items-center justify-center text-sm">
                    ${p.isUser ? '👤' : p.avatar}
                </div>
                <div>
                    <div class="text-sm font-bold ${p.isUser ? 'text-cyan-300' : 'text-gray-200'}">${p.name}</div>
                    <div class="text-xs text-gray-500">${p.streak} streak</div>
                </div>
            </div>
            <div class="flex flex-col items-end">
                <div class="font-mono font-bold text-white">${p.score}</div>
                ${streakIcon}
            </div>
        `;
        leaderboardList.appendChild(item);
    });
}

export function simulateOpponentActivity() {
    const randomOpponent = opponents[Math.floor(Math.random() * opponents.length)];
    if (Math.random() > 0.4) {
        randomOpponent.streak += 1;
        randomOpponent.score += Math.round(100 + Math.random() * 50);
    } else {
        randomOpponent.streak = 0;
    }
    renderLeaderboard();
}
