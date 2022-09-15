export default {
    images: new Map,

    sources: {
        "water": 'graphics/water2.png',
        "grass": "graphics/sand.png",
        "bush": "graphics/bush.png",
        "ladybug-bad": "graphics/ladybug.png",
        "ladybug": "graphics/ladybug-bad.png",
        "cloud": "graphics/cloud.png"
    },

    loadAll(callback) {
        const imagesCount = Object.keys(this.sources).length
        let imagesLoaded = 0

        for (const [name, url] of Object.entries(this.sources)) {
            const img = new Image();
            this.images.set(name, img)
            img.onload = () => {
                imagesLoaded++
                if (imagesLoaded === imagesCount) {
                    console.log("all textures loaded successfully")
                    callback()
                }
            };
            img.src = url;
        }
    },

    get(type) {
        return this.images.get(type)
    }
}