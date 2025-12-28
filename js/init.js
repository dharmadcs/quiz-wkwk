// --- APP INITIALIZATION ---
import { initLeaderboard, fetchRealScores } from './leaderboard.js';
import { playerAvatars } from './config.js';
import { selectAvatar } from './game.js';

let selectedAvatar = playerAvatars[0].icon;
let isFirstRender = true; // Flag to prevent animation replay

// Render avatar selection grid
function renderAvatarSelection() {
    const container = document.getElementById('avatar-selection');
    if (!container) return;

    container.innerHTML = '';

    playerAvatars.forEach((avatar, index) => {
        const avatarEl = document.createElement('div');
        avatarEl.className = `avatar-option ${index === 0 ? 'selected' : ''}`;
        avatarEl.dataset.avatar = avatar.icon;
        avatarEl.innerHTML = `
            <img src="${avatar.icon}" alt="Avatar" class="avatar-selection-img" />
        `;

        avatarEl.addEventListener('click', () => {
            // Remove selected class from all avatars
            document.querySelectorAll('.avatar-option').forEach(el => {
                el.classList.remove('selected');
            });
            
            // Add selected class to clicked avatar
            avatarEl.classList.add('selected');
            selectedAvatar = avatar.icon;
            selectAvatar(avatar.icon);
            
            // Play click sound if audio is initialized
            const audioContext = window.gameAudioContext;
            if (audioContext) {
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                oscillator.frequency.value = 800;
                oscillator.type = 'sine';
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        });

        container.appendChild(avatarEl);
    });
}


// Initialize app when page loads
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 App initialized');
    
    // Render avatar selection
    renderAvatarSelection();
    
    // Initialize leaderboard (this will render to both containers)
    await initLeaderboard();
});
