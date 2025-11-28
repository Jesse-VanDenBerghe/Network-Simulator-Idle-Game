// PR Modal Component
// ===================
// Modal dialog for creating GitHub Pull Requests

const { ref, computed, watch } = Vue;

const PRModal = {
    name: 'PRModal',
    props: {
        show: { type: Boolean, default: false },
        dirtyFiles: { type: Array, default: () => [] },
        isLoading: { type: Boolean, default: false },
        error: { type: String, default: null },
        conflicts: { type: Array, default: () => [] }, // [{filename, hasConflict}]
        createdPR: { type: Object, default: null } // {number, html_url}
    },
    emits: ['close', 'submit', 'check-conflicts'],
    setup(props, { emit }) {
        // Form state
        const branchName = ref('');
        const title = ref('Update narrations');
        const description = ref('');

        // Generate default branch name
        function generateBranchName() {
            const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
            return `narration-updates-${date}`;
        }

        // Reset form when modal opens
        watch(() => props.show, (isOpen) => {
            if (isOpen) {
                branchName.value = generateBranchName();
                title.value = 'Update narrations';
                description.value = generateDefaultDescription();
                // Check for conflicts
                emit('check-conflicts');
            }
        });

        // Generate description from changes
        function generateDefaultDescription() {
            const lines = ['Story Editor updates:\n'];
            for (const file of props.dirtyFiles) {
                const c = file.changes;
                const parts = [];
                if (c.added > 0) parts.push(`+${c.added}`);
                if (c.deleted > 0) parts.push(`-${c.deleted}`);
                if (c.modified > 0) parts.push(`~${c.modified}`);
                lines.push(`- ${file.filename} (${parts.join(', ')})`);
            }
            return lines.join('\n');
        }

        // Computed: has any conflicts
        const hasConflicts = computed(() => {
            return props.conflicts.some(c => c.hasConflict);
        });

        // Computed: can submit
        const canSubmit = computed(() => {
            return branchName.value.trim() && 
                   title.value.trim() && 
                   props.dirtyFiles.length > 0 &&
                   !props.isLoading;
        });

        // Computed: is success state
        const isSuccess = computed(() => {
            return props.createdPR !== null;
        });

        function handleSubmit() {
            if (!canSubmit.value) return;
            emit('submit', {
                branchName: branchName.value.trim(),
                title: title.value.trim(),
                description: description.value.trim()
            });
        }

        function handleClose() {
            emit('close');
        }

        return {
            branchName,
            title,
            description,
            hasConflicts,
            canSubmit,
            isSuccess,
            handleSubmit,
            handleClose
        };
    },
    template: `
        <div v-if="show" class="modal-overlay" @click.self="handleClose">
            <div class="pr-modal">
                <!-- Header -->
                <div class="pr-modal-header">
                    <h2>{{ isSuccess ? '✅ Pull Request Created' : '📤 Create Pull Request' }}</h2>
                    <button class="close-btn" @click="handleClose">×</button>
                </div>

                <!-- Success State -->
                <div v-if="isSuccess" class="pr-modal-success">
                    <p>Your pull request has been created!</p>
                    <a :href="createdPR.html_url" target="_blank" class="pr-link">
                        🔗 View PR #{{ createdPR.number }}
                    </a>
                    <button class="primary-btn" @click="handleClose">Done</button>
                </div>

                <!-- Form State -->
                <div v-else class="pr-modal-body">
                    <!-- Branch Name -->
                    <div class="form-group">
                        <label for="branchName">Branch name</label>
                        <input 
                            id="branchName"
                            v-model="branchName"
                            type="text"
                            placeholder="narration-updates-1128"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Title -->
                    <div class="form-group">
                        <label for="prTitle">Title</label>
                        <input 
                            id="prTitle"
                            v-model="title"
                            type="text"
                            placeholder="Update narrations"
                            :disabled="isLoading"
                        />
                    </div>

                    <!-- Description -->
                    <div class="form-group">
                        <label for="prDescription">Description</label>
                        <textarea 
                            id="prDescription"
                            v-model="description"
                            rows="4"
                            placeholder="Describe your changes..."
                            :disabled="isLoading"
                        ></textarea>
                    </div>

                    <!-- File Changes List -->
                    <div class="form-group">
                        <label>Changes</label>
                        <div class="file-changes-list">
                            <div 
                                v-for="file in dirtyFiles" 
                                :key="file.filename"
                                class="file-change-item"
                            >
                                <span class="file-name">{{ file.filename }}</span>
                                <span class="change-stats">
                                    <span v-if="file.changes.added" class="stat added">+{{ file.changes.added }}</span>
                                    <span v-if="file.changes.deleted" class="stat deleted">-{{ file.changes.deleted }}</span>
                                    <span v-if="file.changes.modified" class="stat modified">~{{ file.changes.modified }}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Conflict Warnings -->
                    <div v-if="hasConflicts" class="conflict-warning">
                        <h4>⚠️ Conflicts Detected</h4>
                        <p>The following files have changed on the remote since you fetched them:</p>
                        <ul>
                            <li v-for="c in conflicts.filter(x => x.hasConflict)" :key="c.filename">
                                {{ c.filename }}
                            </li>
                        </ul>
                        <p class="conflict-note">Submitting will overwrite remote changes.</p>
                    </div>

                    <!-- Error -->
                    <div v-if="error" class="error-message">
                        ❌ {{ error }}
                    </div>

                    <!-- Actions -->
                    <div class="pr-modal-actions">
                        <button class="secondary-btn" @click="handleClose" :disabled="isLoading">
                            Cancel
                        </button>
                        <button 
                            class="primary-btn" 
                            @click="handleSubmit" 
                            :disabled="!canSubmit"
                        >
                            {{ isLoading ? 'Creating...' : (hasConflicts ? 'Create PR Anyway' : 'Create PR') }}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
};

export { PRModal };
