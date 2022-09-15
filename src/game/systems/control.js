/**
 * User input processing system
 */
import Vector from "@/game/engine/vector";

export default class {
    KEY_UP = 38
    KEY_DOWN = 40
    KEY_LEFT = 37
    KEY_RIGHT = 39
    KEY_SPACE = 32

    keys = []

    constructor(registry) {
        this.registry = registry

        window.addEventListener("keydown", e => {
            this.keys[e.keyCode] = true;
        });

        window.addEventListener("keyup", e => {
            this.keys[e.keyCode] = false;
        });
    }

    run() {
        const fName = "PLAYER_CONTROL_FORCE"
        const fJumpName = "PLAYER_JUMP_FORCE"
        const force = 10000

        const reg = this.registry
        reg.all(reg.types.PLAYER_CONTROL).forEach((el, id) => {
            const pos = reg.get(id, reg.types.POSITION)
            const forces = reg.get(id, reg.types.FORCES)

            // no control over flying object
            if (Math.abs(pos.vec.z) > 0) {
                forces.set(fJumpName, new Vector())
                return
            }

            let fx = 0
            let fy = 0

            if (this.keys[this.KEY_SPACE] === true) {
                forces.set(fJumpName, new Vector(0, 0, 20000))
                this.keys[this.KEY_SPACE] = false
            }
            if (this.keys[this.KEY_UP] === true) {
                fy = -force
            }
            if (this.keys[this.KEY_DOWN] === true) {
                fy = force
            }
            if (this.keys[this.KEY_LEFT] === true) {
                fx = -force
            }
            if (this.keys[this.KEY_RIGHT] === true) {
                fx = force
            }

            // for diagonal forces we don't want to sum vectors, we want to apply some reducing
            // in order to make diagonal speed slower.
            if (fx !== 0 && fy !== 0) {
                fx = fx / 1.4;
                fy = fy / 1.4
            }

            forces.set(fName, new Vector(fx, fy, 0))

            if (fx !== 0 || fy !== 0) {
                pos.rotatingTo = new Vector(fx, fy, 0).normalize()
            }
        })
    }
}