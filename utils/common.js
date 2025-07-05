/**
 * 通用工具类
 * 提供常用的工具方法和常量
 */

// 常量定义
export const CONSTANTS = {
  // 应用信息
  APP_NAME: 'SQL学习助手',
  APP_VERSION: '1.0.0',
  
  // 存储键名
  STORAGE_KEYS: {
    USER_INFO: 'userInfo',
    USER_STATS: 'userStats',
    EDITOR_STATE: 'editorState',
    SQL_EXECUTIONS: 'sqlExecutions',
    THEME: 'theme',
    SETTINGS: 'settings'
  },
  
  // 默认配置
  DEFAULTS: {
    MAX_HISTORY_SIZE: 50,
    MAX_EXECUTION_RECORDS: 100,
    MAX_TABLE_ROWS: 100,
    MAX_TABLE_COLUMNS: 10,
    EXECUTION_TIMEOUT: 30000
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败，请检查网络设置',
    DATABASE_ERROR: '数据库操作失败',
    PERMISSION_ERROR: '权限不足，请检查应用权限',
    VALIDATION_ERROR: '输入数据格式不正确',
    UNKNOWN_ERROR: '未知错误，请重试'
  },
  
  // 成功消息
  SUCCESS_MESSAGES: {
    SAVE_SUCCESS: '保存成功',
    DELETE_SUCCESS: '删除成功',
    COPY_SUCCESS: '复制成功',
    EXPORT_SUCCESS: '导出成功'
  }
}

// 日期时间工具
export const DateTimeUtils = {
  /**
   * 格式化日期
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
   * 检查是否为有效日期
   */
  isValidDate(date) {
    if (!date) return false
    const d = new Date(date)
    return !isNaN(d.getTime())
  }
}

