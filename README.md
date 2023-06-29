# arcgis-popup-control

基于ArcGis For JavaScript 4.x的自定义弹窗控制

## Features
*  纯JS实现，兼容性强

## Install

    npm install --save arcgis-popup-control
    or
    pnpm install --save arcgis-popup-control

## Usage

使用示例:

```js
import PopupControl from 'arcgis-popup-control'

// PopupControl 的部分配置参数
const options = {
    // 强制性必填
  view, 
    // open的回调返回 { left: 100, top: 100, attributes: {} } 结构的对象
  open: (obj) => { 
    // 更新定位并打开弹窗等逻辑
  },
  close: () => {
    // popupVisible = false等一些操作逻辑
  }
}

// 创建 PopupControl
const popupControl = new PopupControl(options)
```

## API

### PopupControl(options)

### Options

#### view

Type: `View` Required

arcgis View 实例对象

#### open

Type: `Function` Default: `undefined`

打开的处理方法,传入 { left: 100, top: 100, attributes: {} } 结构的对象,left top是距屏幕左和上的距离，attributes为graphic的属性

#### close

Type: `Function` Default: `undefined`

关闭的处理方法

#### include

Type: `HitTestItem[] | Collection<HitTestItem> | Layer | Graphic` Default: `undefined`

要包含在hitTest中的图层和图形列表。如果未指定include，则将包括所有图层和图形
[参照ArcGis MapView hitTest](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#hitTest)

#### exclude

Type: `HitTestItem[] | Collection<HitTestItem> | Layer | Graphic` Default: `undefined`

要从hitTest中排除的图层和图形列表。如果未指定exclude，则不排除任何图层或图形。
[参照ArcGis MapView hitTest](https://developers.arcgis.com/javascript/latest/api-reference/esri-views-MapView.html#hitTest)

#### emptyClose

Type: `Boolean` Default: `true`

点击空白处弹窗自动关闭

#### dragCloseType

Type: `Sting` Enum: `'close'` | `'hide'` | `'never'` Default: `'hide'`

地图移动时弹窗动作

*   `'close'`: 关闭弹窗
*   `'hide'`: 暂时隐藏,停止移动后显示
*   `'never'`: 不关闭

#### positionType

Type: `Sting` Enum: `'click'` | `'geometry'`  Default: `'geometry'`

定位坐标来源

*   `'click'`: 点击位置的坐标
*   `'geometry'`: Graphic geometry的中心点

#### goto

Type: `Boolean`  Default: `false`

是否开启view\.goto

#### transition

Type: `Number`  Default: `800`

goTo持续时长（毫秒） default: 800

## Related

*   [`arcgis-popup-example`](https://github.com/1103442828/arcgis-popup) – 示例项目

## License

MIT © [Matheus Fernandes](http://matheus.top)
