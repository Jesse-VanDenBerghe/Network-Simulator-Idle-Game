// GitHub Integration Composable
// ==============================
// Handles GitHub API auth, file operations, and PR creation

const { reactive, computed, readonly, toRefs } = Vue;

const STORAGE_KEY = 'story-editor-github';
const DEFAULT_OWNER = 'Jesse-VanDenBerghe';
const DEFAULT_REPO = 'Network-Simulator-Idle-Game';

/**
 * GitHub API composable for story editor
 */
function useGitHub() {
    // State persisted to localStorage
    const state = reactive({
        token: '',
        owner: DEFAULT_OWNER,
        repo: DEFAULT_REPO,
        baseBranch: 'main',
        branches: [],
        isConnected: false,
        isLoading: false,
        error: null
    });

    // Load saved settings
    function loadSettings() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                state.token = (parsed.token || '').trim();
                state.owner = (parsed.owner || DEFAULT_OWNER).trim();
                state.repo = (parsed.repo || DEFAULT_REPO).trim();
                state.baseBranch = parsed.baseBranch || 'main';
            }
        } catch (e) {
            console.warn('Failed to load GitHub settings:', e);
        }
    }

    // Save settings to localStorage
    function saveSettings() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({
                token: state.token.trim(),
                owner: state.owner.trim(),
                repo: state.repo.trim(),
                baseBranch: state.baseBranch
            }));
        } catch (e) {
            console.warn('Failed to save GitHub settings:', e);
        }
    }

    // Clear error
    function clearError() {
        state.error = null;
    }

    // API request helper
    async function api(path, options = {}) {
        const url = `https://api.github.com${path}`;
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            ...options.headers
        };

        if (state.token) {
            headers['Authorization'] = `Bearer ${state.token}`;
        }

        // Add Content-Type for requests with body
        if (options.body) {
            headers['Content-Type'] = 'application/json';
        }

        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const error = new Error(errorData.message || `GitHub API error: ${response.status}`);
            error.status = response.status;
            error.data = errorData;
            throw error;
        }

        return response.json();
    }

    // Test connection and fetch branches
    async function connect() {
        if (!state.owner || !state.repo) {
            state.error = 'Owner and repo required';
            return false;
        }

        state.isLoading = true;
        state.error = null;

        try {
            // Test access by fetching repo info
            await api(`/repos/${state.owner}/${state.repo}`);

            // Fetch branches
            const branchData = await api(`/repos/${state.owner}/${state.repo}/branches`);
            state.branches = branchData.map(b => b.name);

            // Validate base branch exists
            if (!state.branches.includes(state.baseBranch)) {
                state.baseBranch = state.branches[0] || 'main';
            }

            state.isConnected = true;
            saveSettings();
            return true;
        } catch (e) {
            state.error = e.message;
            state.isConnected = false;
            return false;
        } finally {
            state.isLoading = false;
        }
    }

    // Disconnect / clear auth
    function disconnect() {
        state.isConnected = false;
        state.branches = [];
    }

    /**
     * List files in a directory
     * @param {string} path - repo path (e.g., 'js/data/notifications/narration')
     * @returns {Promise<Array<{name, path, sha, type}>>}
     */
    async function listFiles(path) {
        if (!state.isConnected) {
            throw new Error('Not connected to GitHub');
        }

        const data = await api(`/repos/${state.owner}/${state.repo}/contents/${path}?ref=${state.baseBranch}`);

        // Filter to only .js files
        return data
            .filter(item => item.type === 'file' && item.name.endsWith('.js'))
            .map(item => ({
                name: item.name,
                path: item.path,
                sha: item.sha,
                type: item.type
            }));
    }

    /**
     * Read a file's content
     * @param {string} path - full repo path
     * @returns {Promise<{content: string, sha: string, entries: Array}>}
     */
    async function readFile(path) {
        if (!state.isConnected) {
            throw new Error('Not connected to GitHub');
        }

        const data = await api(`/repos/${state.owner}/${state.repo}/contents/${path}?ref=${state.baseBranch}`);

        // Decode base64 content
        const content = atob(data.content.replace(/\n/g, ''));

        // Parse JS to extract entries array
        const entries = parseNarrationFile(content);

        return {
            content,
            sha: data.sha,
            entries
        };
    }

    /**
     * Parse narration JS file content to extract entries array
     * Uses regex to find exported array - handles standard format
     * @param {string} content - raw JS file content
     * @returns {Array} parsed entries
     */
    function parseNarrationFile(content) {
        try {
            // Find export statement: export const xxxNarrations = [...]
            const exportMatch = content.match(/export\s+const\s+(\w+Narrations)\s*=\s*\[/);
            if (!exportMatch) {
                console.warn('No narrations export found');
                return [];
            }

            // Find the array content - balance brackets
            const startIdx = content.indexOf('[', exportMatch.index);
            let depth = 0;
            let endIdx = startIdx;

            for (let i = startIdx; i < content.length; i++) {
                if (content[i] === '[') depth++;
                else if (content[i] === ']') {
                    depth--;
                    if (depth === 0) {
                        endIdx = i + 1;
                        break;
                    }
                }
            }

            const arrayStr = content.slice(startIdx, endIdx);

            // Convert to valid JSON-ish format for eval
            // Replace all constant references with their actual string values
            let normalized = arrayStr
                .replace(/NotificationType\.(\w+)/g, (_, name) => {
                    // Map enum names to actual values
                    const types = {
                        INFO: '"info"',
                        ERROR: '"error"',
                        SUCCESS: '"success"',
                        NARRATION: '"narration"',
                        NODE_UNLOCK: '"node_unlock"',
                        HINT: '"hint"',
                        ACHIEVEMENT: '"achievement"',
                        TERMINAL: '"terminal"'
                    };
                    return types[name] || `"${name.toLowerCase()}"`;
                })
                .replace(/TriggerType\.(\w+)/g, (_, name) => {
                    // Map enum names to actual values
                    const triggers = {
                        ON_FIRST_LAUNCH: '"onFirstLaunch"',
                        ON_NODE_UNLOCKED: '"onNodeUnlocked"',
                        ON_NODE_LEVEL_REACHED: '"onNodeLevelReached"',
                        ON_RESOURCE_AMOUNT_REACHED: '"onResourceAmountReached"',
                        ON_BRANCH_UNLOCKED: '"onBranchUnlocked"',
                        ON_FEATURE_UNLOCKED: '"onFeatureUnlocked"',
                        ON_TIER_REACHED: '"onTierReached"',
                        ON_ASCENSION: '"onAscension"',
                        ON_OFFLINE_RETURN: '"onOfflineReturn"',
                        ON_IDLE_TIME: '"onIdleTime"'
                    };
                    return triggers[name] || `"${name}"`;
                })
                .replace(/NotificationDurations\.(\w+)/g, (_, name) => {
                    // Map known duration constants to values
                    const durations = {
                        NARRATION_SHORT: 6000,
                        NARRATION_MEDIUM: 10000,
                        NARRATION_LONG: 15000,
                        HINT_SHORT: 5000,
                        HINT_MEDIUM: 8000
                    };
                    return durations[name] || 8000;
                })
                .replace(/ComparisonOperator\.(\w+)/g, (_, name) => {
                    const ops = {
                        GREATER_EQUAL: '">="',
                        LESS_EQUAL: '"<="',
                        EQUAL: '"=="',
                        GREATER: '">"',
                        LESS: '"<"'
                    };
                    return ops[name] || '">="';
                });

            // Use Function constructor to safely evaluate (no global access)
            const entries = new Function(`return ${normalized}`)();
            return entries;
        } catch (e) {
            console.error('Failed to parse narration file:', e);
            return [];
        }
    }

    /**
     * Get the latest commit SHA for base branch
     * @returns {Promise<string>}
     */
    async function getBaseBranchSha() {
        const ref = await api(`/repos/${state.owner}/${state.repo}/git/refs/heads/${state.baseBranch}`);
        return ref.object.sha;
    }

    /**
     * Create a new branch from base
     * @param {string} branchName
     * @returns {Promise<string>} - new branch SHA
     */
    async function createBranch(branchName) {
        const baseSha = await getBaseBranchSha();

        await api(`/repos/${state.owner}/${state.repo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify({
                ref: `refs/heads/${branchName}`,
                sha: baseSha
            })
        });

        return baseSha;
    }

    /**
     * Update/create a file on a branch
     * @param {string} path - file path
     * @param {string} content - new content
     * @param {string} message - commit message
     * @param {string} branch - target branch
     * @param {string} sha - existing file SHA (for updates)
     * @returns {Promise<{sha: string}>}
     */
    async function updateFile(path, content, message, branch, sha = null) {
        const body = {
            message,
            content: btoa(content),
            branch
        };

        if (sha) {
            body.sha = sha;
        }

        const result = await api(`/repos/${state.owner}/${state.repo}/contents/${path}`, {
            method: 'PUT',
            body: JSON.stringify(body)
        });

        return { sha: result.content.sha };
    }

    /**
     * Create a pull request
     * @param {Object} options
     * @param {string} options.title
     * @param {string} options.body
     * @param {string} options.head - source branch
     * @param {string} options.base - target branch
     * @returns {Promise<{number: number, html_url: string}>}
     */
    async function createPullRequest({ title, body, head, base }) {
        const result = await api(`/repos/${state.owner}/${state.repo}/pulls`, {
            method: 'POST',
            body: JSON.stringify({ title, body, head, base })
        });

        return {
            number: result.number,
            html_url: result.html_url
        };
    }

    /**
     * Check if a file has changed since we fetched it
     * @param {string} path
     * @param {string} knownSha
     * @returns {Promise<boolean>}
     */
    async function hasFileChanged(path, knownSha) {
        try {
            const data = await api(`/repos/${state.owner}/${state.repo}/contents/${path}?ref=${state.baseBranch}`);
            return data.sha !== knownSha;
        } catch (e) {
            // If file doesn't exist, it hasn't "changed"
            if (e.status === 404) return false;
            throw e;
        }
    }

    // Initialize
    loadSettings();

    return {
        // State (readonly externally)
        ...toRefs(readonly(state)),

        // Mutable state setters
        setToken: (v) => { state.token = v; },
        setOwner: (v) => { state.owner = v; },
        setRepo: (v) => { state.repo = v; },
        setBaseBranch: (v) => { state.baseBranch = v; },

        // Actions
        connect,
        disconnect,
        clearError,
        saveSettings,

        // File operations
        listFiles,
        readFile,
        hasFileChanged,

        // PR operations
        createBranch,
        updateFile,
        createPullRequest,
        getBaseBranchSha
    };
}

export { useGitHub };
