const ChangelogModal = {
    name: 'ChangelogModal',
    props: {
        visible: {
            type: Boolean,
            required: true
        }
    },
    emits: ['close'],
    computed: {
        changelogData() {
            return window.ChangelogData || [];
        },
        filteredChangelog() {
            // Filter out empty sections
            return this.changelogData.map(release => ({
                ...release,
                sections: Object.fromEntries(
                    Object.entries(release.sections).filter(([, items]) => items.length > 0)
                )
            }));
        }
    },
    template: `
        <div id="changelog-panel" v-if="visible" @click.self="$emit('close')">
            <div class="panel-content" @click.stop>
                <div class="panel-header">
                    <h2>📜 Changelog</h2>
                    <button class="close-button" @click="$emit('close')">✕</button>
                </div>

                <div class="panel-body">
                    <div 
                        v-for="release in filteredChangelog" 
                        :key="release.version" 
                        class="changelog-release"
                    >
                        <div class="release-header">
                            <h3 class="release-version">Version {{ release.version }}</h3>
                            <span class="release-date">{{ release.date }}</span>
                        </div>
                        
                        <div 
                            v-for="(items, section) in release.sections" 
                            :key="section" 
                            class="changelog-section"
                        >
                            <h4 class="section-title">{{ section }}</h4>
                            <ul class="section-list">
                                <li v-for="(item, idx) in items" :key="idx">{{ item }}</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
};

window.ChangelogModal = ChangelogModal;
