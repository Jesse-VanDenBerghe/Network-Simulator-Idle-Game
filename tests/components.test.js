import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';

// Mock GameData
global.GameData = {
    formatNumber: (num) => {
        if (num < 1000) return Math.floor(num).toString();
        if (num < 1000000) return (num / 1000).toFixed(1) + 'K';
        if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M';
        return (num / 1000000000).toFixed(1) + 'B';
    }
};

// Component definitions
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

const ActionButton = {
    name: 'ActionButton',
    props: {
        icon: { type: String, required: true },
        text: { type: String, required: true },
        value: { type: String, required: true },
        disabled: { type: Boolean, default: false },
        locked: { type: Boolean, default: false }
    },
    emits: ['click'],
    template: `
        <button 
            class="action-btn" 
            :class="{ locked: locked }"
            :disabled="disabled || locked"
            @click="$emit('click')"
        >
            <span class="btn-icon">{{ icon }}</span>
            <span class="btn-text">{{ text }}</span>
            <span class="btn-value">{{ value }}</span>
        </button>
    `
};

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

const SkillNode = {
    name: 'SkillNode',
    props: {
        node: { type: Object, required: true },
        isUnlocked: { type: Boolean, default: false },
        isAvailable: { type: Boolean, default: false },
        isSelected: { type: Boolean, default: false }
    },
    emits: ['select'],
    computed: {
        nodeClasses() {
            return {
                node: true,
                [`tier-${this.node.tier}`]: true,
                unlocked: this.isUnlocked,
                available: this.isAvailable && !this.isUnlocked,
                locked: !this.isUnlocked && !this.isAvailable,
                selected: this.isSelected
            };
        },
        nodeStyle() {
            return {
                left: `${this.node.x}px`,
                top: `${this.node.y}px`
            };
        }
    },
    template: `
        <div 
            :class="nodeClasses"
            :style="nodeStyle"
            @click="$emit('select', node.id)"
        >
            <span class="node-icon">{{ node.icon }}</span>
            <span class="node-name">{{ node.name }}</span>
        </div>
    `
};

describe('ResourceBar Component', () => {
    it('renders with basic props', () => {
        const wrapper = mount(ResourceBar, {
            props: {
                icon: '⚡',
                name: 'Energy',
                amount: 100,
                rate: 5
            }
        });

        expect(wrapper.text()).toContain('⚡');
        expect(wrapper.text()).toContain('Energy');
        expect(wrapper.text()).toContain('100');
        expect(wrapper.text()).toContain('5');
    });

    it('formats large numbers correctly', () => {
        const wrapper = mount(ResourceBar, {
            props: {
                icon: '📊',
                name: 'Data',
                amount: 15000,
                rate: 250
            }
        });

        expect(wrapper.text()).toContain('15.0K');
        expect(wrapper.text()).toContain('250');
    });

    it('hides when visible is false', () => {
        const wrapper = mount(ResourceBar, {
            props: {
                icon: '📡',
                name: 'Bandwidth',
                amount: 0,
                visible: false
            }
        });

        expect(wrapper.find('.resource').exists()).toBe(false);
    });

    it('defaults rate to 0', () => {
        const wrapper = mount(ResourceBar, {
            props: {
                icon: '⚡',
                name: 'Energy',
                amount: 50
            }
        });

        expect(wrapper.text()).toContain('0/s');
    });
});

