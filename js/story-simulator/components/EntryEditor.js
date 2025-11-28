// Entry Editor Component
// =======================
// Form for editing narration entry fields

const EntryEditor = {
    name: 'EntryEditor',
    props: {
        entry: {
            type: Object,
            default: null
        },
        index: {
            type: Number,
            default: -1
        },
        isModified: {
            type: Boolean,
            default: false
        },
        allEntryIds: {
            type: Array,
            default: () => []
        }
    },
    emits: ['update', 'delete', 'duplicate', 'revert'],
    data() {
        return {
            // All available trigger types
            triggerTypes: [
                { value: 'onFirstLaunch', label: 'On First Launch' },
                { value: 'onNodeUnlocked', label: 'On Node Unlocked', fields: ['nodeId'] },
                { value: 'onNodeLevelReached', label: 'On Node Level Reached', fields: ['nodeId', 'level'] },
                { value: 'onResourceAmountReached', label: 'On Resource Amount', fields: ['resource', 'threshold', 'comparison'] },
                { value: 'onBranchUnlocked', label: 'On Branch Unlocked', fields: ['branch'] },
                { value: 'onFeatureUnlocked', label: 'On Feature Unlocked', fields: ['feature'] },
                { value: 'onTierReached', label: 'On Tier Reached', fields: ['tier'] },
                { value: 'onAscension', label: 'On Ascension', fields: ['count'] },
                { value: 'onOfflineReturn', label: 'On Offline Return', fields: ['offlineSeconds'] },
                { value: 'onIdleTime', label: 'On Idle Time', fields: ['idleSeconds'] }
            ],
            // Notification types
            notificationTypes: [
                { value: 'narration', label: 'Narration' },
                { value: 'hint', label: 'Hint' },
                { value: 'achievement', label: 'Achievement' },
                { value: 'terminal', label: 'Terminal' },
                { value: 'info', label: 'Info' }
            ],
            // Comparison operators
            comparisons: [
                { value: '>=', label: '>=' },
                { value: '<=', label: '<=' },
                { value: '==', label: '==' },
                { value: '>', label: '>' },
                { value: '<', label: '<' }
            ]
        };
    },
    computed: {
        currentTriggerType() {
            return this.triggerTypes.find(t => t.value === this.entry?.trigger?.type);
        },
        triggerFields() {
            return this.currentTriggerType?.fields || [];
        },
        // Validation computed properties
        validationErrors() {
            const errors = {};
            if (!this.entry) return errors;
            
            // ID is required
            if (!this.entry.id || !this.entry.id.trim()) {
                errors.id = 'ID is required';
            } else if (this.isDuplicateId) {
                errors.id = 'ID must be unique';
            } else if (!/^[a-z_][a-z0-9_]*$/i.test(this.entry.id)) {
                errors.id = 'ID must be alphanumeric with underscores';
            }
            
            // Message is required
            if (!this.entry.message || !this.entry.message.trim()) {
                errors.message = 'Message is required';
            }
            
            // Duration must be positive
            if (!this.entry.duration || this.entry.duration < 1000) {
                errors.duration = 'Min 1000ms';
            }
            
            // Trigger-specific validation
            const trigger = this.entry.trigger;
            if (trigger) {
                if (this.triggerFields.includes('nodeId') && (!trigger.nodeId || !trigger.nodeId.trim())) {
                    errors.nodeId = 'Node ID is required';
                }
                if (this.triggerFields.includes('branch') && (!trigger.branch || !trigger.branch.trim())) {
                    errors.branch = 'Branch is required';
                }
                if (this.triggerFields.includes('feature') && (!trigger.feature || !trigger.feature.trim())) {
                    errors.feature = 'Feature is required';
                }
                if (this.triggerFields.includes('resource') && (!trigger.resource || !trigger.resource.trim())) {
                    errors.resource = 'Resource is required';
                }
            }
            
            return errors;
        },
        isDuplicateId() {
            if (!this.entry || !this.entry.id) return false;
            // Check if this ID exists in other entries (excluding current)
            return this.allEntryIds.filter(id => id === this.entry.id).length > 1;
        },
        hasErrors() {
            return Object.keys(this.validationErrors).length > 0;
        }
    },
    methods: {
        updateField(path, value) {
            this.$emit('update', this.index, path, value);
        },
        updateTriggerType(newType) {
            // When trigger type changes, reset trigger fields
            const newTrigger = { type: newType };
            this.$emit('update', this.index, 'trigger', newTrigger);
        }
    },
    template: `
        <div class="entry-editor" v-if="entry">
            <div class="editor-header">
                <h3>
                    Edit Entry
                    <span v-if="isModified" class="modified-badge">●</span>
                </h3>
                <div class="editor-actions">
                    <button 
                        v-if="isModified"
                        class="btn-icon" 
                        @click="$emit('revert', index)" 
                        title="Revert changes"
                    >
                        ↩️
                    </button>
                    <button class="btn-icon" @click="$emit('duplicate', index)" title="Duplicate">
                        📋
                    </button>
                    <button class="btn-icon btn-danger" @click="$emit('delete', index)" title="Delete">
                        🗑️
                    </button>
                </div>
            </div>
            
            <div class="editor-body">
                <!-- Validation summary -->
                <div v-if="hasErrors" class="validation-summary">
                    ⚠️ {{ Object.keys(validationErrors).length }} validation error(s)
                </div>
                
                <!-- ID -->
                <div class="field-row" :class="{ 'has-error': validationErrors.id }">
                    <label>ID:</label>
                    <input 
                        type="text" 
                        :value="entry.id"
                        @input="updateField('id', $event.target.value)"
                        placeholder="unique_entry_id"
                        :class="{ invalid: validationErrors.id }"
                    />
                    <span v-if="validationErrors.id" class="field-error">{{ validationErrors.id }}</span>
                </div>
                
                <!-- Type -->
                <div class="field-row">
                    <label>Type:</label>
                    <select 
                        :value="entry.type"
                        @change="updateField('type', $event.target.value)"
                    >
                        <option v-for="t in notificationTypes" :key="t.value" :value="t.value">
                            {{ t.label }}
                        </option>
                    </select>
                </div>
                
                <!-- Message -->
                <div class="field-row field-full" :class="{ 'has-error': validationErrors.message }">
                    <label>Message:</label>
                    <textarea 
                        :value="entry.message"
                        @input="updateField('message', $event.target.value)"
                        placeholder="Your narration text..."
                        rows="4"
                        :class="{ invalid: validationErrors.message }"
                    ></textarea>
                    <span v-if="validationErrors.message" class="field-error">{{ validationErrors.message }}</span>
                </div>
                
                <!-- Duration / Delay / Priority row -->
                <div class="field-row-group">
                    <div class="field-row" :class="{ 'has-error': validationErrors.duration }">
                        <label>Duration (ms):</label>
                        <input 
                            type="number" 
                            :value="entry.duration"
                            @input="updateField('duration', parseInt($event.target.value) || 8000)"
                            min="1000"
                            step="1000"
                            :class="{ invalid: validationErrors.duration }"
                        />
                        <span v-if="validationErrors.duration" class="field-error">{{ validationErrors.duration }}</span>
                    </div>
                    <div class="field-row">
                        <label>Delay (ms):</label>
                        <input 
                            type="number" 
                            :value="entry.delay || 0"
                            @input="updateField('delay', parseInt($event.target.value) || 0)"
                            min="0"
                            step="500"
                        />
                    </div>
                    <div class="field-row">
                        <label>Priority:</label>
                        <input 
                            type="number" 
                            :value="entry.priority"
                            @input="updateField('priority', parseInt($event.target.value) || 5)"
                            min="1"
                            max="100"
                        />
                    </div>
                </div>
                
                <!-- Persist checkbox -->
                <div class="field-row field-checkbox">
                    <label>
                        <input 
                            type="checkbox" 
                            :checked="entry.persistAcrossAscension"
                            @change="updateField('persistAcrossAscension', $event.target.checked)"
                        />
                        Persist across ascension
                    </label>
                </div>
                
                <!-- Trigger Section -->
                <div class="trigger-section">
                    <h4>Trigger</h4>
                    
                    <div class="field-row">
                        <label>Type:</label>
                        <select 
                            :value="entry.trigger?.type"
                            @change="updateTriggerType($event.target.value)"
                        >
                            <option v-for="t in triggerTypes" :key="t.value" :value="t.value">
                                {{ t.label }}
                            </option>
                        </select>
                    </div>
                    
                    <!-- Dynamic trigger fields -->
                    <div v-if="triggerFields.includes('nodeId')" class="field-row" :class="{ 'has-error': validationErrors.nodeId }">
                        <label>Node ID:</label>
                        <input 
                            type="text" 
                            :value="entry.trigger?.nodeId"
                            @input="updateField('trigger.nodeId', $event.target.value)"
                            placeholder="e.g., hand_crank"
                            :class="{ invalid: validationErrors.nodeId }"
                        />
                        <span v-if="validationErrors.nodeId" class="field-error">{{ validationErrors.nodeId }}</span>
                    </div>
                    
                    <div v-if="triggerFields.includes('level')" class="field-row">
                        <label>Level:</label>
                        <input 
                            type="number" 
                            :value="entry.trigger?.level"
                            @input="updateField('trigger.level', parseInt($event.target.value) || 1)"
                            min="1"
                        />
                    </div>
                    
                    <div v-if="triggerFields.includes('branch')" class="field-row" :class="{ 'has-error': validationErrors.branch }">
                        <label>Branch:</label>
                        <input 
                            type="text" 
                            :value="entry.trigger?.branch"
                            @input="updateField('trigger.branch', $event.target.value)"
                            placeholder="e.g., computer"
                            :class="{ invalid: validationErrors.branch }"
                        />
                        <span v-if="validationErrors.branch" class="field-error">{{ validationErrors.branch }}</span>
                    </div>
                    
                    <div v-if="triggerFields.includes('feature')" class="field-row" :class="{ 'has-error': validationErrors.feature }">
                        <label>Feature:</label>
                        <input 
                            type="text" 
                            :value="entry.trigger?.feature"
                            @input="updateField('trigger.feature', $event.target.value)"
                            placeholder="e.g., dataProcessing"
                            :class="{ invalid: validationErrors.feature }"
                        />
                        <span v-if="validationErrors.feature" class="field-error">{{ validationErrors.feature }}</span>
                    </div>
                    
                    <div v-if="triggerFields.includes('tier')" class="field-row">
                        <label>Tier:</label>
                        <input 
                            type="number" 
                            :value="entry.trigger?.tier"
                            @input="updateField('trigger.tier', parseInt($event.target.value) || 1)"
                            min="0"
                            max="8"
                        />
                    </div>
                    
                    <div v-if="triggerFields.includes('resource')" class="field-row" :class="{ 'has-error': validationErrors.resource }">
                        <label>Resource:</label>
                        <input 
                            type="text" 
                            :value="entry.trigger?.resource"
                            @input="updateField('trigger.resource', $event.target.value)"
                            placeholder="e.g., energy"
                            :class="{ invalid: validationErrors.resource }"
                        />
                        <span v-if="validationErrors.resource" class="field-error">{{ validationErrors.resource }}</span>
                    </div>
                    
                    <div v-if="triggerFields.includes('threshold')" class="field-row-group">
                        <div class="field-row">
                            <label>Threshold:</label>
                            <input 
                                type="number" 
                                :value="entry.trigger?.threshold"
                                @input="updateField('trigger.threshold', parseFloat($event.target.value) || 0)"
                            />
                        </div>
                        <div class="field-row">
                            <label>Comparison:</label>
                            <select 
                                :value="entry.trigger?.comparison || '>='"
                                @change="updateField('trigger.comparison', $event.target.value)"
                            >
                                <option v-for="c in comparisons" :key="c.value" :value="c.value">
                                    {{ c.label }}
                                </option>
                            </select>
                        </div>
                    </div>
                    
                    <div v-if="triggerFields.includes('count')" class="field-row">
                        <label>Ascension Count:</label>
                        <input 
                            type="number" 
                            :value="entry.trigger?.count"
                            @input="updateField('trigger.count', parseInt($event.target.value) || 1)"
                            min="1"
                        />
                    </div>
                    
                    <div v-if="triggerFields.includes('offlineSeconds')" class="field-row">
                        <label>Offline Seconds:</label>
                        <input 
                            type="number" 
                            :value="entry.trigger?.offlineSeconds"
                            @input="updateField('trigger.offlineSeconds', parseInt($event.target.value) || 60)"
                            min="1"
                        />
                    </div>
                    
                    <div v-if="triggerFields.includes('idleSeconds')" class="field-row">
                        <label>Idle Seconds:</label>
                        <input 
                            type="number" 
                            :value="entry.trigger?.idleSeconds"
                            @input="updateField('trigger.idleSeconds', parseInt($event.target.value) || 60)"
                            min="1"
                        />
                    </div>
                </div>
            </div>
        </div>
        
        <div class="entry-editor empty" v-else>
            <p>No entry selected</p>
        </div>
    `
};

export { EntryEditor };
