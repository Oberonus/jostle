/**
 * Physics system is responsible for applying forces to an object
 * and recalculate new position and velocity
 */
export default class {
    constructor(registry) {
        this.registry = registry

    }

    run(diffMS) {
        const reg = this.registry
        const worldFriction = 3

        reg.all(reg.types.VELOCITY).forEach((vel, id) => {
            const pos = reg.get(id, reg.types.POSITION)

            // if the object fell too far below the board, just remove it from system
            if (pos.vec.z < -14) {
                reg.removeEntity(id)
                return
            }

            this.applyDirectionalForces(id, vel, diffMS)

            this.applyFriction(vel, worldFriction, diffMS)

            // apply object level friction
            const friction = reg.get(id, reg.types.FRICTION)
            if (pos.vec.z < 1 && friction) {
                this.applyFriction(vel, friction.value, diffMS)
            }

            // adjust position and direction according to the velocity
            pos.vec = pos.vec.add(vel.vec.multiply(diffMS))

            // if after all changes Z value is lower than allowed minimum,
            // return z value to the minimum one and clear velocity
            if (pos.vec.z < pos.minZ) {
                vel.vec.z = 0
                pos.vec.z = pos.minZ
            }
        })
    }

    /**
     * Applies all directional object forces
     *
     * @param id {number} Object entity ID
     * @param vel {Velocity} Object velocity
     * @param diffMS {number} Timeframe coefficient
     */
    applyDirectionalForces(id, vel, diffMS) {
        const reg = this.registry
        const mass = reg.get(id, reg.types.MASS)
        const forces = reg.get(id, reg.types.FORCES)

        if (!forces || !mass) return

        // velocityVector = velocityVector + ForceVector / mass * diffMS
        forces.get().forEach(f => vel.vec = vel.vec.add(f.divide(mass.mass).multiply(diffMS)))
    }

    /**
     *
     * @param vel {Velocity}
     * @param value {number}
     * @param diffMS {number}
     */
    applyFriction(vel, value, diffMS) {
        // calculate decreased velocity
        const newVec = vel.vec.sub(vel.vec.multiply(value * diffMS))

        // since friction should always work on the same direction,
        // in case of sign change force object stop
        if (Math.sign(newVec.x) === Math.sign(vel.vec.x)) {
            vel.vec.x = newVec.x
        } else {
            vel.vec.x = 0
        }
        if (Math.sign(newVec.y) === Math.sign(vel.vec.y)) {
            vel.vec.y = newVec.y
        } else {
            vel.vec.y = 0
        }
    }
}