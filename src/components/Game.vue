<template>
  <div>
    <canvas ref="canvas" class="playground"></canvas>
  </div>
</template>

<script>

import Game from "@/game"

export default {
  name: 'HelloWorld',

  data() {
    return {
    }
  },

  mounted() {
    const canvas = this.$refs.canvas
    canvas.width=700;
    canvas.height=700;
    new Game(canvas).start()
  }
}
</script>

<style scoped>
.playground {
  width: 700px;
  height: 700px;
}
</style>
