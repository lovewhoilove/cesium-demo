import { WebMercatorProjection, Math, WebMercatorTilingScheme, UrlTemplateImageryProvider } from 'cesium';
import gcoord from 'gcoord';

class GaoDeMercatorProjection extends WebMercatorProjection {
  project(cartographic, result) {
    const correct = gcoord.transform(
      [Math.toDegrees(cartographic.longitude), Math.toDegrees(cartographic.latitude)], gcoord.WGS84, gcoord.GCJ02);
    cartographic.longitude = Math.toRadians(correct[0]);
    cartographic.latitude = Math.toRadians(correct[1]);
    return super.project(cartographic, result);
  }

  unproject(cartesian, result) {
    result = super.unproject(cartesian, result);
    const correct = gcoord.transform(
      [Math.toDegrees(result.longitude), Math.toDegrees(result.latitude)], gcoord.GCJ02, gcoord.WGS84);
    result.longitude = Math.toRadians(correct[0]);
    result.latitude = Math.toRadians(correct[1]);
    return result;
  }
}

class GaoDeMercatorTilingScheme extends WebMercatorTilingScheme {
  constructor(options) {
    super(options);
    this._projection = new GaoDeMercatorProjection(this._ellipsoid);
  }
}

/**
 * 高德地图采用 GCJ02 火星坐标系，叠加到  Cesium 默认的 WGS84 通用坐标系需要进行纠偏。
 */
export default class GaoDeImageryProvider extends UrlTemplateImageryProvider {
  static sourceType = {
    'img': 'lang=zh_cn&style=6&ltype=0&scl=0&size=0', //影像底图
    'img_with_road_ano': 'lang=zh_cn&style=8&ltype=0&scl=0&size=0', //影像标注，路网 + 注记
    'img_road': 'lang=zh_cn&style=8&ltype=2&scl=0&size=0', //影像标注，路网
    'img_ano': 'lang=zh_cn&style=8&ltype=4&scl=0&size=0', //影像标注，注记
    'vec_zone_road_ano_block': 'lang=zh_cn&style=7&ltype=0&scl=0&size=0', //电子地图，区域面 + 路网 + 注记 + 楼块
    'vec_zone': 'lang=zh_cn&style=7&ltype=1&scl=0&size=0', //电子底图，区域面
    'vec_road': 'lang=zh_cn&style=7&ltype=2&scl=0&size=0', //电子标注，路网
    'vec_zone_road': 'lang=zh_cn&style=7&ltype=3&scl=0&size=0', //电子底图，区域面 + 路网
    'vec_ano': 'lang=zh_cn&style=7&ltype=4&scl=0&size=0', //电子标注，注记
    'vec_zone_ano': 'lang=zh_cn&style=7&ltype=5&scl=0&size=0', //电子底图，区域面 + 注记
    'vec_road_ano': 'lang=zh_cn&style=7&ltype=6&scl=0&size=0', //电子标注，路网 + 注记
    'vec_zone_road_ano': 'lang=zh_cn&style=7&ltype=7&scl=0&size=0', //电子底图，区域面 + 路网 + 注记
    'vec_block': 'lang=zh_cn&style=7&ltype=8&scl=0&size=0', //电子底图，楼块
    'vec_zone_road_block': 'lang=zh_cn&style=7&ltype=0&scl=2&size=0' //电子底图，区域面 + 路网 + 楼块
  };

  constructor(type, options = {}) {
    const templateUrl = 'https://wprd0{s}.is.autonavi.com/appmaptile?x={x}&y={y}&z={z}&{p}';
    const param = GaoDeImageryProvider.sourceType[type];
    const myUrl = templateUrl.replace(/\{p\}/g, param);
    super(Object.assign({}, {
      url: myUrl,
      subdomains: ['1', '2', '3', '4'],
      minimumLevel: 1,
      maximumLevel: 18,
      tilingScheme: new GaoDeMercatorTilingScheme()
    }, options));
  }
}
