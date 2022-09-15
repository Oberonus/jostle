import textures from "@/game/engine/textures"

/**
 * Rendering system is responsible for displaying the scene on some canvas
 */
export default class {
    constructor(canvas, registry, config = {}) {
        this.canvas = canvas
        this.registry = registry
        this.config = config
        this.fps = {refreshRate: 1000, updatedAt: 0, data: [], rate: 0}
        this.cloudX = 0
        this.cloudX2 = 0
    }

    run(diffMS) {
        this.rotate(diffMS)

        let ctx = this.canvas.getContext('2d')
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        ctx.beginPath();
        ctx.rect(50, 50, 600, 600);
        ctx.stroke();

        ctx.fillStyle = "black"
        this.drawFPS(ctx, diffMS)
        this.drawGameState(ctx)

        this.drawObjects(ctx, this.registry.types.BOARD_CELL)

        if (this.config.drawPath) {
            this.drawPath(ctx)
        }

        if (this.config.drawObstacles) {
            this.drawObstaclesMap(ctx)
        }

        this.drawObjects(ctx, this.registry.types.WORLD_OBJECT)
        this.drawObjects(ctx, this.registry.types.AI_CONTROL)
        this.drawObjects(ctx, this.registry.types.PLAYER_CONTROL)


        if (diffMS > 1000) {
            diffMS = 0
        }
        ctx = this.canvas.getContext('2d')
        const img = textures.get("cloud")
        ctx.globalAlpha = 0.2
        ctx.drawImage(img, this.cloudX, 0, this.canvas.height / 2, this.canvas.width / 2, 50, 50, this.canvas.height - 100, this.canvas.width - 100);
        ctx.globalAlpha = 1
        ctx.globalAlpha = 0.1
        ctx.drawImage(img, this.cloudX2, 0, this.canvas.height / 2, this.canvas.width / 2, 50, 50, this.canvas.height - 100, this.canvas.width - 100);
        ctx.globalAlpha = 1
        this.cloudX = this.cloudX + 40 * diffMS
        if (this.cloudX + this.canvas.width / 2 > img.width) {
            this.cloudX = 0
        }
        this.cloudX2 = this.cloudX2 + 10 * diffMS
        if (this.cloudX2 + this.canvas.width / 2 > img.width) {
            this.cloudX2 = 0
        }

    }

    drawObjects(ctx, type) {
        this.registry.all(type).forEach((el, id) => {
            const shape = this.registry.get(id, this.registry.types.SHAPE)

            const position = this.registry.get(id, this.registry.types.POSITION)

            if (type === this.registry.types.BOARD_CELL) {
                this.drawBoardCell(ctx, position, shape)
                return
            }

            this.drawCircle(ctx, position, shape)
        })
    }

    // draw enemy calculated path
    drawPath(ctx) {
        this.registry.all(this.registry.types.AI_CONTROL).forEach((el) => {
            if (!el.path || !el.path.waypoints || !el.path.waypoints[0]) {
                return
            }
            const waypoints = el.path.waypoints

            ctx.beginPath();
            ctx.moveTo(50 + waypoints[0].x, 50 + waypoints[0].y);
            waypoints.forEach(node => {
                ctx.lineTo(50 + node.x, 50 + node.y);
            })
            ctx.strokeStyle = '#a0a0a0'
            ctx.stroke();

            waypoints.forEach(node => {
                ctx.beginPath()
                ctx.arc(50 + node.x, 50 + node.y, 5, 0, 2 * Math.PI, false)
                ctx.fillStyle = '#a0a0a0'
                ctx.fill();
            })
        })
    }

    // draw obstacles layer mask
    drawObstaclesMap(ctx) {
        const obstaclesMap = this.registry.all(this.registry.types.OBSTACLES_MAP).values().next().value
        for (let y = 0; y < obstaclesMap.mapSize; y++) {
            for (let x = 0; x < obstaclesMap.mapSize; x++) {
                if (obstaclesMap.data[y][x] !== 1) {
                    continue
                }
                ctx.fillStyle = "rgba(255, 0, 0, 0.5)"
                ctx.fillRect(x * obstaclesMap.cellSize + 50, y * obstaclesMap.cellSize + 50, obstaclesMap.cellSize, obstaclesMap.cellSize);
            }
        }
    }

