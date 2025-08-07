/**
 * 通用工具类模块
 * 
 * 该模块提供应用所需的通用工具方法和常量定义，包括：
 * - 常量定义
 * - 日期时间工具
 * - 字符串处理工具
 * - 数字处理工具
 * - 数组处理工具
 * - 对象处理工具
 * - 验证工具
 * - 存储工具
 * - 网络工具
 * - 设备信息工具
 * 
 * @author SQL学习助手团队
 * @version 1.0.0
 * @since 2024-01-01
 */

/**
 * 应用常量定义
 * @type {Object}
 */
export const CONSTANTS = {
  // 应用信息
  APP_NAME: 'SQL学习助手',
  APP_VERSION: '1.0.0',
  APP_DESCRIPTION: '随时随地学习SQL的微信小程序',
  
  // 存储键名
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    USER_STATS: 'userStats',
    EDITOR_STATE: 'editorState',
    SQL_EXECUTIONS: 'sqlExecutions',
    THEME: 'theme',
    SETTINGS: 'settings',
    ERROR_LOGS: 'errorLogs',
    APP_STATE: 'appState'
  },
  
  // 默认配置
  DEFAULTS: {
    MAX_HISTORY_SIZE: 50,
    MAX_EXECUTION_RECORDS: 100,
    MAX_TABLE_ROWS: 100,
    MAX_TABLE_COLUMNS: 10,
    EXECUTION_TIMEOUT: 30000,
    CACHE_EXPIRE_TIME: 7 * 24 * 60 * 60 * 1000 // 7天
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    DATABASE_ERROR: '数据库操作失败',
    PERMISSION_ERROR: '权限不足，请检查应用权限',
    VALIDATION_ERROR: '输入数据格式不正确',
    UNKNOWN_ERROR: '未知错误，请重试',
    TIMEOUT_ERROR: '操作超时，请重试',
    STORAGE_ERROR: '存储操作失败',
    API_ERROR: '接口调用失败'
  },
  
  // 成功消息
  SUCCESS_MESSAGES: {
    SAVE_SUCCESS: '保存成功',
    DELETE_SUCCESS: '删除成功',
    COPY_SUCCESS: '复制成功',
    EXPORT_SUCCESS: '导出成功',
    UPDATE_SUCCESS: '更新成功',
    SYNC_SUCCESS: '同步成功'
  },
  
  // 正则表达式
  REGEX: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^1[3-9]\d{9}$/,
    ID_CARD: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
    URL: /^https?:\/\/.+/,
    SQL_KEYWORDS: /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|JOIN|GROUP BY|ORDER BY|HAVING|UNION|DISTINCT|LIMIT|OFFSET)\b/gi
  },
  
  // 主题配置
  THEMES: {
    LIGHT: {
      name: 'light',
      primaryColor: '#007aff',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderColor: '#e5e5e5'
    },
    DARK: {
      name: 'dark',
      primaryColor: '#0a84ff',
      backgroundColor: '#000000',
      textColor: '#ffffff',
      borderColor: '#38383a'
    }
  }
}

/**
 * 日期时间工具类
 * 提供日期时间相关的工具方法
 */
