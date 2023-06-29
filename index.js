import { getUniqueKey } from './utils'
import close from './assets/close.png'
import rotate from './assets/rotate.png'
import transform from './assets/transform.png'

// draw数据默认name
const defaultOptions = {
  left: 'left', // x轴距离
  top: 'top', // y轴距离
  rotate: 'rotate', // 旋转角度
  width: 'width', // 宽度（仅图片有效）
  height: 'height', // 高度（仅图片有效）
  scale: 'scale', // 缩放
  zIndex: 'zIndex', // 渲染层级
  img: 'img', // 图片地址 （仅图片有效）
  text: 'text', // 文本内容 （仅文本有效）
  color: 'color', // 文本颜色 （仅文本有效）
  size: 'size', // 文本大小（仅文本有效）
}

export default class CDrag {
  controlSize = 16
  #options = {}
  #drawList = []
  #ctx = null // canvas 2D content
  #canvas = null // canvas
  #selectKey = null
  #theme = null
  #imgNum = 0 // img 数量
  #loadNum = 0 // 加载数量
  #update = null // 更新列表回调方法
  #readOnly = false // 是否只读
  #move = false // 画布是否可移动
  #offsetX = 0 // 画布x偏移
  #offsetY = 0 // 画布y偏移
  scale = 1 // 缩放倍数
  closeImg = null
  rotateImg = null
  transformImg = null

  constructor ({ canvas, drawList = [], options = {}, update = null, theme = '#396FFF', move = true, scale = true, readOnly = false }) {
    if (!canvas || !canvas.getContext) {
      throw (Error('canvas 未找到'))
    }
    canvas.onmousedown = this.handleMousedown
    // readOnly && scale && (canvas.onmousewheel = (e) => this.handleMousewheel(e))
    this.#canvas = canvas
    this.#ctx = this.#canvas.getContext('2d')
    this.#options = { ...defaultOptions, ...options }
    this.#theme = theme
    this.#move = move
    this.#readOnly = readOnly
    this.#drawList = drawList
    this.#update = update
    this.sortAndPreload()
    this.loadControlImg()
  }

