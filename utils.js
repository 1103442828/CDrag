

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