export const DateTimeUtils = {
  /**
   * 格式化日期
   * 
   * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
   * @param {string} format - 格式化模板，支持 YYYY-MM-DD HH:mm:ss
   * @returns {string} 格式化后的日期字符串
   * 
   * @example
   * formatDate(new Date(), 'YYYY-MM-DD') // '2024-01-01'
   * formatDate('2024-01-01', 'YYYY年MM月DD日') // '2024年01月01日'
   */
  formatDate(date, format = 'YYYY-MM-DD') {
    if (!date) return ''
    
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''
    
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    const seconds = String(d.getSeconds()).padStart(2, '0')
    
    return format
      .replace('YYYY', year)
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  },
  
  /**
   * 获取相对时间
   * 
   * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
   * @returns {string} 相对时间字符串
   * 
   * @example
   * getRelativeTime(new Date()) // '刚刚'
   * getRelativeTime(Date.now() - 60000) // '1分钟前'
   */
  getRelativeTime(date) {
    if (!date) return ''
    
    const now = new Date()
    const target = new Date(date)
    const diff = now - target
    
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day
    
    if (diff < minute) return '刚刚'
    if (diff < hour) return `${Math.floor(diff / minute)}分钟前`
    if (diff < day) return `${Math.floor(diff / hour)}小时前`
    if (diff < week) return `${Math.floor(diff / day)}天前`
    if (diff < month) return `${Math.floor(diff / week)}周前`
    if (diff < year) return `${Math.floor(diff / month)}个月前`
    
    return `${Math.floor(diff / year)}年前`
  },
  
  /**
   * 验证日期是否有效
   * 
   * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
   * @returns {boolean} 是否为有效日期
   */
  isValidDate(date) {
    if (!date) return false
    
    const d = new Date(date)
    return !isNaN(d.getTime())
  },
  
  /**
   * 获取当前时间戳
   * 
   * @returns {number} 当前时间戳
   */
  getCurrentTimestamp() {
    return Date.now()
  },
  
  /**
   * 计算两个日期之间的差值
   * 
   * @param {Date|string|number} date1 - 日期1
   * @param {Date|string|number} date2 - 日期2
   * @param {string} unit - 单位：'days', 'hours', 'minutes', 'seconds'
   * @returns {number} 差值
   */
  getDateDiff(date1, date2, unit = 'days') {
    const d1 = new Date(date1)
    const d2 = new Date(date2)
    const diff = Math.abs(d2 - d1)
    
    const units = {
      days: 24 * 60 * 60 * 1000,
      hours: 60 * 60 * 1000,
      minutes: 60 * 1000,
      seconds: 1000
    }
    
    return Math.floor(diff / units[unit])
  }
}

/**
 * 字符串处理工具类
 * 提供字符串相关的工具方法
 */
