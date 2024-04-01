<template>
  <div class="one-map">
    <MapView :mapType="'tdtImg'" /> <!-- 这里我们可以传入默认要显示的图层类型 -->
  </div>
</template>

<script>
import MapView from '@/components/MapView';

export default {
  name: "OneMap",
  components: {
    MapView,
  },
}
</script>

<style lang="scss" scoped>
.one-map {
  position: relative;
  height: 100%;
}
</style>
