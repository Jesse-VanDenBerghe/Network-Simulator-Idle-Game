// AutomationItem Component - Displays automation status
const AutomationItem = {
    name: 'AutomationItem',
    props: {
        resource: { type: String, required: true },
        rate: { type: Number, required: true }
    },
    computed: {
        displayName() {
            return this.resource.charAt(0).toUpperCase() + this.resource.slice(1) + ' Gen';
        },
        formattedRate() {
            return GameData.formatNumber(this.rate);
        }
    },
    template: `
        <div class="automation-item active">
            <div class="automation-header">
                <span class="automation-name">{{ displayName }}</span>
            </div>
            <div class="automation-output">+{{ formattedRate }}/second</div>
        </div>
    `
};