export const StringUtils = {
  /**
   * 截断字符串
   * 
   * @param {string} str - 原字符串
   * @param {number} length - 最大长度
   * @param {string} suffix - 后缀
   * @returns {string} 截断后的字符串
   */
  truncate(str, length = 50, suffix = '...') {
    if (!str || str.length <= length) return str
    return str.substring(0, length) + suffix
  },
  
  /**
   * 首字母大写
   * 
   * @param {string} str - 原字符串
   * @returns {string} 首字母大写的字符串
   */
  capitalize(str) {
    if (!str) return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  
  /**
   * 驼峰命名转下划线命名
   * 
   * @param {string} str - 驼峰命名字符串
   * @returns {string} 下划线命名字符串
   */
  camelToSnake(str) {
    if (!str) return ''
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  },
  
  /**
   * 下划线命名转驼峰命名
   * 
   * @param {string} str - 下划线命名字符串
   * @returns {string} 驼峰命名字符串
   */
  snakeToCamel(str) {
    if (!str) return ''
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  },
  
  /**
   * 生成随机字符串
   * 
   * @param {number} length - 字符串长度
   * @param {string} charset - 字符集
   * @returns {string} 随机字符串
   */
  randomString(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
    let result = ''
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }
    return result
  },
  
  /**
   * 检查字符串是否为空
   * 
   * @param {string} str - 待检查的字符串
   * @returns {boolean} 是否为空
   */
  isEmpty(str) {
    return !str || str.trim().length === 0
  },
  
  /**
   * 移除字符串首尾空格
   * 
   * @param {string} str - 原字符串
   * @returns {string} 处理后的字符串
   */
  trim(str) {
    return str ? str.trim() : ''
  },
  
  /**
   * 转义HTML特殊字符
   * 
   * @param {string} str - 原字符串
   * @returns {string} 转义后的字符串
   */
  escapeHtml(str) {
    if (!str) return ''
    
    const htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;'
    }
    
    return str.replace(/[&<>"'/]/g, match => htmlEscapes[match])
  }
}

/**
 * 数字处理工具类
 * 提供数字相关的工具方法
 */
export const NumberUtils = {
  /**
   * 格式化数字
   * 
   * @param {number} num - 数字
   * @param {number} decimals - 小数位数
   * @returns {string} 格式化后的数字字符串
   */
  formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '0'
    
    return num.toFixed(decimals).replace(/\.?0+$/, '')
  },
  
  /**
   * 格式化货币
   * 
   * @param {number} amount - 金额
   * @param {string} currency - 货币符号
   * @returns {string} 格式化后的货币字符串
   */
  formatCurrency(amount, currency = 'CNY') {
    if (typeof amount !== 'number' || isNaN(amount)) return `${currency} 0.00`
    
    const symbols = {
      CNY: '¥',
      USD: '$',
      EUR: '€'
    }
    
    const symbol = symbols[currency] || currency
    return `${symbol} ${amount.toFixed(2)}`
  },
  
  /**
   * 验证数字是否有效
   * 
   * @param {number} num - 待验证的数字
   * @returns {boolean} 是否为有效数字
   */
  isValidNumber(num) {
    return typeof num === 'number' && !isNaN(num) && isFinite(num)
  },
  
  /**
   * 限制数字范围
   * 
   * @param {number} num - 数字
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 限制后的数字
   */
  clamp(num, min, max) {
    if (!this.isValidNumber(num)) return min
    return Math.min(Math.max(num, min), max)
  },
  
  /**
   * 生成指定范围内的随机整数
   * 
   * @param {number} min - 最小值
   * @param {number} max - 最大值
   * @returns {number} 随机整数
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }
}

/**
 * 数组处理工具类
 * 提供数组相关的工具方法
 */
export const ArrayUtils = {
  /**
   * 数组去重
   * 
   * @param {Array} arr - 原数组
   * @returns {Array} 去重后的数组
   */
  unique(arr) {
    if (!Array.isArray(arr)) return []
    return [...new Set(arr)]
  },
  
  /**
   * 按指定键分组
   * 
   * @param {Array} arr - 原数组
   * @param {string} key - 分组键
   * @returns {Object} 分组后的对象
   */
  groupBy(arr, key) {
    if (!Array.isArray(arr)) return {}
    
    return arr.reduce((groups, item) => {
      const groupKey = item[key]
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {})
  },
  
  /**
   * 按指定键排序
   * 
   * @param {Array} arr - 原数组
   * @param {string} key - 排序键
   * @param {string} order - 排序方向：'asc' 或 'desc'
   * @returns {Array} 排序后的数组
   */
  sortBy(arr, key, order = 'asc') {
    if (!Array.isArray(arr)) return []
    
    return [...arr].sort((a, b) => {
      const aVal = a[key]
      const bVal = b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
  },
  
  /**
   * 分页处理
   * 
   * @param {Array} arr - 原数组
   * @param {number} page - 页码（从1开始）
   * @param {number} pageSize - 每页大小
   * @returns {Object} 分页结果
   */
  paginate(arr, page = 1, pageSize = 10) {
    if (!Array.isArray(arr)) {
      return {
        data: [],
        total: 0,
        page: 1,
        pageSize: pageSize,
        totalPages: 0
      }
    }
    
    const total = arr.length
    const totalPages = Math.ceil(total / pageSize)
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    
    return {
      data: arr.slice(startIndex, endIndex),
      total,
      page,
      pageSize,
      totalPages
    }
  },
  
  /**
   * 数组扁平化
   * 
   * @param {Array} arr - 原数组
   * @param {number} depth - 扁平化深度
   * @returns {Array} 扁平化后的数组
   */
  flatten(arr, depth = 1) {
    if (!Array.isArray(arr)) return []
    
    if (depth <= 0) return arr
    
    return arr.reduce((flat, item) => {
      return flat.concat(Array.isArray(item) ? this.flatten(item, depth - 1) : item)
    }, [])
  }
}

/**
 * 对象处理工具类
 * 提供对象相关的工具方法
 */
export const ObjectUtils = {
  /**
   * 深拷贝对象
   * 
   * @param {*} obj - 待拷贝的对象
   * @returns {*} 拷贝后的对象
   */
  deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj
    if (obj instanceof Date) return new Date(obj.getTime())
    if (obj instanceof Array) return obj.map(item => this.deepClone(item))
    if (typeof obj === 'object') {
      const cloned = {}
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          cloned[key] = this.deepClone(obj[key])
        }
      }
      return cloned
    }
    return obj
  },
  
  /**
   * 合并对象
   * 
   * @param {Object} target - 目标对象
   * @param {...Object} sources - 源对象
   * @returns {Object} 合并后的对象
   */
  merge(target, ...sources) {
    if (!target || typeof target !== 'object') return target
    
    sources.forEach(source => {
      if (source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
          if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            target[key] = this.merge(target[key] || {}, source[key])
          } else {
            target[key] = source[key]
          }
        })
      }
    })
    
    return target
  },
  
  /**
   * 检查对象是否为空
   * 
   * @param {Object} obj - 待检查的对象
   * @returns {boolean} 是否为空
   */
  isEmpty(obj) {
    if (!obj || typeof obj !== 'object') return true
    return Object.keys(obj).length === 0
  },
  
  /**
   * 安全获取对象属性
   * 
   * @param {Object} obj - 对象
   * @param {string} path - 属性路径
   * @param {*} defaultValue - 默认值
   * @returns {*} 属性值
   */
  get(obj, path, defaultValue = undefined) {
    if (!obj || typeof obj !== 'object') return defaultValue
    
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result && typeof result === 'object' && key in result) {
        result = result[key]
      } else {
        return defaultValue
      }
    }
    
    return result
  },
  
  /**
   * 移除对象中的空值
   * 
   * @param {Object} obj - 原对象
   * @returns {Object} 处理后的对象
   */
  removeEmpty(obj) {
    if (!obj || typeof obj !== 'object') return obj
    
    const result = {}
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      if (value !== null && value !== undefined && value !== '') {
        result[key] = value
      }
    })
    
    return result
  }
}

