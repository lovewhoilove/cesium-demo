<template>
  <div class="wrap">
    <!-- 地球 -->
    <div class="globe" ref="globe"></div>
    <!-- 底图切换 -->
    <div class="switch">
      <el-radio-group v-model="type" size="small" @input="handleLayerChange">
        <el-radio-button label="vec">矢量</el-radio-button>
        <el-radio-button label="img">影像</el-radio-button>
      </el-radio-group>
    </div>
  </div>
</template>

<script>
import { Ion, Viewer, Cartesian3, Math } from 'cesium';

import Tianditu from '@/utils/Tianditu';

export default {
  name: 'MapView',
  provide() {
    return {
      getViewer: () => this.viewer,
    };
  },
  data() {
    this.viewer = null;

    this.vecImageryLyr = null;
    this.cvaImageryLyr = null;
    this.imgImageryLyr = null;
    this.ciaImageryLyr = null;

    return {
      type: 'vec',
    };
  },
  created() {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNThmOGZlYy0yMWRhLTQ1Y2QtOWEzYy1kZDc1OTdkMDFiZmUiLCJpZCI6ODg0MjQsImlhdCI6MTY2OTUxNjY0N30.EnNjIANE_y4A1mB2PjYdWQJ5iqGqgztwUdV7blYGcNo';
  },
  mounted() {
    this.initMapViewer();
    this.addTiandituLayer();
    this.initViewport();
  },
  methods: {
    initMapViewer() {
      this.viewer = new Viewer(this.$refs.globe, {
        geocoder: false,//位置查找工具(右上角的查询按钮)
        homeButton: false,//(首页位置)按钮，点击后会跳转到默认的全球视角
        sceneModePicker: false,//视角模式切换
        baseLayerPicker: false,//图层选择工具
        navigationHelpButton: false, // 导航帮助
        navigationInstructionsInitiallyVisible: false,//初始化前不显示导航说明
        animation: false, //动画小控件，即左下角的仪表
        timeline: false, //时间轴
        fullscreenButton: false,//全屏按钮
        infoBox: false,//不创建默认的信息框(弹窗)
        selectionIndicator: false,//是否显示选取指示器
        //scene3DOnly: true,//每个几何实例将仅以3D形式呈现以节省GPU内存
        skyBox: false,//skyBox、Sun or Moon都不会被添加
        shouldAnimate: true, //是否允许动画
        showRenderLoopErrors: false,//如果为true，则如果出现渲染循环错误，此小部件将自动向用户显示包含错误的HTML面板。
      });
      //隐藏版权信息
      this.viewer.cesiumWidget.creditContainer.style.display = 'none';
      //添加帧速显示
      this.viewer.scene.debugShowFramesPerSecond = true;
      this.viewer.imageryLayers.removeAll();//删除默认的影像图层
    },
    addTiandituLayer() {
      const tianditu = new Tianditu();
      const imgLyrs = this.viewer.imageryLayers;

      //添加矢量图层
      const vecService = tianditu.createTiandituService('矢量底图');
      this.vecImageryLyr = imgLyrs.addImageryProvider(vecService);
      const cvaService = tianditu.createTiandituService('矢量注记');
      this.cvaImageryLyr = imgLyrs.addImageryProvider(cvaService);

      //添加影像图层
      const imgService = tianditu.createTiandituService('影像底图');
      this.imgImageryLyr = imgLyrs.addImageryProvider(imgService);
      this.imgImageryLyr.show = false;
      const ciaService = tianditu.createTiandituService('影像注记');
      this.ciaImageryLyr = imgLyrs.addImageryProvider(ciaService);
      this.ciaImageryLyr.show = false;
    },
    initViewport() {
      this.viewer.camera.setView({
        destination: Cartesian3.fromDegrees(113.64, 34.82, 15000000),
        orientation: {
          heading: Math.toRadians(0),
          pitch: Math.toRadians(-90),
          roll: 0,
        }
      });
    },
    handleLayerChange(type) {
      switch (type) {
        case 'vec': {
          if (!this.vecImageryLyr.show) this.handleVecLayersVisible(true);
          if (this.imgImageryLyr.show) this.handleImgLayersVisible(false);
          break;
        }
        case 'img': {
          if (this.vecImageryLyr.show) this.handleVecLayersVisible(false);
          if (!this.imgImageryLyr.show) this.handleImgLayersVisible(true);
          break;
        }
        default: {
          break;
        }
      }
    },
    handleVecLayersVisible(bool) {
      this.vecImageryLyr.show = bool;
      this.cvaImageryLyr.show = bool;
    },
    handleImgLayersVisible(bool) {
      this.imgImageryLyr.show = bool;
      this.ciaImageryLyr.show = bool;
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  height: 100%;
  margin: 0;
  padding: 0;

  .globe {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .switch {
    position: absolute;
    bottom: 10px;
    right: 10px;
    z-index: 3;
  }
}

//帧数组件位置
::v-deep .cesium-performanceDisplay-defaultContainer {
  top: 10px;
}
</style>