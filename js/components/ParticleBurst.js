// ParticleBurst Component - Creates particle explosion effects on click
const ParticleBurst = {
    name: 'ParticleBurst',
    data() {
        return {
            particles: []
        };
    },
    methods: {
        // Call this method to trigger a burst at x, y position relative to container
        burst(x, y, options = {}) {
            const {
                count = 8,
                color = '#00ffaa',
                secondaryColor = '#00aaff',
                spread = 60,
                size = 6,
                duration = 600
            } = options;

            const newParticles = [];
            
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.5;
                const velocity = spread + Math.random() * 20;
                const particleSize = size + Math.random() * 4;
                
                newParticles.push({
                    id: Date.now() + i + Math.random(),
                    x,
                    y,
                    vx: Math.cos(angle) * velocity,
                    vy: Math.sin(angle) * velocity,
                    size: particleSize,
                    color: Math.random() > 0.5 ? color : secondaryColor,
                    opacity: 1,
                    rotation: Math.random() * 360
                });
            }
            
            this.particles.push(...newParticles);
            
            // Animate particles
            const startTime = performance.now();
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = elapsed / duration;
                
                if (progress >= 1) {
                    // Remove these particles
                    const ids = new Set(newParticles.map(p => p.id));
                    this.particles = this.particles.filter(p => !ids.has(p.id));
                    return;
                }
                
                // Update particle positions with easing
                const easeOut = 1 - Math.pow(1 - progress, 3);
                newParticles.forEach(p => {
                    p.currentX = p.x + p.vx * easeOut;
                    p.currentY = p.y + p.vy * easeOut - (progress * 30); // slight upward drift
                    p.currentOpacity = 1 - progress;
                    p.currentScale = 1 - progress * 0.5;
                    p.currentRotation = p.rotation + progress * 180;
                });
                
                this.$forceUpdate();
                requestAnimationFrame(animate);
            };
            
            requestAnimationFrame(animate);
        }
    },
    template: `
        <div class="particle-container">
            <div
                v-for="particle in particles"
                :key="particle.id"
                class="particle"
                :style="{
                    left: (particle.currentX || particle.x) + 'px',
                    top: (particle.currentY || particle.y) + 'px',
                    width: particle.size + 'px',
                    height: particle.size + 'px',
                    backgroundColor: particle.color,
                    opacity: particle.currentOpacity || particle.opacity,
                    transform: 'translate(-50%, -50%) scale(' + (particle.currentScale || 1) + ') rotate(' + (particle.currentRotation || particle.rotation) + 'deg)',
                    boxShadow: '0 0 ' + (particle.size * 2) + 'px ' + particle.color
                }"
            ></div>
        </div>
    `
};