describe('ActionButton Component', () => {
    it('renders button with all elements', () => {
        const wrapper = mount(ActionButton, {
            props: {
                icon: '⚡',
                text: 'Generate Energy',
                value: '+1'
            }
        });

        expect(wrapper.find('.btn-icon').text()).toBe('⚡');
        expect(wrapper.find('.btn-text').text()).toBe('Generate Energy');
        expect(wrapper.find('.btn-value').text()).toBe('+1');
    });

    it('emits click event when clicked', async () => {
        const wrapper = mount(ActionButton, {
            props: {
                icon: '⚡',
                text: 'Generate',
                value: '+1'
            }
        });

        await wrapper.trigger('click');
        expect(wrapper.emitted('click')).toBeTruthy();
        expect(wrapper.emitted('click').length).toBe(1);
    });

    it('is disabled when disabled prop is true', () => {
        const wrapper = mount(ActionButton, {
            props: {
                icon: '📊',
                text: 'Process Data',
                value: '+1',
                disabled: true
            }
        });

        expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('applies locked class when locked', () => {
        const wrapper = mount(ActionButton, {
            props: {
                icon: '📊',
                text: 'Process Data',
                value: '+1',
                locked: true
            }
        });

        expect(wrapper.find('.locked').exists()).toBe(true);
        expect(wrapper.find('button').attributes('disabled')).toBeDefined();
    });

    it('does not emit when disabled', async () => {
        const wrapper = mount(ActionButton, {
            props: {
                icon: '⚡',
                text: 'Generate',
                value: '+1',
                disabled: true
            }
        });

        await wrapper.trigger('click');
        expect(wrapper.emitted('click')).toBeFalsy();
    });
});

describe('AutomationItem Component', () => {
    it('displays automation with correct formatting', () => {
        const wrapper = mount(AutomationItem, {
            props: {
                resource: 'energy',
                rate: 5
            }
        });

        expect(wrapper.text()).toContain('Energy Gen');
        expect(wrapper.text()).toContain('+5/second');
    });

    it('capitalizes resource name', () => {
        const wrapper = mount(AutomationItem, {
            props: {
                resource: 'bandwidth',
                rate: 2
            }
        });

        expect(wrapper.text()).toContain('Bandwidth Gen');
    });

    it('formats large rates', () => {
        const wrapper = mount(AutomationItem, {
            props: {
                resource: 'data',
                rate: 1500
            }
        });

        expect(wrapper.text()).toContain('1.5K');
    });

    it('has active class', () => {
        const wrapper = mount(AutomationItem, {
            props: {
                resource: 'energy',
                rate: 1
            }
        });

        expect(wrapper.find('.automation-item.active').exists()).toBe(true);
    });
});

describe('SkillNode Component', () => {
    const mockNode = {
        id: 'test_node',
        name: 'Test Node',
        icon: '🔮',
        tier: 1,
        x: 100,
        y: 200
    };

    it('renders node with correct content', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode
            }
        });

        expect(wrapper.find('.node-icon').text()).toBe('🔮');
        expect(wrapper.find('.node-name').text()).toBe('Test Node');
    });

    it('applies correct position styles', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode
            }
        });

        expect(wrapper.attributes('style')).toContain('left: 100px');
        expect(wrapper.attributes('style')).toContain('top: 200px');
    });

    it('applies unlocked class when unlocked', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode,
                isUnlocked: true
            }
        });

        expect(wrapper.find('.unlocked').exists()).toBe(true);
    });

    it('applies available class when available but not unlocked', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode,
                isAvailable: true,
                isUnlocked: false
            }
        });

        expect(wrapper.find('.available').exists()).toBe(true);
    });

    it('applies locked class when not available', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode,
                isAvailable: false,
                isUnlocked: false
            }
        });

        expect(wrapper.find('.locked').exists()).toBe(true);
    });

    it('applies selected class when selected', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode,
                isSelected: true
            }
        });

        expect(wrapper.find('.selected').exists()).toBe(true);
    });

    it('applies tier class', () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode
            }
        });

        expect(wrapper.find('.tier-1').exists()).toBe(true);
    });

    it('emits select event with node id on click', async () => {
        const wrapper = mount(SkillNode, {
            props: {
                node: mockNode
            }
        });

        await wrapper.trigger('click');
        expect(wrapper.emitted('select')).toBeTruthy();
        expect(wrapper.emitted('select')[0]).toEqual(['test_node']);
    });
});
