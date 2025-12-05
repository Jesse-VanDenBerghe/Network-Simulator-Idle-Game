// Re-export all types
export * from './types/node'
export * from './types/game'
export * from './types/notification'
export * from './types/event'
export * from './types/index'

// Re-export all data
export * from './data/nodes'
export * from './data/notifications'
export * from './data/resources'
export * from './data/constants'
export * from './data/config'
export * from './data/prestigeData'
export * from './data/changelogData'

// Re-export all utilities
export * from './utils/nodeUtils'
export * from './utils/formatUtils'
export * from './utils/branchUtils'

// Re-export layout engine and types
export { LayoutEngine } from './layout/LayoutEngine'
export type { LayoutNode } from './layout/TreeBuilder'
export type { LayoutConfig, DepthInfo } from './layout/PositionCalculator'
export { TreeBuilder } from './layout/TreeBuilder'
export { PositionCalculator } from './layout/PositionCalculator'
export { CollisionResolver } from './layout/CollisionResolver'