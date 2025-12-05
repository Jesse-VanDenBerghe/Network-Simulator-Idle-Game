import type { Node } from "@network-simulator/shared";

/**
 * Point interface for 2D coordinates
 * @property x - X coordinate
 * @property y - Y coordinate
 */
export interface Point {
    x: number;
    y: number;
}
/**
 * Connection interface representing a link between two nodes
 * @property fromNodeId - ID of the source node
 * @property toNodeId - ID of the target node
 * @property from - Starting point coordinates
 * @property to - Ending point coordinates
 * @property requirementLevel - Optional level requirement for the connection
 */
export interface Connection{
    fromNodeId: string;
    toNodeId: string;
    from: Point;
    to: Point;
    requirementLevel?: number;
    isFiltered?: boolean;
}

/**
 * Path rendering options
 * @property curvature - Curvature factor for curved paths
 * @property style - Style of the path: 'straight', 'curved', or 'orthogonal'
 */
export interface PathOptions {
    curvature?: number;
    style?: 'straight' | 'curved' | 'orthogonal';
}

/**
 * Generate SVG path data string for a connection between two points
 * @param from - Starting point
 * @param to - Ending point
 * @param options - Path rendering options
 * @returns SVG path data string
 */
export function generateConnectionPath(
    from: Point,
    to: Point,
    options: PathOptions = {}
): string {
    const {curvature = 0.3, style = 'curved'} = options;

    if (style === 'straight') {
        return `M ${from.x} ${from.y} L ${to.x} ${to.y}`;
    }

    if (style === 'orthogonal') {
        const midX = (from.x + to.x) / 2;
        return `M ${from.x} ${from.y} L ${midX} ${from.y} L ${midX} ${to.y} L ${to.x} ${to.y}`;
    } 

    const adjustedCurvature = curvature * curvatureMultiplierBasedOnDirection(from, to);

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const offset = distance * adjustedCurvature;

    const prepX = -dy / distance;
    const prepY = dx / distance;

    const midX = (from.x + to.x) / 2 + prepX * offset;
    const midY = (from.y + to.y) / 2 + prepY * offset;

    return `M ${from.x} ${from.y} Q ${midX} ${midY} ${to.x} ${to.y}`;
}

/**
 * Calculate Euclidean distance between two points
 * @param p1 - First point
 * @param p2 - Second point
 * @returns Distance between p1 and p2
 */
export function distance(p1: Point, p2: Point): number {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate angle (in radians) from p1 to p2
 * @param p1 - Starting point
 * @param p2 - Ending point
 * @returns Angle in radians from p1 to p2
 */
export function angleBetween(p1: Point, p2: Point): number {
    return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * Linearly interpolate between two points
 * @param p1 - Starting point
 * @param p2 - Ending point
 * @param t - Interpolation factor (0 to 1)
 * @returns Interpolated point
 */
export function lerp(p1: Point, p2: Point, t: number): Point {
    return {
        x: p1.x + (p2.x - p1.x) * t,
        y: p1.y + (p2.y - p1.y) * t,
    };
}

/**
 * Transform a point by pan/zoom
 * but useful for mouse coordinate conversions)
 * @param point - Original point
 * @param pan - Pan offset
 * @param zoom - Zoom factor
 * @returns Transformed point
 */
export function transformPoint(
    point: Point,
    pan: Point,
    zoom: number
): Point {
    return {
        x: (point.x + pan.x) * zoom,
        y: (point.y + pan.y) * zoom
    };
}

/**
 * Inverse transform - convert screen coords to logical coords
 * Useful for mouse interactions in canvas
 * @param screenPoint - Point in screen coordinates
 * @param pan - Pan offset
 * @param zoom - Zoom factor
 * @returns Logical point
 */
export function inverseTransformPoint(
    screenPoint: Point,
    pan: Point,
    zoom: number
): Point {
    return {
        x: screenPoint.x / zoom - pan.x,
        y: screenPoint.y / zoom - pan.y
    };
}

/**
 * Build connections array from nodes with positions
 * @param nodes - Array of nodes with x and y coordinates
 * @returns Array of Connection objects
 */
export function buildConnections(
    nodes: Array<Node & {x: number; y: number}>,
    filteredNodeIds: Set<string>
): Connection[] {
    const connections: Connection[] = [];

    const nodePositions = new Map<string, Point>(
        nodes.map(node => [node.id, {x: node.x, y: node.y}])
    );

    nodes.forEach(node => {
        node.requires.forEach(req => {
            const parentId = typeof req === 'string' ? req : req.id;
            const level = typeof req === 'string' ? undefined : req.level;

            const parentPos = nodePositions.get(parentId);
            if(!parentPos) return;

            connections.push({
                fromNodeId: node.id,
                toNodeId: parentId,
                from: {x: node.x, y: node.y},
                to: parentPos,
                requirementLevel: level,
                isFiltered: filteredNodeIds.has(node.id) && filteredNodeIds.has(parentId),
            });
        });
    });

    return connections;
}

/** Determine curvature multiplier based on direction between two points
 * @param from - Starting point
 * @param to - Ending point
 * @returns Curvature multiplier (-1, 0, or 1)
 */
export function curvatureMultiplierBasedOnDirection(from: Point, to: Point): number {
    const dx = to.x - from.x;
    const dy = to.y - from.y;

    if (dx === 0 || dy === 0) return 0;
    if (Math.abs(dx) > Math.abs(dy)) return dy >= 0 ? -1 : 1;
    return dx >= 0 ? 1 : -1;
}

/**
 * Calculate bounding box of all node positions
 * Useful for "fit to view" functionality
 * @param positions - Array of node positions
 * @returns Bounding box with minX, minY, maxX, maxY, width, and height
 */
export function calculateBoundingBox(
    positions: Point[]
): { minX: number; minY: number; maxX: number; maxY: number; width: number; height: number } | null {
    if (positions.length === 0) return null;
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    positions.forEach(p => {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
    });
    
    return {
        minX,
        minY,
        maxX,
        maxY,
        width: maxX - minX,
        height: maxY - minY
    };
}