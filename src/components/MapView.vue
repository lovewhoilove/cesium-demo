<template>
  <div class="wrap">
    <!-- 地球 -->
    <div class="globe" ref="globe"></div>
    <!-- 工具按钮组 -->
    <div class="tool">
      <div class="tool-item" v-for="item in toolOptions" :key="item.label" @click="handleItemClick(item.type)">
        <i :class="item.icon"></i>
      </div>
    </div>
    <!-- 图层管理抽屉 -->
    <el-drawer title="图层管理" :modal="false" size="380px" :visible.sync="drawerVisible">
      <el-row :gutter="18">
        <el-col :span="6" v-for="item in menuOptions" :key="item.value">
          <div class="menu-item" @click="handleLayerChange(item)">
            <img :style="{ borderColor: item.active ? '#409EFF' : 'transparent' }" :src="item.src" :alt="item.label" />
            <div class="title" :style="{ color: item.active ? '#409EFF' : '#606266' }">{{ item.label }}</div>
          </div>
        </el-col>
      </el-row>
    </el-drawer>
  </div>
</template>

<script>
import {
  Ion, Viewer, Cartesian3, Math,
  ArcGisMapServerImageryProvider, UrlTemplateImageryProvider,
  OpenStreetMapImageryProvider, ImageryLayer
} from 'cesium';

import Tianditu from '@/utils/layer/Tianditu';

import GaodeImageryProvider from '@/utils/layer/Gaode';

