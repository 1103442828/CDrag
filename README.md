## CDrage

基于canvas 2d的图片文字拖拽、变形画板


## 安装

    npm install --save CDrag
    or
    pnpm install --save CDrag

## 使用示例


```js
import CDrag from 'CDrag'

const canvas = document.getElementById('CDrag-canvas')
// CDrag 的配置参数
const config = {
   // Canvas HTMLElement 强制性必填
  canvas, 
   // 要渲染的图形列表
  drawList: [
    {
      left: 200,
      top: 200,
      rotate: 45,
      width: 200,
      height: 160,
      zIndex: 0,
      img: 'https://images.pexels.com/photos/943905/pexels-photo-943905.jpeg?auto=compress&cs=tinysrgb&w=1600'
    },
    {
      left: 60,
      top: 60,
      rotate: 0,
      zIndex: 1,
      text: '引力波',
      size: 20,
      color: '#E6A23C'
    }
  ]
  // 列表更新回调
  update: (newList) => { console.log('更新后列表', newList)}
  // drawList数据项各字段name，可根据业务修改
  options: {
      left: 'left', // x轴距离
      top: 'top', // y轴距离
      rotate: 'rotate', // 旋转角度
      width: 'width', // 宽度（仅图片有效）
      height: 'height', // 高度（仅图片有效）
      zIndex: 'zIndex', // 渲染层级
      img: 'img', // 图片地址 （仅图片有效）
      text: 'text', // 文本内容 （仅文本有效）
      color: 'color', // 文本颜色 （仅文本有效）
      size: 'size', // 文本大小（仅文本有效）
    },
    // 图形选中时边框与控件颜色
    theme: '#396FFF',
    // 只展示不可操作(删除、变形、旋转)
    readOnly: false,
    // 画布是否可移动(仅在readOnly为true时有效)
    move = true,
    // 画布是否可缩放(仅在readOnly为true时有效)
    scale = true,
  }

// 创建 PopupControl
const cDrag = new CDrag(config)
```

### 添加新的渲染图形

```js
const newDrawItem = {
      left: 100,
      top: 100,
      rotate: 0,
      zIndex: 1,
      text: '引力波1',
      size: 20,
      color: '#000'
    }
cDrag.addDraw(newDrawItem)
```

### 设置新渲染图形列表

```js
import CDrag from 'CDrag'

const cDrag = new CDrag(config)
const newDrawList = [{
      left: 100,
      top: 100,
      rotate: 0,
      zIndex: 1,
      text: '引力波1',
      size: 20,
      color: '#000'
    }]
cDrag.setDrawList(newDrawList)
```

## config 参数
| 参数      | 说明    | 类型      | 可选值       | 默认值   |
|---------- |-------- |---------- |-------------  |-------- |
| canvas | Canvas Dom对象 | HTMLElement | 必填 | - |
| drawList | 要渲染的图形列表 | Array | 必填 | - |
| update | drawList列表更新的回调,返回更新后的drawList， (newList) => {} | Function | - | - |
| options | drawList数据项各字段名称，详情参加下面options | Object | - | - |
| theme | 图形选中时边框与控件颜色 | 参考[strokeStyle](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/strokeStyle)与[fillStyle](https://developer.mozilla.org/zh-CN/docs/Web/API/CanvasRenderingContext2D/fillStyle) | — | '#396FFF' |
| readOnly | 只展示不可操作(删除、变形、旋转) | Boolean  | false | false |
| move | 画布是否可移动(仅在readOnly为true时有效) | Boolean | false | true |
| scale | 画布是否可缩放(仅在readOnly为true时有效) | Boolean | false | true |

## options 指定选项的值为选项对象的某个属性值
| 参数      | 说明    | 类型      | 默认值   |
|---------- |-------- |---------- |-------- |
| left | x轴距离 | String | 'left' |
| top | y轴距离 | String | 'top' |
| width | 宽度（仅图片有效 最小值6） | String | 'width' |
| height |高度（仅图片有效 最小值6） | String | 'height' |
| rotate |旋转角度 | String | 'rotate' |
| img | 图片地址 （仅图片有效） | String | 'img' |
| text | 文本内容 （仅文本有效,默认值#000） | String | 'text' |
| color | 文本颜色 （仅文本有效） | String | 'color' |
| size | 文本大小（仅文本有效,最小值12） | String | 'size' |

### 方法
| 方法名 | 说明 | 类型      | 参数 |
| ---- | ---- | ---- | ---- | 
| addDraw | 添加新的渲染渲染数据项,触发update回调并绘制 | Object | drawItem |
| setDrawList | 设置drawList列表，触发update回调并绘制 | Array  |newDrawList |
| destroy | 销毁方法 | -  |- |
## Related

*   [`CDrag-example`](https://github.com/1103442828/CDrag-example) – 示例项目

## License

MIT © [Matheus Fernandes](http://matheus.top)
