// Metadata Panel Component
// =========================
// Displays all properties of selected entry including trigger details

const MetadataPanel = {
    name: 'MetadataPanel',
    props: {
        entry: {
            type: Object,
            default: null
        }
    },
    methods: {
        formatTrigger(trigger) {
            if (!trigger) return 'None';
            const parts = [`type: ${trigger.type}`];
            if (trigger.nodeId) parts.push(`nodeId: ${trigger.nodeId}`);
            if (trigger.resource) parts.push(`resource: ${trigger.resource}`);
            if (trigger.threshold !== undefined) parts.push(`threshold: ${trigger.threshold}`);
            if (trigger.comparison) parts.push(`comparison: ${trigger.comparison}`);
            if (trigger.level) parts.push(`level: ${trigger.level}`);
            if (trigger.branch) parts.push(`branch: ${trigger.branch}`);
            return parts.join('\n    ');
        }
    },
    template: `
        <div class="metadata-section" v-if="entry">
            <h3>METADATA</h3>
            <pre class="metadata-content">id: {{ entry.id }}
type: {{ entry.type }}
duration: {{ entry.duration }}ms
delay: {{ entry.delay || 0 }}
priority: {{ entry.priority || 'default' }}
persistAcrossAscension: {{ entry.persistAcrossAscension || false }}
trigger:
    {{ formatTrigger(entry.trigger) }}</pre>
        </div>
    `
};

export { MetadataPanel };