  // 排序与图片加载
  sortAndPreload () {
    const { img, zIndex, width, size, height, text, color, left, top, rotate } = this.#options
    // 根据zIndex升序
    this.#drawList.sort((item1, item2) => item1[zIndex] - item2[zIndex])
    // 增加key与统计待加载图片数
    const preloadList = this.#drawList.filter(rect => {
      // 赋默认值
      rect[left] = rect[left] ?? 10
      rect[top] = rect[top] ?? 10
      rect[rotate] = rect[rotate] || 0
      rect[zIndex] = rect[zIndex] || 0
      if (rect[img]) {
        rect[width] = rect[width] || 100
        rect[height] = rect[height] || 100
      } else if (rect[text]) {
        rect[size] = rect[size] || 16
        rect[color] = rect[color] || '#000'
      }
      rect.tempKey || (rect.tempKey = getUniqueKey())
      if (rect[img] && !rect.imageEle) {
        this.#imgNum++
      }
      return rect[img] && !rect.imageEle
    })
    // 图片加载
    preloadList.forEach(item => {
      const imageEle = new Image() // 创建 img 元素
      imageEle.onload = () => {
        this.#loadNum++
        if (this.#loadNum === this.#imgNum) {
          this.#imgNum = 0
          this.#loadNum = 0
          this.draw()
        }
      }
      item.imageEle = imageEle // 保存img 元素
      imageEle.src = item[img] // 设置图片源地址
    })
    this.updateDrawList()
  }

  /**
   * 添加绘制
   * @param {*} drawData
   */
  addDraw (drawData) {
    if (drawData) {
      Array.isArray(drawData) ? this.#drawList.push(...drawData) : this.#drawList.push(drawData)
      this.sortAndPreload()
      this.draw()
    }
  }

  /**
   * 重设drawList
   * @param {*} newDrawList 新的绘制数据列表
   */
  setDrawList (newDrawList = []) {
    if (Array.isArray(newDrawList)) {
      this.#offsetX = 0
      this.#offsetY = 0
      this.#drawList = newDrawList
      this.sortAndPreload()
      this.draw()
    }
  }

  /**
   * 加载控件图片
   */
  loadControlImg () {
    Array.from([[close, 'closeImg'], [rotate, 'rotateImg'], [transform, 'transformImg']]).forEach(([url, img]) => {
      const imageEle = new Image()
      this[img] = imageEle
      imageEle.src = url
    })
  }

  /**
   * 绘制图形
   * @param {*} hitTestPoint
   * @returns rect: Object, type: String | null
   */
  draw (hitTestPoint) {
    const { img, text } = this.#options
    let graphic = null
    this.clearCanvas()
    this.#drawList.forEach(drawData => {
      if (drawData[text]) {
        const rect = this.drawText(drawData, hitTestPoint)
        rect && (graphic = { rect, type: 'move' })
      }
      if (drawData[img]) {
        const rect = this.drawImg(drawData, hitTestPoint)
        rect && (graphic = { rect, type: 'move' })
      }
      if (this.#selectKey === drawData.tempKey) {
        const control = this.drawTransform(drawData, hitTestPoint)
        control && (graphic = control)
      }
    })
    return graphic
  }

  // 选中最后渲染
  selectTop () {
    const { img, text } = this.#options
    this.clearCanvas()
    this.#drawList.forEach(drawData => {
      if (this.#selectKey !== drawData.tempKey) {
        if (drawData[text]) {
          this.drawText(drawData)
        }
        if (drawData[img]) {
          this.drawImg(drawData)
        }
      }
    })
    const selectRect = this.getSelectedRect()
    if (selectRect) {
      if (selectRect[text]) {
        this.drawText(selectRect)
      }
      if (selectRect[img]) {
        this.drawImg(selectRect)
      }
      this.drawTransform(selectRect)
    }
  }

  /**
   * 图片绘制
   * @param {*} drawData
   * @param {*} hitTestPoint
   * @returns rect | undefine
   */
  drawImg (drawData, hitTestPoint) {
    if (this.#ctx && drawData.imageEle) {
      const { left, top, width, height, rotate } = this.#options
      // 开始新路径
      this.#ctx.beginPath()
      // 保证状态
      this.#ctx.save()
      // 改变中心
      this.#ctx.translate(drawData[left] + drawData[width] / 2, drawData[top] + drawData[height] / 2)
      // 旋转
      this.#ctx.rotate(drawData[rotate] * Math.PI / 180)
      this.#ctx.drawImage(drawData.imageEle, -drawData[width] / 2, -drawData[height] / 2, drawData[width], drawData[height])
      // 是否绘制命中检测包裹容器
      if (hitTestPoint) {
        this.#ctx.strokeStyle = 'transparent'
        this.#ctx.rect(-drawData[width] / 2, -drawData[height] / 2, drawData[width], drawData[height])
        this.#ctx.stroke()
        if (this.#ctx.isPointInPath(hitTestPoint.pointX, hitTestPoint.pointY)) {
          this.#selectKey = drawData.tempKey
          this.#ctx.restore()
          return drawData
        }
      }
      // 恢复
      this.#ctx.restore()
    }
  }

  /**
   * 文本绘制
   * @param {*} drawData
   * @param {*} hitTestPoint
   * @returns  rect | undefine
   */
  drawText (drawData, hitTestPoint) {
    if (this.#ctx) {
      const { left, top, size, text, color, width, height, rotate } = this.#options
      this.#ctx.beginPath()
      this.#ctx.textBaseline = 'top'
      this.#ctx.font = `${drawData[size]}px system-ui`
      // 设置文字宽高
      drawData[width] = drawData[text]?.length * drawData[size]
      drawData[height] = drawData[size]
      this.#ctx.fillStyle = drawData[color]
      this.#ctx.save()
      this.#ctx.translate(drawData[left] + drawData[width] / 2, drawData[top] + drawData[height] / 2)
      this.#ctx.rotate(drawData[rotate] * Math.PI / 180)
      this.#ctx.fillText(drawData[text], -drawData[width] / 2, -drawData[height] / 2)
      // 是否绘制命中检测包裹容器
      if (hitTestPoint) {
        this.#ctx.strokeStyle = 'transparent'
        this.#ctx.rect(-drawData[width] / 2, -drawData[height] / 2, drawData[width], drawData[height])
        this.#ctx.stroke()
        if (this.#ctx.isPointInPath(hitTestPoint.pointX, hitTestPoint.pointY)) {
          this.#selectKey = drawData.tempKey
          this.#ctx.restore()
          return drawData
        }
      }
      this.#ctx.restore()
    }
  }

  /**
   * 绘制控件
   * @param {*} rect
   * @param {*} hitTestPoint
   * @returns rect: Object, type: String | null
   */
   drawTransform = (rect, hitTestPoint) => {
     if (this.#readOnly) {
       return
     }
     let controlType = null
     const { controlSize } = this
     const { width, height, rotate, text, size } = this.#options
     const { leftTop, rightTop, rightBottom } = this.computeRect(rect)
     const rectWidth = rect[width] + 2
     const rectHeight = rect[height] + 2
     const rectLeft = leftTop[0] - 1
     //  针对文字的边框向上偏移
     const rectTop = rect[text] ? leftTop[1] - rect[size] / 10 : leftTop[1] - 1
     this.#ctx.beginPath()
     this.#ctx.strokeStyle = this.#theme
     this.#ctx.save()
     this.#ctx.translate(rectLeft + rectWidth / 2, rectTop + rectHeight / 2)
     this.#ctx.rotate(rect[rotate] * Math.PI / 180)
     this.#ctx.strokeRect(-rectWidth / 2, -rectHeight / 2, rectWidth, rectHeight)
     this.#ctx.restore()
     const control = [this.closeImg, this.rotateImg, this.transformImg]
     const controlW = (this.controlSize - 4) * 2
     const offset = controlSize / 2 + 4
     const controlList = [
       { left: leftTop[0] - offset, top: leftTop[1] - offset, width: controlW, height: controlW, type: 'close' },
       { left: rightTop[0] - offset, top: rightTop[1] - offset, width: controlW, height: controlW, type: 'rotate' },
       { left: rightBottom[0] - offset, top: rightBottom[1] - offset, width: controlW, height: controlW, type: 'transform' },
     ]
     Array.from([leftTop, rightTop, rightBottom]).forEach(([x, y], index) => {
       this.#ctx.beginPath()
       this.#ctx.fillStyle = this.#theme
       this.#ctx.save()
       this.#ctx.translate(rectLeft + rectWidth / 2, rectTop + rectHeight / 2)
       this.#ctx.rotate(rect[rotate] * Math.PI / 180)
       const offsetX = index > 0 ? rectWidth : 0
       const offsetY = index === 2 ? rectHeight : 0
       const controlLeft = -(rectWidth / 2 + controlSize / 2) + offsetX
       const controlTop = -(rectHeight / 2 + controlSize / 2) + offsetY
       this.#ctx.arc(controlLeft + controlSize / 2, controlTop + controlSize / 2, controlSize - 4, 0, 2 * Math.PI)
       this.#ctx.fill()
       this.#ctx.stroke()
       if (hitTestPoint && this.#ctx.isPointInPath(hitTestPoint.pointX, hitTestPoint.pointY)) {
         const { type, ...rest } = controlList[index]
         controlType = { rect: rest, type }
       }
       this.#ctx.restore()
       this.#ctx.fillStyle = 'transparent'
       this.#ctx.save()
       this.#ctx.translate(rectLeft + rectWidth / 2, rectTop + rectHeight / 2)
       this.#ctx.rotate(rect[rotate] * Math.PI / 180)
       this.#ctx.drawImage(control[index], controlLeft + 2, controlTop + 2, controlSize - 4, controlSize - 4)
       this.#ctx.restore()
     })
     return controlType
   }

   // 清空画板
   clearCanvas () {
     this.#ctx.clearRect(0 + -this.#offsetX, 0 + -this.#offsetY, this.#canvas.width, this.#canvas.height)
   }

   /**
    * 命中检测
    * @param { PointEvent } pointEvent
    * @returns rect: Object, type: String | null
    */
   getHitTestGraphic ({ clientX, clientY }) {
     const pointX = clientX - this.#canvas.offsetLeft
     const pointY = clientY - this.#canvas.offsetTop
     const graphic = this.draw({ pointX, pointY })
     return graphic
   }

   /**
   * 计算矩形四个顶点坐标
   * @param {*} rect
   */
   computeRect (rect) {
     const { left, top, width, height } = this.#options
     const leftTop = [rect[left], rect[top]]
     const rightTop = [rect[left] + rect[width], rect[top]]
     const rightBottom = [rect[left] + rect[width], rect[top] + rect[height]]
     const leftBottom = [rect[left], rect[top] + rect[height]]
     return { leftTop, rightTop, rightBottom, leftBottom }
   }

   /**
   * 矩形中心点
   * @param {*} rect
   * @returns
   */
   computeCenter (rect) {
     const { left, top, width, height } = this.#options
     const centerX = ((rect[left] + rect[width]) / 2) + this.#canvas.offsetLeft
     const centerY = ((rect[top] + rect[height]) / 2) + this.#canvas.offsetTop
     return { centerX, centerY }
   }

   /**
    * 获取选中图形
    * @returns
    */
   getSelectedRect () {
     return this.#drawList.find(rect => rect.tempKey === this.#selectKey)
   }

  /**
   * mousedown 处理
   * @param {*} event
   */
  handleMousedown = (event) => { // 记录点击坐标
    let { clientX: downX, clientY: downY } = event
    const { rotate, width, height, left, top, img, text, size } = this.#options
    // 命中结果
    const result = this.getHitTestGraphic(event)
    const toDragX = result ? downX - result.rect[left] : 0 // 点击点到左边距离
    const toDragY = result ? downY - result.rect[top] : 0 // 点击点到右边距离
    // 选中图形
    const selectRect = this.getSelectedRect()
    // 缓存初始化数据
    let initRotate = 0
    let initWidth = 0
    let initHeight = 0
    if (this.#selectKey) {
      initRotate = selectRect[rotate]
      initWidth = selectRect[width]
      initHeight = selectRect[height]
    }
    if (!result) {
      this.#selectKey = null
    } else if (result?.type === 'close') {
      this.#drawList = this.#drawList.filter(rect => rect.tempKey !== selectRect.tempKey)
      this.#selectKey = null
      this.updateDrawList()
      this.draw()
      return
    }
    this.selectTop()

    const handleMousemove = ({ clientX, clientY }) => {
      switch (result?.type) {
        case 'move':
          if (this.#readOnly) {
            return
          }
          result.rect[left] = clientX - toDragX
          result.rect[top] = clientY - toDragY
          this.selectTop()
          break
        case 'rotate': {
          const { centerX, centerY } = this.computeCenter(selectRect)
          // 按下时的角度
          const angleBefore = Math.atan2(downY - centerY, downX - centerX) / Math.PI * 180
          // 移动形成的角度
          const angleAfter = Math.atan2(clientY - centerY, clientX - centerX) / Math.PI * 180
          // 旋转的角度
          selectRect[rotate] = initRotate + angleAfter - angleBefore
          this.selectTop()
        }
          break
        case 'transform': {
          // 移动的x距离
          const moveX = clientX - downX
          // 移动的y距离
          const moveY = clientY - downY
          let newWidth = initWidth + moveX
          let newHeight = initHeight + moveY
          // 反向
          if (newWidth < 0) {
            newWidth = -newWidth
          }
          if (newHeight < 0) {
            newHeight = -newHeight
          }
          // 限制最小宽高与size
          if (selectRect[img]) {
            selectRect[width] = newWidth < 6 ? 6 : newWidth
            selectRect[height] = newHeight < 6 ? 6 : newHeight
          } else if (selectRect[text]) {
            selectRect[size] = newHeight < 12 ? 12 : newHeight
          }
          this.selectTop()
        }
          break
        default:
          if (this.#readOnly && this.#move) {
            const moveX = clientX - downX
            const moveY = clientY - downY
            this.#offsetX += moveX
            this.#offsetY += moveY
            this.#ctx.translate(moveX, moveY)
            downX = downX + moveX
            downY = downY + moveY
            this.draw()
          }
          break
      }
    }
    const handleMouseup = () => {
      this.#canvas.removeEventListener('mousemove', handleMousemove)
      this.#canvas.removeEventListener('mouseup', handleMouseup)
      this.updateDrawList()
    }
    this.#canvas.addEventListener('mousemove', handleMousemove)
    this.#canvas.addEventListener('mouseup', handleMouseup)
  }

  /**
   * 缩放
   * @param {*} e
   */
  handleMousewheel (e) {
    e.preventDefault()
    const direction = e.deltaY > 0 ? 'down' : 'up' // deltaY为正则滚轮向下，为负滚轮向上
    if (direction === 'down' && e.deltaY >= 1) {
      this.scale -= 0.1
      this.scale > 0.5 && this.#ctx.scale(0.9, 0.9)
    }
    if (direction === 'up' && e.deltaY <= -1) {
      this.scale += 0.1
      this.scale < 2 && this.#ctx.scale(1.1, 1.1)
    }
    this.draw()
  }

  /**
   * 更新列表
   */
  updateDrawList () {
    if (typeof this.#update === 'function') {
      this.#update(this.#drawList)
    }
  }

  /**
   * 销毁
   */
  destroy () {
    this.#canvas.onmousedown = null
    this.clearCanvas()
    this.#canvas.mousewheel = null
    this.#canvas.onmousedown = null
    this.#update = null
    this.#canvas = null
    this.#drawList = null
    this.#selectKey = null
    this.#ctx = null
  }
}