export default {
  name: 'MapView',
  provide() {
    return {
      getViewer: () => this.viewer,
    };
  },
  props: {
    mapType: {
      type: String,
      default: 'tdtVec'//可选值见下面menuOptions的value属性
    }
  },
  data() {
    this.viewer = null;
    return {
      toolOptions: [
        { type: 'layer_contorl', label: '图层管理', icon: ['cesium-', 'cesium-copy-document'] }
      ],
      drawerVisible: false,
      menuOptions: [
        { indexArr: [0, 1], value: 'tdtVec', label: '天地图电子', src: require('@/assets/images/tdt_vec.png') },
        { indexArr: [2, 3], value: 'tdtImg', label: '天地图影像', src: require('@/assets/images/tdt_img.png') },
        { indexArr: [4], value: 'esri', label: 'ArcGIS地图', src: require('@/assets/images/esri.png') },
        { indexArr: [5], value: 'gd', label: '高德地图', src: require('@/assets/images/gd.png') },
        { indexArr: [6], value: 'correctedGd', label: '高德地图（纠偏后）', src: require('@/assets/images/gd.png') },
        { indexArr: [7], value: 'osm', label: 'OSM地图', src: require('@/assets/images/osm.png') },
        { indexArr: [8], value: 'by', label: '必应地图', src: require('@/assets/images/by.png') },
        { indexArr: [9], value: 'mapbox', label: 'mapbox地图', src: require('@/assets/images/mapbox.png') },
      ]
    };
  },
  computed: {
    imageryLayers: {
      get() {
        return this.viewer.imageryLayers;
      },
      set() { }
    },
    allLyrIdx: {
      get() {
        return this.menuOptions.map(opt => opt.indexArr).flat();
      },
      set() { }
    }
  },
  created() {
    Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIwNThmOGZlYy0yMWRhLTQ1Y2QtOWEzYy1kZDc1OTdkMDFiZmUiLCJpZCI6ODg0MjQsImlhdCI6MTY2OTUxNjY0N30.EnNjIANE_y4A1mB2PjYdWQJ5iqGqgztwUdV7blYGcNo';
    this.setMapTypeActive(this.mapType);
  },
  mounted() {
    this.initMapViewer();
    this.addMapLayer();
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
        skyBox: false,//skyBox、Sun or Moon都不会被添加
        shouldAnimate: true, //是否允许动画
        showRenderLoopErrors: false,//如果为true，则如果出现渲染循环错误，此小部件将自动向用户显示包含错误的HTML面板。
        baseLayer: false,//新版本api移除默认图层的方法
      });
      //隐藏版权信息
      this.viewer.cesiumWidget.creditContainer.style.display = 'none';
      //添加帧速显示
      this.viewer.scene.debugShowFramesPerSecond = true;
    },
    async addMapLayer() {
      const tianditu = new Tianditu();

      //添加天地图矢量图层
      const vecService = tianditu.createTiandituService('矢量底图');
      const vecImageryLyr = this.imageryLayers.addImageryProvider(vecService, 0);
      const cvaService = tianditu.createTiandituService('矢量注记');
      const cvaImageryLyr = this.imageryLayers.addImageryProvider(cvaService, 1);
      vecImageryLyr.show = cvaImageryLyr.show = (this.mapType === 'tdtVec');

      //添加天地图影像图层
      const imgService = tianditu.createTiandituService('影像底图');
      const imgImageryLyr = this.imageryLayers.addImageryProvider(imgService, 2);
      const ciaService = tianditu.createTiandituService('影像注记');
      const ciaImageryLyr = this.imageryLayers.addImageryProvider(ciaService, 3);
      imgImageryLyr.show = ciaImageryLyr.show = (this.mapType === 'tdtImg');

      //添加ArcGIS瓦片地图
      const esriService = await ArcGisMapServerImageryProvider.fromUrl('https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer');
      const esriImageryLyr = this.imageryLayers.addImageryProvider(esriService, 4);
      esriImageryLyr.show = (this.mapType === 'esri');

      //添加高德地图
      const gdVecService = new UrlTemplateImageryProvider({
        url: 'https://webst0{s}.is.autonavi.com/appmaptile?lang=zh_cn&style=7&ltype=0&scl=0&size=0&x={x}&y={y}&z={z}',
        subdomains: ['1', '2', '3', '4'],
      });
      const gdVecImageryLyr = this.imageryLayers.addImageryProvider(gdVecService, 5);
      gdVecImageryLyr.show = (this.mapType === 'gd');

      //添加纠偏后的高德地图
      const correctedGdVecService = new GaodeImageryProvider('vec_zone_road_ano_block');//参数类型请参考封装类
      const correctedGdVecImageryLyr = this.imageryLayers.addImageryProvider(correctedGdVecService, 6);
      correctedGdVecImageryLyr.show = (this.mapType === 'gcorrectedGdd');

      //添加osm地图
      const osmService = new OpenStreetMapImageryProvider({
        url: 'https://tile.openstreetmap.org/'
      });
      const osmImageryLyr = this.imageryLayers.addImageryProvider(osmService, 7);
      osmImageryLyr.show = (this.mapType === 'osm');

      //添加必应地图(其实cesium默认地图就是必应的影像地图，上面的baseLayer属性设置为false，这里我们手动重新添加上去)
      const byImageryLyr = new ImageryLayer.fromWorldImagery();
      byImageryLyr.show = (this.mapType === 'by');
      this.imageryLayers.add(byImageryLyr, 8);

      //添加mapbox切片地图
      const mapboxService = new UrlTemplateImageryProvider({
        url: 'https://{s}.tiles.mapbox.com/v4/mapbox.satellite/' +
          '{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibG92ZXdob2lsb3ZlIiwiYSI6ImNscGV2bjhkZTFmamQya282Yzd0Zm1wazEifQ._J3OPz8jxEimR-uLcLpuug',
        subdomains: ['a', 'b', 'c', 'd'],
      });
      const mapboxLyr = this.imageryLayers.addImageryProvider(mapboxService, 9);
      mapboxLyr.show = (this.mapType === 'mapbox');
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
    handleItemClick(type) {
      switch (type) {
        case 'layer_contorl': {
          this.drawerVisible = true;
          break;
        }
        default: {
          break;
        }
      }
    },
    //切换图层
    handleLayerChange(item) {
      const { indexArr, value } = item;
      this.setMapTypeActive(value);
      this.handleChangeLyrVisible(indexArr);
    },
    handleChangeLyrVisible(arr) {
      //显示选中的图层类型
      arr.forEach(i => {
        if (!this.imageryLayers.get(i).show) this.imageryLayers.get(i).show = true;
      });
      //隐藏其他图层类型
      this.difference(this.allLyrIdx, arr).forEach(j => {
        if (this.imageryLayers.get(j).show) this.imageryLayers.get(j).show = false;
      });
    },
    //求两个数组之间的差集
    difference(arr1, arr2) {
      return arr1.filter(item => !arr2.includes(item));
    },
    //控制高亮显示选中的图层类型
    setMapTypeActive(mapType) {
      this.menuOptions = this.menuOptions.map(item => {
        if (item.value === mapType) {
          item.active = true;
        } else {
          item.active = false;
        }
        return item;
      });
    },
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  position: relative;
  height: 100%;
  margin: 0;
  padding: 0;

  .globe {
    height: 100%;
    margin: 0;
    padding: 0;
  }

  .tool {
    position: absolute;
    bottom: 20px;
    right: 10px;
    z-index: 99;
    display: flex;
    flex-direction: column;

    &-item {
      &:not(:last-child) {
        margin-bottom: 15px;
      }

      width: 42px;
      height: 42px;
      border-radius: 4px;
      background-color: white;
      box-shadow: 0 2px 4px rgba(0, 0, 0, .12),
      0 0 6px rgba(0, 0, 0, .04);
      display: flex;
      justify-content: center;
      align-items: center;

      i {
        font-size: 34px;
      }
    }
  }

  .menu-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    margin-top: 10px;

    img {
      width: 100%;
      border: 2px solid transparent;
      border-radius: 4px;
    }

    .title {
      text-align: center;
      font-size: 13px;
      margin-top: 5px;
    }
  }

  ::v-deep .el-drawer {
    color: #606266;

    &__wrapper {
      position: absolute;
      width: 380px;
      right: 0;
      left: auto;
    }

    &__header {
      color: #303133;
      font-weight: bold;
    }

    &__body {
      padding: 5px 20px 20px;
    }
  }

}

//帧数组件位置
::v-deep .cesium-performanceDisplay-defaultContainer {
  top: 10px;
  left: 10px;
  right: auto;
}
</style>