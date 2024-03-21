<template>
  <div class="container" ref="container"></div>
</template>

<script>
import { Ion, Viewer } from 'cesium';

Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNThmOGZlYy0yMWRhLTQ1Y2QtOWEzYy1kZDc1OTdkMDFiZmUiLCJpZCI6ODg0MjQsImlhdCI6MTY2OTUxNjY0N30.EnNjIANE_y4A1mB2PjYdWQJ5iqGqgztwUdV7blYGcNo';

export default {
  name: 'MapView',
  provide() {
    return {
      getViewer: () => this.viewer,
    };
  },
  data() {
    this.viewer = null;

    return {};
  },
  mounted() {
    this.initMapViewer();
  },
  methods: {
    initMapViewer() {
      this.viewer = new Viewer(this.$refs.container, {
        geocoder: false,//位置查找工具(右上角的查询按钮)
        homeButton: false,//(首页位置)按钮，点击后会跳转到默认的全球视角
        sceneModePicker: false,//视角模式切换
        baseLayerPicker: false,//图层选择工具
        navigationHelpButton: false, // 导航帮助
        navigationInstructionsInitiallyVisible: false,//初始化前不显示导航说明
        animation: false, //动画小控件，即左下角的仪表
        timeline: false, //时间轴
        vrButton: false,//vr按钮
        fullscreenButton: false,//全屏按钮
        infoBox: false,//不创建默认的信息框(弹窗)
        selectionIndicator: false,//是否显示选取指示器
        scene3DOnly: true,//每个几何实例将仅以3D形式呈现以节省GPU内存
        skyBox: false,//skyBox、Sun or Moon都不会被添加
      });
      //隐藏版权信息
      this.viewer.cesiumWidget.creditContainer.style.display = 'none';
      //添加帧速显示
      this.viewer.scene.debugShowFramesPerSecond = true;
    },
  },
}
</script>

<style lang="scss" scoped>
.container {
  height: 100%;
  margin: 0;
  padding: 0;
}

::v-deep .cesium-performanceDisplay-defaultContainer {
  top: 10px;
}
</style>