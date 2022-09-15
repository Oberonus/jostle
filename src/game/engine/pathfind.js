export default class Pathfinder {
    /**
     * Calculated path between two positions avoiding obstacles
     *
     * @param fromPos {Position}
     * @param toPos {Position}
     * @param worldMap {ObstaclesMap}
     * @returns {[]}
     */
    findPath(fromPos, toPos, worldMap) {
        const cellSize = worldMap.cellSize
        const grid = worldMap.data

        const targetNode = PathNode.fromWorldCoords(grid, toPos.vec.x, toPos.vec.y, cellSize)
        const startNode = PathNode.fromWorldCoords(grid, fromPos.vec.x, fromPos.vec.y, cellSize)

        if (targetNode.occupied()) {
            return []
        }

        const open = new Map()
        const closed = new Map()
        open.set(startNode.key(), startNode)

        for (; ;) {
            // current = node in open with the lowest f_cost
            let current = this.getBestNode(open)
            if (!current) {
                return []
            }

            // move current from open to closed
            open.delete(current.key())
            closed.set(current.key(), current)

            // found a path
            if (current.equal(targetNode)) {
                return this.retracePath(open.get(startNode.key()), closed.get(targetNode.key()), cellSize)
            }

            //now we should check EACH neighbour of the current node.
            const neighbours = this.getNeighbours(grid, current)
            neighbours.forEach(neighbour => {
                if (neighbour.occupied() || closed.has(neighbour.key())) {
                    return
                }

                const newMovementCostToNeighbour = current.gCost + this.getDistance(current, neighbour)
                if (newMovementCostToNeighbour < neighbour.gCost || !open.has(neighbour.key())) {
                    neighbour.gCost = newMovementCostToNeighbour
                    neighbour.hCost = this.getDistance(neighbour, targetNode)
                    neighbour.parent = current

                    if (!open.has(neighbour.key())) {
                        open.set(neighbour.key(), neighbour)
                    }
                }
            })
        }
    }

    /**
     * Finds the best node with lowest fCost
     * TODO: consider changing to more efficient heap
     *
     * @param list
     * @returns {null,PathNode}
     */
    getBestNode(list) {
        let node = null
        list.forEach(val => {
            if (node == null) {
                node = val
            }
            if (node.fCost() > val.fCost() || val.fCost() === node.fCost() && val.hCost < node.hCost) {
                node = val
            }
        })
        return node
    }

    retracePath(startNode, endNode, cellSize) {
        let path = []
        let current = endNode
        while (current !== startNode) {
            path.push(current)
            current = current.parent
        }

        path = this.simplifyPath(path)

        // adjust nodes coords to real world coordinates taking into account the cell size
        path.forEach(val => {
            val.x = val.x * cellSize + (cellSize / 2)
            val.y = val.y * cellSize + (cellSize / 2)
            val.parent = null
        })

        return path.reverse()
    }

    /**
     * Simplify reduces number of waypoints leaving only directional changes
     *
     * @param path
     * @returns {*[]}
     */
    simplifyPath(path) {
        let oldDirection = {x: 0, y: 0}
        const simplified = []
        for (let i = 1; i < path.length; i++) {
            const newDirection = {x: path[i - 1].x - path[i].x, y: path[i - 1].y - path[i].y}
            if (oldDirection.x !== newDirection.x || oldDirection.y !== newDirection.y) {
                simplified.push(path[i - 1])
            }
            oldDirection = newDirection
        }

        return simplified
    }

    /**
     * Calculates simple distance between two obstacle nodes.
     * This method does not take into account real cell sizes, just uses simple "horizontal/diagonal" coefficients.
     *
     * @param nodeA
     * @param nodeB
     * @returns {number}
     */
    getDistance(nodeA, nodeB) {
        const dstX = Math.abs(nodeA.x - nodeB.x)
        const dstY = Math.abs(nodeA.y - nodeB.y)

        if (dstX > dstY) {
            return 14 * dstY + 10 * (dstX - dstY)
        }
        return 14 * dstX + 10 * (dstY - dstX)
    }

    /**
     * Returns all closest neighbors for a node (up to 8)
     *
     * @param grid
     * @param current
     * @returns {*[]}
     */
    getNeighbours(grid, current) {
        const neighbours = []
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                if (x === 0 && y === 0) {
                    continue
                }
                const checkX = current.x + x
                const checkY = current.y + y

                if (checkX >= 0 && checkX < grid.length && checkY >= 0 && checkY < grid[0].length) {
                    neighbours.push(new PathNode(grid, checkX, checkY))
                }
            }
        }
        return neighbours
    }
}

class PathNode {
    x = 0
    y = 0
    gCost = 0
    hCost = 0

    constructor(grid, x, y) {
        this.x = x
        this.y = y
        this.grid = grid
    }

    static fromWorldCoords(grid, x, y, cellSize) {
        return new PathNode(grid, Math.floor(x / cellSize), Math.floor(y / cellSize))
    }

    fCost() {
        return this.hCost + this.gCost
    }

    occupied() {
        return this.grid[this.y][this.x] !== 0
    }

    equal(node) {
        return this.x === node.x && this.y === node.y
    }

    key() {
        return this.x.toString() + this.y.toString()
    }
}

