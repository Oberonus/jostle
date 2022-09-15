import {types} from "@/game/entities/components"

/**
 * Components registry
 */
export default class Registry {
    types = types
    count = 0
    components = new Map()

    newID() {
        this.count++
        return this.count
    }

    add(id, val) {
        if (!this.components.has(val.type)) {
            this.components.set(val.type, new Map())
        }
        this.components.get(val.type).set(id, val)
        return this
    }

    all(type) {
        const all = this.components.get(type)
        if (!all) {
            return []
        }
        return all
    }

    first(type) {
        const all = this.all(type)
        if (all.length === 0) return null
        return all.values().next().value
    }

    firstID(type) {
        const all = this.all(type)
        if (all.length === 0) return null
        return all.keys().next().value
    }

    removeEntity(id) {
        this.components.forEach(mp => {
            mp.delete(id)
        })
    }

    is(id, type) {
        return !!this.get(id, type)
    }

    get(id, type) {
        const all = this.all(type)
        if (!all || all.length === 0) {
            return null
        }

        return all.get(id)
    }
}
