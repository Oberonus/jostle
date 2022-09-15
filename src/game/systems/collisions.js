export default class {
    constructor(registry) {
        this.registry = registry

    }

    run() {
        const reg = this.registry

        const colCache = {}

        reg.all(reg.types.COLLIDER).forEach((el1, id1) => {
            const pos1 = reg.get(id1, reg.types.POSITION)

            reg.all(reg.types.COLLIDER).forEach((el2, id2) => {
                // check that the pair was not already processed, or it is the same object
                if (id1 === id2 || colCache[id1] === id2 || colCache[id2] === id1) {
                    return
                }
                colCache[id1] = id2
                colCache[id2] = id1

                const pos2 = reg.get(id2, reg.types.POSITION)

                const collided = pos1.vec.distance(pos2.vec) < el1.radius + el2.radius
                if (!collided) {
                    return
                }

                // objects with different Z coordinate can not collide
                if (Math.round(pos1.vec.z) !== Math.round(pos2.vec.z)) {
                    return
                }

                const vel1 = reg.get(id1, reg.types.VELOCITY)
                const vel2 = reg.get(id2, reg.types.VELOCITY)
                const mass1 = reg.get(id1, reg.types.MASS).mass
                const mass2 = reg.get(id2, reg.types.MASS).mass

                this.removeIntersections(pos1, pos2, el1, el2)

                const nv = pos2.vec.sub(pos1.vec).normalize()

                const p = 2 * (vel1.vec.x * nv.x + vel1.vec.y * nv.y - vel2.vec.x * nv.x - vel2.vec.y * nv.y) /
                    (mass1 + mass2)

                // apply new velocity vectors
                const constant = 1.5
                if (reg.is(id1, reg.types.MOVABLE)) {
                    vel1.vec.x = vel1.vec.x - p * mass2 * nv.x * constant
                    vel1.vec.y = vel1.vec.y - p * mass2 * nv.y * constant
                }
                if (reg.is(id2, reg.types.MOVABLE)) {
                    vel2.vec.x = vel2.vec.x + p * mass1 * nv.x * constant
                    vel2.vec.y = vel2.vec.y + p * mass1 * nv.y * constant
                }
            })
        })
    }

    removeIntersections(pos1, pos2, el1, el2) {
        let d = pos1.vec.distance(pos2.vec)

        if (d >= el1.radius + el2.radius) {
            return
        }

        let overlap = el1.radius + el2.radius - d
        // move circles always in opposite direction
        if (pos1.vec.x < pos2.vec.x) {
            overlap = -overlap
        }
        pos1.vec.x += overlap / 2
        pos2.vec.x -= overlap / 2

        overlap = el1.radius + el2.radius - d
        // move circles always in opposite direction
        if (pos1.vec.y < pos2.vec.y) {
            overlap = -overlap
        }
        pos1.vec.y += overlap / 2
        pos2.vec.y -= overlap / 2
    }
}