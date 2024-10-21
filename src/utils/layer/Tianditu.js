import { WebMapTileServiceImageryProvider, UrlTemplateImageryProvider } from 'cesium';

export default class Tianditu {
  #baseUrl = 'https://t{s}.tianditu.gov.cn/';
  #tk = '你的tk';
  #sourceType = {
    '矢量底图': 'vec',
    '矢量注记': 'cva',
    '影像底图': 'img',
    '影像注记': 'cia',
  };

  //官方服务说明处给出的请求url示例：http://lbs.tianditu.gov.cn/server/MapService.html
  createTiandituService(serviceType) {
    const layer = this.#sourceType[serviceType];
    const url = this.#baseUrl + layer + '_w/wmts?' +
      'service=wmts&request=GetTile&version=1.0.0&LAYER=' + layer +
      '&tileMatrixSet=w&TileMatrix={TileMatrix}&TileRow={TileRow}&TileCol={TileCol}&tk='
      + this.#tk;
    return new WebMapTileServiceImageryProvider({
      url,
      layer,
      style: 'default',
      format: 'tiles',
      tileMatrixSetID: 'GoogleMapsCompatible',
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18
    });
  }

  //官方文档的引入方法：http://lbs.tianditu.gov.cn/docs/#/sanwei/
  createTiandituService2(serviceType) {
    const layer = this.#sourceType[serviceType];
    const url = this.#baseUrl + 'DataServer?T=' + layer + '_w&x={x}&y={y}&l={z}&tk=' + this.#tk;
    return new UrlTemplateImageryProvider({
      url,
      subdomains: ['0', '1', '2', '3', '4', '5', '6', '7'],
      maximumLevel: 18
    });
  }
}
