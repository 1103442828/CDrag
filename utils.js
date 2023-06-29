/**
 * 判断点是否在要素范围内
 * @param {*} point
 * @param {*} rect
 * @returns
 */
export function hitTest ([downX, downY], [[x1, y1], [x2, y2], [x3, y3], [x4, y4]]) {
  const v1 = [x1 - downX, y1 - downY]
  const v2 = [x2 - downX, y2 - downY]
  const v3 = [x3 - downX, y3 - downY]
  const v4 = [x4 - downX, y4 - downY]
  if (
    (v1[0] * v2[1] - v2[0] * v1[1]) > 0 &&
      (v2[0] * v4[1] - v4[0] * v2[1]) > 0 &&
      (v4[0] * v3[1] - v3[0] * v4[1]) > 0 &&
      (v3[0] * v1[1] - v1[0] * v3[1]) > 0
  ) {
    return true
  }
  return false
}

/**
 * 获取区间随机数
 * @param {Number} start
 * @param {Number} end
 * @returns
 */
export const getRandomNumber = (start, end) => Number.parseInt((Math.random() * (end - start)) + start)

/**
 * 生成随机key
 * @param {Number} length key长度
 * @returns
 */
export const getUniqueKey = (length = 10) => {
  const num = '0123456789'
  const lowercase = 'abcdefghijklmnopqrstuvwxyz'
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const chars = `${num}${lowercase}${uppercase}`
  const end = chars.length
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars[getRandomNumber(0, end)]
  }
  return result
}