/**
 * 验证工具类
 * 提供数据验证相关的工具方法
 */
export const ValidationUtils = {
  /**
   * 验证邮箱格式
   * 
   * @param {string} email - 邮箱地址
   * @returns {boolean} 是否为有效邮箱
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false
    return CONSTANTS.REGEX.EMAIL.test(email.trim())
  },
  
  /**
   * 验证手机号格式
   * 
   * @param {string} phone - 手机号
   * @returns {boolean} 是否为有效手机号
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false
    return CONSTANTS.REGEX.PHONE.test(phone.trim())
  },
  
  /**
   * 验证身份证号格式
   * 
   * @param {string} idCard - 身份证号
   * @returns {boolean} 是否为有效身份证号
   */
  isValidIdCard(idCard) {
    if (!idCard || typeof idCard !== 'string') return false
    return CONSTANTS.REGEX.ID_CARD.test(idCard.trim())
  },
  
  /**
   * 验证URL格式
   * 
   * @param {string} url - URL地址
   * @returns {boolean} 是否为有效URL
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false
    return CONSTANTS.REGEX.URL.test(url.trim())
  },
  
  /**
   * 验证SQL语句格式
   * 
   * @param {string} sql - SQL语句
   * @returns {boolean} 是否为有效SQL语句
   */
  isValidSql(sql) {
    if (!sql || typeof sql !== 'string') return false
    
    const trimmedSql = sql.trim()
    if (trimmedSql.length === 0) return false
    
    // 检查是否包含SQL关键字
    return CONSTANTS.REGEX.SQL_KEYWORDS.test(trimmedSql)
  }
}

/**
 * 存储工具类
 * 提供本地存储相关的工具方法
 */
export const StorageUtils = {
  /**
   * 设置存储项
   * 
   * @param {string} key - 键名
   * @param {*} value - 值
   * @param {number} expireTime - 过期时间（毫秒）
   */
  set(key, value, expireTime = null) {
    try {
      const data = {
        value,
        timestamp: Date.now(),
        expireTime: expireTime ? Date.now() + expireTime : null
      }
      
      wx.setStorageSync(key, JSON.stringify(data))
    } catch (error) {
      console.error('存储数据失败:', error)
      throw new Error(CONSTANTS.ERROR_MESSAGES.STORAGE_ERROR)
    }
  },
  
  /**
   * 获取存储项
   * 
   * @param {string} key - 键名
   * @param {*} defaultValue - 默认值
   * @returns {*} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      const data = wx.getStorageSync(key)
      if (!data) return defaultValue
      
      const parsed = JSON.parse(data)
      
      // 检查是否过期
      if (parsed.expireTime && Date.now() > parsed.expireTime) {
        this.remove(key)
        return defaultValue
      }
      
      return parsed.value
    } catch (error) {
      console.error('获取存储数据失败:', error)
      return defaultValue
    }
  },
  
  /**
   * 移除存储项
   * 
   * @param {string} key - 键名
   */
  remove(key) {
    try {
      wx.removeStorageSync(key)
    } catch (error) {
      console.error('移除存储数据失败:', error)
    }
  },
  
  /**
   * 清空所有存储
   */
  clear() {
    try {
      wx.clearStorageSync()
    } catch (error) {
      console.error('清空存储失败:', error)
    }
  },
  
  /**
   * 获取存储信息
   * 
   * @returns {Object} 存储信息
   */
  getInfo() {
    try {
      return wx.getStorageInfoSync()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return {
        keys: [],
        currentSize: 0,
        limitSize: 0
      }
    }
  }
}

