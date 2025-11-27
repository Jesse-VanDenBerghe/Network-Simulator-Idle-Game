// CrankButton Component - Visual crank that rotates when turned
const CrankButton = {
    name: 'CrankButton',
    props: {
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false },
        broken: { type: Boolean, default: false }, // Handle snapped off
        automated: { type: Boolean, default: false }, // Auto-rotating with cog
        progress: { type: Number, default: null } // 0-100, null = no progress bar
    },
    emits: ['click'],
    data() {
        return {
            rotation: 0,
            isAnimating: false,
            autoRotateInterval: null
        };
    },
    computed: {
        showProgress() {
            return this.progress !== null && this.progress >= 0;
        },
        crankStyle() {
            return {
                transform: `rotate(${this.rotation}deg)`
            };
        },
        statusText() {
            if (this.locked) return 'Broken Crank';
            if (this.broken) return 'Handle Snapped!';
            if (this.automated) return 'Auto Crank';
            return 'Turn Crank';
        }
    },
    watch: {
        automated: {
            immediate: true,
            handler(val) {
                if (val) {
                    this.startAutoRotate();
                } else {
                    this.stopAutoRotate();
                }
            }
        }
    },
    beforeUnmount() {
        this.stopAutoRotate();
    },
    methods: {
        handleClick() {
            if (this.disabled || this.locked || this.broken || this.automated) return;
            
            // Rotate crank 360 degrees per click
            this.isAnimating = true;
            this.rotation += 360;
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 400);
            
            this.$emit('click');
        },
        startAutoRotate() {
            if (this.autoRotateInterval) return;
            this.autoRotateInterval = setInterval(() => {
                this.rotation += 360;
            }, 1000);
        },
        stopAutoRotate() {
            if (this.autoRotateInterval) {
                clearInterval(this.autoRotateInterval);
                this.autoRotateInterval = null;
            }
        }
    },
    template: `
        <button 
            class="crank-btn" 
            :class="{ locked: locked, broken: broken, automated: automated, 'has-progress': showProgress, animating: isAnimating }"
            :disabled="disabled || locked || broken"
            @click="handleClick"
        >
            <div v-if="showProgress" class="crank-progress-bar" :style="{ width: progress + '%' }"></div>
            <div class="crank-container">
                <!-- Cog gear behind crank when automated -->
                <div class="crank-cog" v-if="automated"></div>
                <div class="crank-body">
                    <div class="crank-axle"></div>
                    <div class="crank-arm" :class="{ 'auto-rotating': automated }" :style="crankStyle">
                        <div class="crank-handle" v-if="!broken"></div>
                        <div class="crank-handle-stub" v-if="broken"></div>
                    </div>
                </div>
                <!-- Fallen handle when broken -->
                <div class="crank-handle-fallen" v-if="broken"></div>
            </div>
            <div class="crank-info">
                <span class="crank-text">{{ statusText }}</span>
                <span class="crank-value">{{ value }}</span>
            </div>
        </button>
    `
};
