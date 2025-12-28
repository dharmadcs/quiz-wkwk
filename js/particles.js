// --- PARTICLE SYSTEM ---
const canvas = document.getElementById('particle-canvas');
const ctx = canvas.getContext('2d');
let particles = [];

export function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Particle {
    constructor(x, y, color, speed, size) {
        this.x = x; this.y = y; this.color = color;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = Math.random() * speed;
        this.size = Math.random() * size + 1;
        this.alpha = 1; this.decay = Math.random() * 0.02 + 0.01;
    }
    update() {
        this.x += Math.cos(this.angle) * this.velocity;
        this.y += Math.sin(this.angle) * this.velocity;
        this.alpha -= this.decay;
    }
    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

export function createExplosion(x, y, color) {
    for (let i = 0; i < 30; i++) {
        particles.push(new Particle(x, y, color, 4, 3));
    }
}

export function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].alpha <= 0) particles.splice(i, 1);
    }
    requestAnimationFrame(animateParticles);
}
animateParticles();