    drawFPS(ctx, diffMS) {
        const fps = 1000 / diffMS / 1000
        const now = Date.now()
        if (this.fps.updatedAt + this.fps.refreshRate < now && this.fps.data.length > 5) {
            this.fps.updatedAt = now
            this.fps.rate = Math.round(this.fps.data.reduce((a, b) => a + b, 0) / this.fps.data.length)
            this.fps.data = []
        }
        this.fps.data.push(fps)

        ctx.font = "12px Arial";
        ctx.fillText("FPS: " + this.fps.rate, 10, 20)
    }

    drawGameState(ctx) {
        ctx.font = "12px Arial;"

        const players = this.registry.all(this.registry.types.PLAYER_CONTROL).size
        const enemies = this.registry.all(this.registry.types.AI_CONTROL).size

        ctx.fillText("Players: " + players, 300, 20)
        ctx.fillText("Enemies: " + enemies, 450, 20)
    }

    // circle should have color and radius
    drawCircle(ctx, pos, data) {
        if (data.radius + pos.vec.z < 0) return

        if (pos.vec.z > 0 && data.radius - pos.vec.z > 0) {
            ctx.beginPath()
            ctx.arc(pos.vec.x + 50 + pos.vec.z * 5, pos.vec.y + 50 + pos.vec.z * 5,
                data.radius - pos.vec.z, 0, 2 * Math.PI, false)
            ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
            ctx.fill();
        }

        if (data.image) {
            const img = textures.get(data.image)

            const theta = (Math.atan2(pos.direction.x, pos.direction.y) - Math.atan2(0, 0))
            ctx.save();
            ctx.translate(pos.vec.x + 50, pos.vec.y + 50);
            ctx.rotate(180 * (Math.PI / 180));
            ctx.rotate(-theta);
            ctx.drawImage(img, -data.radius, -data.radius, data.radius * 2 + pos.vec.z, data.radius * 2 + pos.vec.z)
            ctx.restore()

            return
        }

        ctx.beginPath()
        ctx.arc(pos.vec.x + 50, pos.vec.y + 50, data.radius + pos.vec.z,
            0, 2 * Math.PI, false)
        ctx.fillStyle = data.color;
        ctx.fill();

        if (pos.direction) {
            ctx.beginPath()
            const toPos = pos.vec.add(pos.direction.multiply(30))
            ctx.moveTo(50 + pos.vec.x, 50 + pos.vec.y);
            ctx.lineTo(50 + toPos.x, 50 + toPos.y);
            ctx.stroke();
        }
    }

    // rectangles should have color and size (width and height)
    drawBoardCell(ctx, pos, data) {
        const img = textures.get(data.image)
        ctx.drawImage(img, pos.vec.x + 50 - data.radius, pos.vec.y + 50 - data.radius, data.radius * 2, data.radius * 2);
    }

    rotate(diffMS) {
        this.registry.all(this.registry.types.POSITION).forEach((el) => {
            if (!el.rotatingTo) return

            let theta = (Math.atan2(el.direction.x, el.direction.y) - Math.atan2(el.rotatingTo.x, el.rotatingTo.y))

            const fullRotateRadians = 360 * (Math.PI / 180)

            // if angle > 180 degrees, translate it to the opposite, e.g. 270=>-90, -270=>90
            if (Math.abs(theta) > fullRotateRadians / 2) {
                theta -= Math.sign(theta) * fullRotateRadians
            }

            const maxTheta = diffMS * fullRotateRadians

            // rotation ended, it is possible to set just the final value and clear rotation
            if (Math.abs(theta) <= maxTheta) {
                el.direction = el.rotatingTo
                el.rotatingTo = null
                return
            }

            theta = maxTheta * Math.sign(theta)
            el.direction = el.direction.rotate(theta).normalize()
        })
    }
}
