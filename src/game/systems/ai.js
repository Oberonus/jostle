import Vector from "@/game/engine/vector";
import Pathfinder from "@/game/engine/pathfind";

export default class {
    force = "AI_MOVE"

    constructor(registry) {
        this.registry = registry
        this.recalcTimeout = 300 // recalculate every X milliseconds
        this.nextWaypointDistance = 10 // a distance from current waypoint in order to switch to the next one
        this.attackDistance = 50 // enemy will attack player if distance is smaller than this
        this.attackPower = 5 //enemy will attack with additional power applied to the force
    }

    run() {
        const now = Date.now()
        this.execute()
        const execTimeMS = this.registry.first(this.registry.types.STATISTICS).execTimeMS
        execTimeMS.ai = Date.now() - now
    }

    execute() {
        const reg = this.registry

        const force = 300
        let playerID = reg.firstID(reg.types.PLAYER_CONTROL)
        let playerPos = reg.get(playerID, reg.types.POSITION)

        // path for only one enemy can be recalculated in a single frame
        let pathCalculationPerformed = false

        reg.all(reg.types.AI_CONTROL).forEach((enemy, id) => {
            const forces = reg.get(id, reg.types.FORCES)
            const enemyPos = reg.get(id, reg.types.POSITION)
            const enemyMass = reg.get(id, reg.types.MASS).mass

            // AI force can be applied only when an object is on the ground and player exists
            if (!playerID || Math.abs(enemyPos.vec.z) > 1) {
                forces.set(this.force, new Vector())
                return
            }

            // if player is close enough, don't use any pathfinding algorithm, just attack.
            if (enemyPos.vec.distance(playerPos.vec) < this.attackDistance && Math.abs(playerPos.vec.z) < 1) {
                const dirVec = playerPos.vec.sub(enemyPos.vec).normalize()
                forces.set(this.force, dirVec.multiply(force * enemyMass * this.attackPower))
                enemyPos.rotatingTo = dirVec
                return
            }

            if (!pathCalculationPerformed && this.pathShouldBeRecalculated(enemy)) {
                pathCalculationPerformed = true
                enemy.path = this.findPath(enemy, id, enemyPos, playerPos)
            }

            let targetVec = playerPos.vec.clone()
            if (this.pathExists(enemy.path)) {
                targetVec = new Vector(enemy.path.waypoints[0].x, enemy.path.waypoints[0].y)
                if (enemyPos.vec.distance(targetVec) < this.nextWaypointDistance) {
                    enemy.path.waypoints.shift()
                }
            }

            const dirVec = targetVec.sub(enemyPos.vec).normalize()
            forces.set(this.force, dirVec.multiply(force * enemyMass))
            enemyPos.rotatingTo = dirVec
        })
    }

    pathShouldBeRecalculated(obj) {
        return !obj.path || obj.path.createdAt + this.recalcTimeout < Date.now()
    }

    findPath(enemy, enemyID, fromPos, toPos) {
        const now = Date.now()
        const path = new Pathfinder().findPath(fromPos, toPos, this.updateObstaclesMap(enemyID))

        if (path && path.length > 0) {
            return {createdAt: now, waypoints: path}
        }

        // if no new path calculated but an old one exists - reuse it
        if (this.pathExists(enemy.path)) {
            return {createdAt: now, waypoints: enemy.path.waypoints}
        }

        return {createdAt: now, waypoints: [{x: toPos.vec.x, y: toPos.vec.y}]}
    }

    pathExists(path) {
        return path && path.waypoints.length > 0
    }

    /**
     * Creates an obstacles map
     *
     * @param objectID
     */
    updateObstaclesMap(objectID) {
        const reg = this.registry
        const obstaclesMap = reg.all(reg.types.OBSTACLES_MAP).values().next().value
        obstaclesMap.clear()

        this.addAsObstacle(objectID, reg.types.OBSTACLE, obstaclesMap)
        this.addAsObstacle(objectID, reg.types.AI_CONTROL, obstaclesMap)

        return obstaclesMap
    }

    addAsObstacle(objectID, type, obstaclesMap) {
        const reg = this.registry
        const cellSize = obstaclesMap.cellSize
        const grid = obstaclesMap.data

        reg.all(type).forEach((el, id) => {
            if (id === objectID) return

            const pos = reg.get(id, reg.types.POSITION)
            // shape is always circle, so we have radius.
            // TODO: Consider to change it to some specific component name.
            const shape = reg.get(id, reg.types.SHAPE)

            const x = pos.vec.x
            const y = pos.vec.y
            const r = shape.radius

            const leftCellX = Math.floor((x - r) / cellSize - 2)
            const topCellY = Math.floor((y - r) / cellSize - 2)
            const rightCellX = Math.ceil((x + r) / cellSize + 1)
            const bottomCellY = Math.ceil((y + r) / cellSize + 1)

            for (let cx = leftCellX; cx <= rightCellX; cx++) {
                for (let cy = topCellY; cy <= bottomCellY; cy++) {
                    if (!grid[cy]) grid[cy] = []
                    grid[cy][cx] = 1
                }
            }
        })
    }
}
