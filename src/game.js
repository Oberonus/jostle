import Render from "@/game/systems/render";
import * as components from "@/game/entities/components";
import Physics from "@/game/systems/physics";
import Control from "@/game/systems/control";
import Collisions from "@/game/systems/collisions";
import AIControl from "@/game/systems/ai";
import World from "@/game/systems/world";
import Vector from "@/game/engine/vector";
import Registry from "@/game/entities/registry"
import textures from "@/game/engine/textures"

export default class {
    registry = null
    systems = []
    boardCellSize = 40
    obstacleCellSize = 10

    constructor(canvas) {
        textures.loadAll(() => {
            this.previousTime = null
            this.registry = new Registry()
            this.registry.add(this.registry.newID(), new components.Statistics())
            this.createBoard()

            this.systems = [
                new World(this.registry),
                new Control(this.registry),
                new AIControl(this.registry),
                new Collisions(this.registry),
                new Physics(this.registry),
                new Render(canvas, this.registry, {drawPath: false, drawObstacles: false})
            ]
        })
    }

    start() {
        this.previousTime = Date.now()
        requestAnimationFrame(() => this.tick())
    }

    tick() {
        const current = Date.now()
        const elapsed = current - this.previousTime
        this.previousTime = current
        this.systems.forEach(s => s.run(elapsed / 1000))
        requestAnimationFrame(() => this.tick())
    }

    createBoard() {
        const T_EMPTY = 0, T_DROWN = 1, T_ENEMY = 2, T_PLAYER = 3, T_STATIC = 4
        const board = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 4, 0, 0, 3, 0, 0, 0, 0, 4, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 4, 0, 0, 0, 0, 0, 0, 0, 4, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        ]

        const obstacleMapSize = board.length * (this.boardCellSize / this.obstacleCellSize)
        this.registry.add(this.registry.newID(), new components.ObstaclesMap(obstacleMapSize, this.obstacleCellSize))

        for (let x = 0; x < 15; x++) {
            for (let y = 0; y < 15; y++) {
                const cellType = board[y][x]
                switch (cellType) {
                    case T_EMPTY:
                        this.createEmptyCell(x, y)
                        break
                    case T_DROWN:
                        this.createDrowningCell(x, y)
                        break
                    case T_ENEMY:
                        this.createEmptyCell(x, y)
                        this.createEnemy(x, y)
                        break
                    case T_PLAYER:
                        this.createEmptyCell(x, y)
                        this.createPlayer(x, y)
                        break
                    case T_STATIC:
                        this.createEmptyCell(x, y)
                        this.createStatic(x, y)
                        break
                }
            }
        }
    }

    createPlayer(x, y) {
        const id = this.registry.newID()
        this.registry.add(id, new components.Position(this.cellToWorldVector(x, y)))
            .add(id, new components.ShapeCircle(15, "green", "ladybug"))
            .add(id, new components.Velocity(new Vector()))
            .add(id, new components.PlayerControl())
            .add(id, new components.Collider(15))
            .add(id, new components.Mass(10))
            .add(id, new components.Forces())
            .add(id, new components.Movable())
            .add(id, new components.Friction())
    }

    createEnemy(x, y) {
        const id = this.registry.newID()
        this.registry.add(id, new components.Position(this.cellToWorldVector(x, y)))
            .add(id, new components.ShapeCircle(15, "red", "ladybug-bad"))
            .add(id, new components.Velocity(new Vector()))
            .add(id, new components.Collider(15))
            .add(id, new components.Mass(10))
            .add(id, new components.AIControl())
            .add(id, new components.Forces())
            .add(id, new components.Movable())
            .add(id, new components.Friction())
    }

    createStatic(x, y) {
        const id = this.registry.newID()
        this.registry.add(id, new components.Position(this.cellToWorldVector(x, y)))
            .add(id, new components.ShapeCircle(30, "black", "bush"))
            .add(id, new components.Velocity(new Vector()))
            .add(id, new components.Collider(30))
            .add(id, new components.Mass(1000))
            .add(id, new components.Obstacle())
            .add(id, new components.WorldObject)
    }

    cellToWorldVector(x, y) {
        // since we're dealing with circles, position should be in the center of the cell
        return new Vector(
            x * this.boardCellSize + this.boardCellSize / 2,
            y * this.boardCellSize + this.boardCellSize / 2
        )
    }

    createEmptyCell(x, y) {
        let color = (x + y % 2) % 2 ? "#f0f0f0" : "#d0d0d0"

        const ff = new components.Forces()
        ff.set("BOARD_DROWN", new Vector(0, 0, -500))

        const id = this.registry.newID()
        this.registry.add(id, new components.Position(this.cellToWorldVector(x, y)))
            .add(id, new components.ShapeCircle(20, color, "grass"))
            .add(id, new components.BoardCell())
            .add(id, new components.Forces())
            .add(id, new components.Friction(0))
            .add(id, ff)
    }

    createDrowningCell(x, y) {
        const ff = new components.Forces()
        ff.set("BOARD_DROWN", new Vector(0, 0, -1000))

        const id = this.registry.newID()
        this.registry.add(id, new components.Position(this.cellToWorldVector(x, y), -1000))
            .add(id, new components.ShapeCircle(20, "#00afff", "water"))
            .add(id, new components.BoardCell())
            .add(id, new components.Friction(1000))
            .add(id, ff)
            .add(id, new components.Obstacle())
    }
}