/**
 * 网络工具类
 * 提供网络相关的工具方法
 */
export const NetworkUtils = {
  /**
   * 获取网络类型
   * 
   * @returns {Promise<string>} 网络类型
   */
  getNetworkType() {
    return new Promise((resolve, reject) => {
      wx.getNetworkType({
        success: (res) => {
          resolve(res.networkType)
        },
        fail: (error) => {
          console.error('获取网络类型失败:', error)
          reject(error)
        }
      })
    })
  },
  
  /**
   * 监听网络状态变化
   * 
   * @param {Function} callback - 回调函数
   */
  onNetworkStatusChange(callback) {
    wx.onNetworkStatusChange(callback)
  },
  
  /**
   * 取消监听网络状态变化
   * 
   * @param {Function} callback - 回调函数
   */
  offNetworkStatusChange(callback) {
    wx.offNetworkStatusChange(callback)
  },
  
  /**
   * 检查网络连接状态
   * 
   * @returns {Promise<boolean>} 是否在线
   */
  async isOnline() {
    try {
      const networkType = await this.getNetworkType()
      return networkType !== 'none'
    } catch (error) {
      console.error('检查网络状态失败:', error)
      return false
    }
  }
}

/**
 * 设备信息工具类
 * 提供设备信息相关的工具方法
 */
export const DeviceUtils = {
  /**
   * 获取系统信息
   * 
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    try {
      return wx.getSystemInfoSync()
    } catch (error) {
      console.error('获取系统信息失败:', error)
      return {}
    }
  },
  
  /**
   * 获取设备信息
   * 
   * @returns {Object} 设备信息
   */
  getDeviceInfo() {
    try {
      const systemInfo = this.getSystemInfo()
      
      return {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion,
        brand: systemInfo.brand,
        model: systemInfo.model,
        pixelRatio: systemInfo.pixelRatio,
        screenWidth: systemInfo.screenWidth,
        screenHeight: systemInfo.screenHeight,
        windowWidth: systemInfo.windowWidth,
        windowHeight: systemInfo.windowHeight,
        statusBarHeight: systemInfo.statusBarHeight,
        language: systemInfo.language,
        fontSizeSetting: systemInfo.fontSizeSetting
      }
    } catch (error) {
      console.error('获取设备信息失败:', error)
      return {}
    }
  },
  
  /**
   * 检查是否为iPhone X系列
   * 
   * @returns {boolean} 是否为iPhone X系列
   */
  isIPhoneX() {
    try {
      const systemInfo = this.getSystemInfo()
      const { model, screenHeight } = systemInfo
      
      // 检查机型
      if (model && /iPhone X|iPhone 11|iPhone 12|iPhone 13|iPhone 14|iPhone 15/i.test(model)) {
        return true
      }
      
      // 检查屏幕高度
      if (screenHeight >= 812) {
        return true
      }
      
      return false
    } catch (error) {
      console.error('检查iPhone X失败:', error)
      return false
    }
  },
  
  /**
   * 获取安全区域信息
   * 
   * @returns {Object} 安全区域信息
   */
  getSafeArea() {
    try {
      const systemInfo = this.getSystemInfo()
      return systemInfo.safeArea || {
        left: 0,
        right: systemInfo.screenWidth,
        top: 0,
        bottom: systemInfo.screenHeight,
        width: systemInfo.screenWidth,
        height: systemInfo.screenHeight
      }
    } catch (error) {
      console.error('获取安全区域失败:', error)
      return {
        left: 0,
        right: 375,
        top: 0,
        bottom: 667,
        width: 375,
        height: 667
      }
    }
  }
}

// 导出所有工具类
export {
  DateTimeUtils,
  StringUtils,
  NumberUtils,
  ArrayUtils,
  ObjectUtils,
  ValidationUtils,
  StorageUtils,
  NetworkUtils,
  DeviceUtils
} 