// GitHub Settings Component
// ==========================
// Auth and repo configuration panel with offline indicator

const { ref, onMounted, onUnmounted } = Vue;

const GitHubSettings = {
    name: 'GitHubSettings',
    props: {
        token: { type: String, default: '' },
        owner: { type: String, default: '' },
        repo: { type: String, default: '' },
        baseBranch: { type: String, default: 'main' },
        branches: { type: Array, default: () => [] },
        isConnected: { type: Boolean, default: false },
        isLoading: { type: Boolean, default: false },
        error: { type: String, default: null }
    },
    emits: [
        'update:token',
        'update:owner',
        'update:repo',
        'update:baseBranch',
        'connect',
        'disconnect'
    ],
    setup() {
        const isOnline = ref(navigator.onLine);
        
        function handleOnline() {
            isOnline.value = true;
        }
        function handleOffline() {
            isOnline.value = false;
        }
        
        onMounted(() => {
            window.addEventListener('online', handleOnline);
            window.addEventListener('offline', handleOffline);
        });
        
        onUnmounted(() => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        });
        
        return { isOnline };
    },
    data() {
        return {
            isExpanded: !this.isConnected,
            showToken: false
        };
    },
    watch: {
        // Auto-collapse when connected (e.g., after auto-connect)
        isConnected(connected) {
            if (connected) {
                this.isExpanded = false;
            }
        }
    },
    computed: {
        repoValue() {
            if (this.owner && this.repo) {
                return `${this.owner}/${this.repo}`;
            }
            return '';
        },
        statusText() {
            if (!this.isOnline) return 'Offline';
            if (this.isLoading) return 'Connecting...';
            if (this.isConnected) return 'Connected';
            return 'Not connected';
        },
        statusClass() {
            if (!this.isOnline) return 'offline';
            if (this.isLoading) return 'loading';
            if (this.isConnected) return 'connected';
            return 'disconnected';
        }
    },
    methods: {
        onRepoInput(e) {
            const value = e.target.value;
            const parts = value.split('/');
            if (parts.length >= 2) {
                this.$emit('update:owner', parts[0].trim());
                this.$emit('update:repo', parts.slice(1).join('/').trim());
            } else {
                this.$emit('update:owner', value.trim());
                this.$emit('update:repo', '');
            }
        }
    },
    template: `
        <div class="github-settings" :class="{ collapsed: !isExpanded }">
            <div class="settings-header" @click="isExpanded = !isExpanded">
                <span class="settings-icon">⚙️</span>
                <span class="settings-title">GitHub Settings</span>
                <span class="status-indicator" :class="statusClass">●</span>
                <span class="expand-icon">{{ isExpanded ? '▼' : '▶' }}</span>
            </div>
            
            <div v-if="isExpanded" class="settings-body">
                <div class="setting-row">
                    <label>Repo:</label>
                    <input 
                        type="text" 
                        :value="repoValue"
                        @input="onRepoInput"
                        placeholder="owner/repo"
                        :disabled="isConnected"
                    />
                </div>
                
                <div class="setting-row">
                    <label>Token:</label>
                    <div class="token-input">
                        <input 
                            :type="showToken ? 'text' : 'password'" 
                            :value="token"
                            @input="$emit('update:token', $event.target.value)"
                            placeholder="ghp_xxxx..."
                            :disabled="isConnected"
                        />
                        <button 
                            class="toggle-visibility"
                            @click="showToken = !showToken"
                            type="button"
                        >
                            {{ showToken ? '👁️' : '👁️‍🗨️' }}
                        </button>
                    </div>
                </div>
                
                <div class="setting-row" v-if="isConnected && branches.length > 0">
                    <label>Branch:</label>
                    <select 
                        :value="baseBranch"
                        @change="$emit('update:baseBranch', $event.target.value)"
                    >
                        <option v-for="branch in branches" :key="branch" :value="branch">
                            {{ branch }}
                        </option>
                    </select>
                </div>
                
                <div class="setting-row actions">
                    <button 
                        v-if="!isConnected"
                        class="connect-btn"
                        @click="$emit('connect')"
                        :disabled="isLoading || !repoValue || !isOnline"
                        :title="!isOnline ? 'Cannot connect while offline' : ''"
                    >
                        {{ isLoading ? 'Connecting...' : 'Connect' }}
                    </button>
                    <button 
                        v-else
                        class="disconnect-btn"
                        @click="$emit('disconnect')"
                    >
                        Disconnect
                    </button>
                </div>
                
                <!-- Offline warning -->
                <div v-if="!isOnline" class="setting-row offline-warning">
                    <span class="offline-text">📡 No internet connection</span>
                </div>
                
                <div class="setting-row status">
                    <span class="status-text" :class="statusClass">{{ statusText }}</span>
                </div>
                
                <div v-if="error" class="setting-row error">
                    <span class="error-text">⚠️ {{ error }}</span>
                </div>
            </div>
        </div>
    `
};

export { GitHubSettings };
