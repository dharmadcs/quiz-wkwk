// --- LEADERBOARD SYSTEM ---
import { opponents } from './config.js';
import { saveScore, getTopScores } from './supabase.js';

let playerName = "Player";
let myScore = 0;
let myStreak = 0;
let realTimeScores = [];

export function setPlayerName(name) {
    playerName = name;
}

export function setPlayerScore(score) {
    myScore = score;
}

export function setPlayerStreak(streak) {
    myStreak = streak;
}

// Fetch real scores from Supabase
export async function fetchRealScores() {
    const realScores = await getTopScores(10);
    if (realScores) {
        realTimeScores = realScores.map(score => ({
            name: score.player_name,
            score: score.score,
            streak: score.streak,
            avatar: score.avatar || '🏆',
            isReal: true
        }));
    }
    return realTimeScores;
}

// Render leaderboard to a specific container
function renderLeaderboardToContainer(containerId, allPlayers) {
    console.log(`📋 Rendering to container: ${containerId}`);
    console.log(`📊 Total players: ${allPlayers.length}`);
    
    const leaderboardList = document.getElementById(containerId);
    if (!leaderboardList) {
        console.log(`⚠️  Container not found: ${containerId}`);
        return;
    }

    // Sort by score (descending)
    allPlayers.sort((a, b) => b.score - a.score);
    
    // Get top 10
    const top10Players = allPlayers.slice(0, 10);
    
    console.log(`🏆 Top 10 players:`, top10Players.map(p => ({ name: p.name, avatar: p.avatar })));
    
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

        // Debug logging
        console.log(`🖼️  Leaderboard item ${i}: name=${p.name}, avatar=${p.avatar}`);

        // Check if avatar is an image path or emoji
        const isImage = p.avatar && typeof p.avatar === 'string' && (
            p.avatar.startsWith('/') ||        // Local path
            p.avatar.startsWith('http://') ||   // HTTP URL
            p.avatar.startsWith('https://')     // HTTPS URL (Supabase)
        );
        
        console.log(`🔍 Is image? ${isImage}, avatar type: ${typeof p.avatar}`);

        // Build leaderboard item using DOM API (no innerHTML)
        
        // Main container
        const mainContainer = document.createElement('div');
        mainContainer.className = 'flex items-center justify-between';
        
        // Left section: rank, avatar, name, streak
        const leftSection = document.createElement('div');
        leftSection.className = 'flex items-center gap-3';
        
        // Rank
        const rankSpan = document.createElement('span');
        rankSpan.className = `font-mono font-bold w-4 ${rankColor}`;
        rankSpan.textContent = i + 1;
        leftSection.appendChild(rankSpan);
        
        // Avatar
        const avatarContainer = document.createElement('div');
        avatarContainer.className = 'w-10 h-10 rounded-full bg-gradient-to-br from-purple-600 to-blue-800 border-2 border-purple-400 flex items-center justify-center overflow-hidden';
        
        if (isImage) {
            const img = document.createElement('img');
            img.src = p.avatar;
            img.alt = `Avatar of ${p.name}`;
            img.className = 'leaderboard-avatar-img';
            img.onerror = function() {
                console.log(`❌ Image load failed: ${p.avatar}`);
                this.onerror = null;
                this.style.display = 'none';
                avatarContainer.textContent = '🏆';
            };
            img.onload = function() {
                console.log(`✅ Image loaded successfully: ${p.avatar}`);
            };
            avatarContainer.appendChild(img);
        } else {
            avatarContainer.textContent = p.avatar || '🏆';
        }
        leftSection.appendChild(avatarContainer);
        
        // Name and streak
        const infoDiv = document.createElement('div');
        const nameDiv = document.createElement('div');
        nameDiv.className = `text-sm font-bold ${p.isUser ? 'text-cyan-300' : 'text-gray-200'}`;
        nameDiv.textContent = p.name;
        infoDiv.appendChild(nameDiv);
        
        const streakDiv = document.createElement('div');
        streakDiv.className = 'text-xs text-gray-500';
        streakDiv.textContent = `${p.streak} streak`;
        infoDiv.appendChild(streakDiv);
        
        leftSection.appendChild(infoDiv);
        mainContainer.appendChild(leftSection);
        
        // Right section: score and streak icon
        const rightSection = document.createElement('div');
        rightSection.className = 'flex flex-col items-end';
        
        const scoreDiv = document.createElement('div');
        scoreDiv.className = 'font-mono font-bold text-white';
        scoreDiv.textContent = p.score;
        rightSection.appendChild(scoreDiv);
        
        if (streakIcon) {
            const streakIconSpan = document.createElement('span');
            streakIconSpan.innerHTML = streakIcon;
            rightSection.appendChild(streakIconSpan);
        }
        
        mainContainer.appendChild(rightSection);
        item.appendChild(mainContainer);
        
        leaderboardList.appendChild(item);
    });
}

export function renderLeaderboard() {
    const allPlayers = [
        { name: playerName, score: myScore, streak: myStreak, isUser: true },
        ...realTimeScores,
        ...opponents
    ];
    
    // Render to main leaderboard (during game)
    renderLeaderboardToContainer('leaderboard-list', allPlayers);
    
    // Render to login leaderboard (on start screen) - without current player
    const loginPlayers = [
        ...realTimeScores,
        ...opponents
    ];
    renderLeaderboardToContainer('login-leaderboard', loginPlayers);
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

// Initialize leaderboard on page load
export async function initLeaderboard() {
    console.log('🔄 Initializing leaderboard...');
    await fetchRealScores();
    renderLeaderboard();
}
