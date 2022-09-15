export default class {
    constructor(registry) {
        this.registry = registry
    }

    run() {
        const reg = this.registry

        // TODO: get rid of quadratic complexity by placing cells in an array and navigate by indexes
        reg.all(reg.types.BOARD_CELL).forEach((cell, cellID) => {
            reg.all(reg.types.MOVABLE).forEach((obj, objID) => {
                const cellPos = reg.get(cellID, reg.types.POSITION)
                const objPos = reg.get(objID, reg.types.POSITION)
                const cellSize = reg.get(cellID, reg.types.SHAPE)

                if (!this.isCollided(objPos, cellPos, cellSize.radius)) {
                    return
                }

                // minimum Z value should be applied directly
                objPos.minZ = cellPos.minZ

                this.applyFriction(objID, cellID)
                this.applyForce(cellID, objID)
            })
        })
    }

    /**
     * Applies custom cell friction to the object
     * it should be taken into consideration in physics system
     *
     * @param objID Object entity ID
     * @param cellID Cell entity ID
     */
    applyFriction(objID, cellID) {
        const reg = this.registry
        const cellFriction = reg.get(cellID, reg.types.FRICTION)
        if (cellFriction) {
            reg.add(objID, cellFriction)
        }
    }

    /**
     * Applies cell level force to the object
     *
     * @param cellID Cell entity ID
     * @param objID Object entity ID
     */
    applyForce(cellID, objID) {
        const reg = this.registry

        const cellForces = reg.get(cellID, reg.types.FORCES)
        const objForces = reg.get(objID, reg.types.FORCES)
        cellForces.get().forEach((d, n) => objForces.set(n, d.clone()))
    }

    /**
     * Checks if an object is inside specific cell.
     *
     * @param pos1
     * @param pos2
     * @param radius
     * @returns {boolean}
     */
    isCollided(pos1, pos2, radius) {
        return pos1.vec.distance(pos2.vec) < radius
    }
}
