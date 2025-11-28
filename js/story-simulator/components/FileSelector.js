// File Selector Component
// ========================
// Dropdown for selecting narration files with entry counts

const FileSelector = {
    name: 'FileSelector',
    props: {
        files: {
            type: Array,
            required: true
        },
        modelValue: {
            type: String,
            default: null
        }
    },
    emits: ['update:modelValue'],
    template: `
        <div class="file-selector">
            <label>Select File:</label>
            <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)">
                <option v-for="file in files" :key="file.filename" :value="file.filename">
                    {{ file.label }} ({{ file.count }})
                </option>
            </select>
        </div>
    `
};

export { FileSelector };