// 字符串工具
export const StringUtils = {
  /**
   * 截断字符串
   */
  truncate(str, length = 50, suffix = '...') {
    if (!str || typeof str !== 'string') return ''
    if (str.length <= length) return str
    return str.substring(0, length) + suffix
  },
  
  /**
   * 首字母大写
   */
  capitalize(str) {
    if (!str || typeof str !== 'string') return ''
    return str.charAt(0).toUpperCase() + str.slice(1)
  },
  
  /**
   * 驼峰转下划线
   */
  camelToSnake(str) {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`)
  },
  
  /**
   * 下划线转驼峰
   */
  snakeToCamel(str) {
    if (!str || typeof str !== 'string') return ''
    return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase())
  },
  
  /**
   * 生成随机字符串
   */
  randomString(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let result = ''
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  },
  
  /**
   * 检查是否为空字符串
   */
  isEmpty(str) {
    return !str || typeof str !== 'string' || str.trim().length === 0
  }
}

// 数字工具
export const NumberUtils = {
  /**
   * 格式化数字
   */
  formatNumber(num, decimals = 2) {
    if (typeof num !== 'number' || isNaN(num)) return '0'
    
    if (Number.isInteger(num)) {
      return num.toLocaleString()
    }
    
    return num.toFixed(decimals).replace(/\.?0+$/, '')
  },
  
  /**
   * 格式化货币
   */
  formatCurrency(amount, currency = 'CNY') {
    if (typeof amount !== 'number' || isNaN(amount)) return '¥0.00'
    
    const formatter = new Intl.NumberFormat('zh-CN', {
      style: 'currency',
      currency: currency
    })
    
    return formatter.format(amount)
  },
  
  /**
   * 检查是否为有效数字
   */
  isValidNumber(num) {
    return typeof num === 'number' && !isNaN(num) && isFinite(num)
  },
  
  /**
   * 限制数字范围
   */
  clamp(num, min, max) {
    return Math.min(Math.max(num, min), max)
  }
}

// 数组工具
export const ArrayUtils = {
  /**
   * 数组去重
   */
  unique(arr) {
    if (!Array.isArray(arr)) return []
    return [...new Set(arr)]
  },
  
  /**
   * 数组分组
   */
  groupBy(arr, key) {
    if (!Array.isArray(arr)) return {}
    
    return arr.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : item[key]
      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(item)
      return groups
    }, {})
  },
  
  /**
   * 数组排序
   */
  sortBy(arr, key, order = 'asc') {
    if (!Array.isArray(arr)) return []
    
    const sorted = [...arr].sort((a, b) => {
      const aVal = typeof key === 'function' ? key(a) : a[key]
      const bVal = typeof key === 'function' ? key(b) : b[key]
      
      if (aVal < bVal) return order === 'asc' ? -1 : 1
      if (aVal > bVal) return order === 'asc' ? 1 : -1
      return 0
    })
    
    return sorted
  },
  
  /**
   * 数组分页
   */
  paginate(arr, page = 1, pageSize = 10) {
    if (!Array.isArray(arr)) return { data: [], total: 0, page: 1, pageSize }
    
    const total = arr.length
    const start = (page - 1) * pageSize
    const end = start + pageSize
    const data = arr.slice(start, end)
    
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    }
  }
}

// 对象工具
export const ObjectUtils = {
  /**
   * 深拷贝对象
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
   */
  merge(target, ...sources) {
    if (!target) target = {}
    
    sources.forEach(source => {
      if (source && typeof source === 'object') {
        for (const key in source) {
          if (source.hasOwnProperty(key)) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
              target[key] = this.merge(target[key] || {}, source[key])
            } else {
              target[key] = source[key]
            }
          }
        }
      }
    })
    
    return target
  },
  
  /**
   * 检查对象是否为空
   */
  isEmpty(obj) {
    if (!obj || typeof obj !== 'object') return true
    return Object.keys(obj).length === 0
  },
  
  /**
   * 获取对象属性值（支持路径）
   */
  get(obj, path, defaultValue) {
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
  }
}

// 验证工具
export const ValidationUtils = {
  /**
   * 验证邮箱
   */
  isValidEmail(email) {
    if (!email || typeof email !== 'string') return false
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailPattern.test(email)
  },
  
  /**
   * 验证手机号
   */
  isValidPhone(phone) {
    if (!phone || typeof phone !== 'string') return false
    const phonePattern = /^1[3-9]\d{9}$/
    return phonePattern.test(phone)
  },
  
  /**
   * 验证身份证号
   */
  isValidIdCard(idCard) {
    if (!idCard || typeof idCard !== 'string') return false
    const idCardPattern = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
    return idCardPattern.test(idCard)
  },
  
  /**
   * 验证URL
   */
  isValidUrl(url) {
    if (!url || typeof url !== 'string') return false
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }
}

// 存储工具
export const StorageUtils = {
  /**
   * 设置存储
   */
  set(key, value) {
    try {
      wx.setStorageSync(key, value)
      return true
    } catch (error) {
      console.error('设置存储失败:', error)
      return false
    }
  },
  
  /**
   * 获取存储
   */
  get(key, defaultValue = null) {
    try {
      const value = wx.getStorageSync(key)
      return value !== '' ? value : defaultValue
    } catch (error) {
      console.error('获取存储失败:', error)
      return defaultValue
    }
  },
  
  /**
   * 删除存储
   */
  remove(key) {
    try {
      wx.removeStorageSync(key)
      return true
    } catch (error) {
      console.error('删除存储失败:', error)
      return false
    }
  },
  
  /**
   * 清空存储
   */
  clear() {
    try {
      wx.clearStorageSync()
      return true
    } catch (error) {
      console.error('清空存储失败:', error)
      return false
    }
  },
  
  /**
   * 获取存储信息
   */
  getInfo() {
    try {
      return wx.getStorageInfoSync()
    } catch (error) {
      console.error('获取存储信息失败:', error)
      return null
    }
  }
}

// 网络工具
export const NetworkUtils = {
  /**
   * 检查网络状态
   */
  getNetworkType() {
    return new Promise((resolve) => {
      wx.getNetworkType({
        success: (res) => resolve(res.networkType),
        fail: () => resolve('unknown')
      })
    })
  },
  
  /**
   * 监听网络状态变化
   */
  onNetworkStatusChange(callback) {
    wx.onNetworkStatusChange(callback)
  },
  
  /**
   * 取消监听网络状态变化
   */
  offNetworkStatusChange(callback) {
    wx.offNetworkStatusChange(callback)
  }
}

// 设备工具
export const DeviceUtils = {
  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      return wx.getSystemInfoSync()
    } catch (error) {
      console.error('获取系统信息失败:', error)
      return null
    }
  },
  
  /**
   * 获取设备信息
   */
  getDeviceInfo() {
    const systemInfo = this.getSystemInfo()
    if (!systemInfo) return null
    
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
      safeArea: systemInfo.safeArea
    }
  },
  
  /**
   * 检查是否为iPhone X系列
   */
  isIPhoneX() {
    const systemInfo = this.getSystemInfo()
    if (!systemInfo) return false
    
    const { model, system } = systemInfo
    const modelLower = model.toLowerCase()
    const systemLower = system.toLowerCase()
    
    return modelLower.includes('iphone') && 
           (modelLower.includes('x') || 
            modelLower.includes('11') || 
            modelLower.includes('12') || 
            modelLower.includes('13') || 
            modelLower.includes('14') || 
            modelLower.includes('15'))
  }
}

// 导出默认工具对象
export default {
  CONSTANTS,
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