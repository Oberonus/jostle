import Vector from "@/game/engine/vector";

export const types = {
    POSITION: "position",
    VELOCITY: "velocity",
    SHAPE: "shape",
    PLAYER_CONTROL: "player_control",
    COLLIDER: "collider",
    MASS: "mass",
    AI_CONTROL: "ai_control",
    FORCES: "forces",
    MOVABLE: "movable",
    BOARD_CELL: "board_cell",
    FRICTION: "friction",
    OBSTACLE: "obstacle",
    OBSTACLES_MAP: "obstacles_map",
    STATISTICS: "statistics",
    WORLD_OBJECT: "world_object"
}

/**
 * An object position and values limitation.
 */
export class Position {
    constructor(vec, minZ = 0) {
        this.type = types.POSITION
        this.vec = vec
        this.rotatingTo = null
        // initially always looking up
        this.direction = new Vector(0, -1, 0).normalize()
        this.minZ = minZ
    }
}

/**
 * An object velocity in pixels per second.
 */
export class Velocity {
    constructor(vec) {
        this.type = types.VELOCITY
        this.vec = vec
    }
}

export class Shape {
    constructor(image = null) {
        this.type = types.SHAPE
        this.image = image
    }
}

export class ShapeCircle extends Shape {
    constructor(radius, color, image = null) {
        super(image)
        this.radius = radius
        this.color = color
    }
}

/**
 * Object mass
 */
export class Mass {
    constructor(mass) {
        this.type = types.MASS
        this.mass = mass
    }
}

/**
 * Directional forces that should be applied to an object,
 */
export class Forces {
    constructor() {
        this.forces = new Map()
        this.type = types.FORCES
    }

    set(name, vec) {
        this.forces.set(name, vec)
    }

    get() {
        return this.forces
    }
}

/**
 * Represents an object that can collide with other objects which contain this component.
 */
export class Collider {
    constructor(radius) {
        this.type = types.COLLIDER
        this.radius = radius
    }
}

/**
 * Represents an object which is controllable by player.
 */
export class PlayerControl {
    constructor() {
        this.type = types.PLAYER_CONTROL
    }
}

/**
 * Represents specific friction force that should be applied to an object.
 */
export class Friction {
    constructor(value = 0) {
        this.type = types.FRICTION
        this.value = value
    }
}

/**
 * Represents an AI controlled object.
 */
export class AIControl {
    constructor() {
        this.type = types.AI_CONTROL
    }
}

/**
 * Movable is an object that can change its position.
 */
export class Movable {
    constructor() {
        this.type = types.MOVABLE
    }
}

/**
 * Obstacle is used by AI to calculate an optimal route.
 */
export class Obstacle {
    constructor() {
        this.type = types.OBSTACLE
    }
}

export class WorldObject {
    type = types.WORLD_OBJECT
}

/******************************************************************************/
/* WORLD */

/******************************************************************************/

/**
 * Represents one board cell
 */
export class BoardCell {
    constructor() {
        this.type = types.BOARD_CELL
    }
}

/**
 * Contains an entire level sized current obstacles map. Usually needed for AI.
 */
export class ObstaclesMap {
    constructor(mapSize, cellSize) {
        this.type = types.OBSTACLES_MAP
        this.cellSize = cellSize
        this.mapSize = mapSize
        this.clear()
    }

    clear() {
        this.data = []
        for (let y = 0; y < this.mapSize; y++) {
            for (let x = 0; x < this.mapSize; x++) {
                if (!this.data[y]) this.data[y] = []
                this.data[y][x] = 0
            }
        }
    }
}

/******************************************************************************
 * INTERMAL
 ******************************************************************************/

export class Statistics {
    execTimeMS = {
        ai: 0,
        collisions: 0,
        control: 0,
        physics: 0,
        render: 0,
        world: 0,
        aiMax: 0,
        collisionsMax: 0,
        controlMax: 0,
        physicsMax: 0,
        renderMax: 0,
        worldMax: 0,
    }
    type = types.STATISTICS
}
