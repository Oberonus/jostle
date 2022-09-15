export default class Vector {
    /**
     * @param x {number}
     * @param y {number}
     * @param z {number}
     */
    constructor(x = 0, y = 0, z = 0) {
        this.x = x
        this.y = y
        this.z = z
    }

    /**
     * Sum two vectors
     *
     * @param vec {Vector}
     * @returns {Vector}
     */
    add(vec) {
        return new Vector(this.x + vec.x, this.y + vec.y, this.z + vec.z)
    }

    /**
     * Clone vector
     *
     * @returns {Vector}
     */
    clone() {
        return new Vector(this.x, this.y, this.z)
    }

    /**
     * Subtract a vector
     *
     * @param vec {Vector}
     * @returns {Vector}
     */
    sub(vec) {
        return new Vector(this.x - vec.x, this.y - vec.y, this.z - vec.z)
    }

    /**
     * Divide vector by some scalar value
     *
     * @param val {number}
     * @returns {Vector}
     */
    divide(val) {
        return new Vector(this.x / val, this.y / val, this.z / val)
    }

    /**
     * Multiply vector by some scalar value
     *
     * @param val {number}
     * @returns {Vector}
     */
    multiply(val) {
        return new Vector(this.x * val, this.y * val, this.z * val)
    }

    /**
     * Calculate distance between two vectors
     *
     * @param vec {Vector}
     * @returns {number}
     */
    distance(vec) {
        return Math.sqrt(
            Math.pow(this.x - vec.x, 2) +
            Math.pow(this.y - vec.y, 2) +
            Math.pow(this.z - vec.z, 2)
        )
    }

    /**
     * Normalize vector
     *
     * @returns {Vector}
     */
    normalize() {
        const magnitude = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2))
        return this.divide(magnitude)
    }

    rotate(radians) {
        return new Vector(
            this.x * Math.cos(radians) - this.y * Math.sin(radians),
            this.x * Math.sin(radians) + this.y * Math.cos(radians)
        )
    }
}