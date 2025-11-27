// CrankButton Component - Visual crank that rotates when turned
const CrankButton = {
    name: 'CrankButton',
    props: {
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false },
        broken: { type: Boolean, default: false }, // Handle snapped off
        progress: { type: Number, default: null } // 0-100, null = no progress bar
    },
    emits: ['click'],
    data() {
        return {
            rotation: 0,
            isAnimating: false
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
            return 'Turn Crank';
        }
    },
    methods: {
        handleClick() {
            if (this.disabled || this.locked || this.broken) return;
            
            // Rotate crank 360 degrees per click
            this.isAnimating = true;
            this.rotation += 360;
            
            setTimeout(() => {
                this.isAnimating = false;
            }, 400);
            
            this.$emit('click');
        }
    },
    template: `
        <button 
            class="crank-btn" 
            :class="{ locked: locked, broken: broken, 'has-progress': showProgress, animating: isAnimating }"
            :disabled="disabled || locked || broken"
            @click="handleClick"
        >
            <div v-if="showProgress" class="crank-progress-bar" :style="{ width: progress + '%' }"></div>
            <div class="crank-container">
                <div class="crank-body">
                    <div class="crank-axle"></div>
                    <div class="crank-arm" :style="crankStyle">
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
