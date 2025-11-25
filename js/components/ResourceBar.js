// ResourceBar Component - Displays a single resource
const ResourceBar = {
    name: 'ResourceBar',
    props: {
        icon: { type: String, required: true },
        name: { type: String, required: true },
        amount: { type: Number, required: true },
        rate: { type: Number, default: 0 },
        visible: { type: Boolean, default: true }
    },
    computed: {
        formattedAmount() {
            return GameData.formatNumber(Math.floor(this.amount));
        },
        formattedRate() {
            return GameData.formatNumber(this.rate);
        }
    },
    template: `
        <div class="resource" v-if="visible">
            <span class="resource-icon">{{ icon }}</span>
            <span class="resource-amount">{{ formattedAmount }}</span>
            <span class="resource-label">{{ name }}</span>
            <span class="rate">(+{{ formattedRate }}/s)</span>
        </div>
    `
};
