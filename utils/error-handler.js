/**
 * 错误处理工具类
 * 
 * 该模块提供统一的错误处理机制，包括：
 * - 错误分类和处理
 * - 错误日志记录
 * - 错误上报功能
 * - 用户友好的错误提示
 * - 错误恢复机制
 * 
 * @author SQL学习助手团队
 * @version 1.0.0
 * @since 2024-01-01
 */

import { CONSTANTS, StorageUtils, DateTimeUtils } from './common.js'

/**
 * 错误类型枚举
 * @enum {string}
 */
export const ERROR_TYPES = {
  NETWORK: 'NETWORK_ERROR',
  DATABASE: 'DATABASE_ERROR',
  VALIDATION: 'VALIDATION_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  TIMEOUT: 'TIMEOUT_ERROR',
  STORAGE: 'STORAGE_ERROR',
  API: 'API_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
}

/**
 * 错误严重程度枚举
 * @enum {string}
 */
export const ERROR_SEVERITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  CRITICAL: 'CRITICAL'
}

/**
 * 错误处理类
 * 提供统一的错误处理机制
 */
export class ErrorHandler {
  /**
   * 构造函数
   * 
   * @param {Object} options - 配置选项
   * @param {boolean} options.enableLogging - 是否启用日志记录
   * @param {boolean} options.enableReporting - 是否启用错误上报
   * @param {number} options.maxLogSize - 最大日志数量
   */
  constructor(options = {}) {
    this.options = {
      enableLogging: true,
      enableReporting: true,
      maxLogSize: 1000,
      ...options
    }
    
    this.errorCount = 0
    this.lastErrorTime = null
    
    // 初始化错误处理器
    this.init()
  }

  /**
   * 初始化错误处理器
   */
  init() {
    try {
      // 设置全局错误监听
      this.setupGlobalErrorHandlers()
      
      // 清理过期错误日志
      this.cleanupExpiredLogs()
      
      console.log('错误处理器初始化完成')
    } catch (error) {
      console.error('错误处理器初始化失败:', error)
    }
  }

  /**
   * 设置全局错误监听器
   */
  setupGlobalErrorHandlers() {
    // 监听未捕获的Promise错误
    wx.onUnhandledRejection((res) => {
      this.handleError(res.reason, {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.MEDIUM,
        context: 'UnhandledPromiseRejection'
      })
    })

    // 监听小程序错误
    wx.onError((error) => {
      this.handleError(error, {
        type: ERROR_TYPES.UNKNOWN,
        severity: ERROR_SEVERITY.HIGH,
        context: 'AppError'
      })
    })
  }

  /**
   * 处理错误
   * 
   * @param {Error|string} error - 错误对象或错误信息
   * @param {Object} options - 错误处理选项
   * @param {string} options.type - 错误类型
   * @param {string} options.severity - 错误严重程度
   * @param {string} options.context - 错误上下文
   * @param {Object} options.metadata - 额外元数据
   */
  handleError(error, options = {}) {
    try {
      // 解析错误信息
      const errorInfo = this.parseError(error, options)
      
      // 记录错误
      if (this.options.enableLogging) {
        this.logError(errorInfo)
      }
      
      // 上报错误
      if (this.options.enableReporting) {
        this.reportError(errorInfo)
      }
      
      // 更新错误统计
      this.updateErrorStats(errorInfo)
      
      // 显示用户友好的错误提示
      this.showUserFriendlyError(errorInfo)
      
      console.error('错误已处理:', errorInfo)
    } catch (handlerError) {
      console.error('错误处理失败:', handlerError)
    }
  }

  /**
   * 解析错误信息
   * 
   * @param {Error|string} error - 错误对象或错误信息
   * @param {Object} options - 错误处理选项
   * @returns {Object} 解析后的错误信息
   */
  parseError(error, options = {}) {
    const now = new Date()
    
    let errorMessage = ''
    let errorStack = ''
    let errorName = 'Error'
    
    if (error instanceof Error) {
      errorMessage = error.message
      errorStack = error.stack
      errorName = error.name
    } else if (typeof error === 'string') {
      errorMessage = error
    } else {
      errorMessage = '未知错误'
    }
    
    return {
      id: this.generateErrorId(),
      message: errorMessage,
      stack: errorStack,
      name: errorName,
      type: options.type || ERROR_TYPES.UNKNOWN,
      severity: options.severity || ERROR_SEVERITY.MEDIUM,
      context: options.context || 'Unknown',
      metadata: options.metadata || {},
      timestamp: now.toISOString(),
      timestampMs: now.getTime(),
      userAgent: this.getUserAgent(),
      systemInfo: this.getSystemInfo()
    }
  }

  /**
   * 生成错误ID
   * 
   * @returns {string} 错误ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取用户代理信息
   * 
   * @returns {string} 用户代理字符串
   */
  getUserAgent() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      return `${systemInfo.platform}/${systemInfo.system} ${systemInfo.version}`
    } catch (error) {
      return 'Unknown'
    }
  }

  /**
   * 获取系统信息
   * 
   * @returns {Object} 系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
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
      return {}
    }
  }

  /**
   * 记录错误日志
   * 
   * @param {Object} errorInfo - 错误信息
   */
  logError(errorInfo) {
    try {
      const errorLogs = StorageUtils.get(CONSTANTS.STORAGE_KEYS.ERROR_LOGS, [])
      
      // 添加新错误日志
      errorLogs.push(errorInfo)
      
      // 限制日志数量
      if (errorLogs.length > this.options.maxLogSize) {
        errorLogs.splice(0, errorLogs.length - this.options.maxLogSize)
      }
      
      // 保存错误日志
      StorageUtils.set(CONSTANTS.STORAGE_KEYS.ERROR_LOGS, errorLogs)
      
      console.log('错误日志已记录:', errorInfo.id)
    } catch (error) {
      console.error('记录错误日志失败:', error)
    }
  }

  /**
   * 上报错误
   * 
   * @param {Object} errorInfo - 错误信息
   */
  async reportError(errorInfo) {
    try {
      // TODO: 实现错误上报逻辑
      // 这里应该将错误信息发送到服务器
      
      // 模拟上报
      console.log('错误上报:', {
        id: errorInfo.id,
        type: errorInfo.type,
        severity: errorInfo.severity,
        message: errorInfo.message,
        timestamp: errorInfo.timestamp
      })
      
      // 存储待上报的错误
      const pendingReports = StorageUtils.get('pendingErrorReports', [])
      pendingReports.push(errorInfo)
      StorageUtils.set('pendingErrorReports', pendingReports)
      
    } catch (error) {
      console.error('错误上报失败:', error)
    }
  }

  /**
   * 更新错误统计
   * 
   * @param {Object} errorInfo - 错误信息
   */
  updateErrorStats(errorInfo) {
    this.errorCount++
    this.lastErrorTime = errorInfo.timestamp
    
    // 更新错误统计信息
    const stats = StorageUtils.get('errorStats', {
      totalErrors: 0,
      errorTypes: {},
      lastErrorTime: null,
      errorCount: 0
    })
    
    stats.totalErrors++
    stats.errorCount = this.errorCount
    stats.lastErrorTime = errorInfo.timestamp
    
    if (!stats.errorTypes[errorInfo.type]) {
      stats.errorTypes[errorInfo.type] = 0
    }
    stats.errorTypes[errorInfo.type]++
    
    StorageUtils.set('errorStats', stats)
  }

  /**
   * 显示用户友好的错误提示
   * 
   * @param {Object} errorInfo - 错误信息
   */
  showUserFriendlyError(errorInfo) {
    try {
      // 根据错误类型和严重程度决定是否显示用户提示
      if (errorInfo.severity === ERROR_SEVERITY.LOW) {
        return // 低严重程度错误不显示用户提示
      }
      
      let message = ''
      
      switch (errorInfo.type) {
        case ERROR_TYPES.NETWORK:
          message = CONSTANTS.ERROR_MESSAGES.NETWORK_ERROR
          break
        case ERROR_TYPES.DATABASE:
          message = CONSTANTS.ERROR_MESSAGES.DATABASE_ERROR
          break
        case ERROR_TYPES.PERMISSION:
          message = CONSTANTS.ERROR_MESSAGES.PERMISSION_ERROR
          break
        case ERROR_TYPES.VALIDATION:
          message = CONSTANTS.ERROR_MESSAGES.VALIDATION_ERROR
          break
        case ERROR_TYPES.TIMEOUT:
          message = CONSTANTS.ERROR_MESSAGES.TIMEOUT_ERROR
          break
        case ERROR_TYPES.STORAGE:
          message = CONSTANTS.ERROR_MESSAGES.STORAGE_ERROR
          break
        case ERROR_TYPES.API:
          message = CONSTANTS.ERROR_MESSAGES.API_ERROR
          break
        default:
          message = CONSTANTS.ERROR_MESSAGES.UNKNOWN_ERROR
      }
      
      // 显示错误提示
      wx.showToast({
        title: message,
        icon: 'error',
        duration: 2000
      })
      
    } catch (error) {
      console.error('显示错误提示失败:', error)
    }
  }

  /**
   * 清理过期的错误日志
   */
  cleanupExpiredLogs() {
    try {
      const errorLogs = StorageUtils.get(CONSTANTS.STORAGE_KEYS.ERROR_LOGS, [])
      const now = Date.now()
      const expireTime = 30 * 24 * 60 * 60 * 1000 // 30天
      
      const filteredLogs = errorLogs.filter(log => {
        const logTime = new Date(log.timestamp).getTime()
        return (now - logTime) < expireTime
      })
      
      if (filteredLogs.length !== errorLogs.length) {
        StorageUtils.set(CONSTANTS.STORAGE_KEYS.ERROR_LOGS, filteredLogs)
        console.log(`清理了 ${errorLogs.length - filteredLogs.length} 条过期错误日志`)
      }
    } catch (error) {
      console.error('清理过期错误日志失败:', error)
    }
  }

  /**
   * 获取错误统计信息
   * 
   * @returns {Object} 错误统计信息
   */
  getErrorStats() {
    try {
      return StorageUtils.get('errorStats', {
        totalErrors: 0,
        errorTypes: {},
        lastErrorTime: null,
        errorCount: 0
      })
    } catch (error) {
      console.error('获取错误统计失败:', error)
      return {
        totalErrors: 0,
        errorTypes: {},
        lastErrorTime: null,
        errorCount: 0
      }
    }
  }

  /**
   * 获取最近的错误日志
   * 
   * @param {number} limit - 限制数量
   * @returns {Array} 错误日志数组
   */
  getRecentErrors(limit = 10) {
    try {
      const errorLogs = StorageUtils.get(CONSTANTS.STORAGE_KEYS.ERROR_LOGS, [])
      return errorLogs.slice(-limit).reverse()
    } catch (error) {
      console.error('获取最近错误日志失败:', error)
      return []
    }
  }

  /**
   * 清除所有错误日志
   */
  clearErrorLogs() {
    try {
      StorageUtils.remove(CONSTANTS.STORAGE_KEYS.ERROR_LOGS)
      StorageUtils.remove('errorStats')
      StorageUtils.remove('pendingErrorReports')
      
      this.errorCount = 0
      this.lastErrorTime = null
      
      console.log('错误日志已清除')
    } catch (error) {
      console.error('清除错误日志失败:', error)
    }
  }

  /**
   * 检查是否为可恢复的错误
   * 
   * @param {Object} errorInfo - 错误信息
   * @returns {boolean} 是否可恢复
   */
  isRecoverableError(errorInfo) {
    const recoverableTypes = [
      ERROR_TYPES.NETWORK,
      ERROR_TYPES.TIMEOUT,
      ERROR_TYPES.STORAGE
    ]
    
    return recoverableTypes.includes(errorInfo.type) && 
           errorInfo.severity !== ERROR_SEVERITY.CRITICAL
  }

  /**
   * 尝试恢复错误
   * 
   * @param {Object} errorInfo - 错误信息
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async tryRecoverError(errorInfo) {
    try {
      if (!this.isRecoverableError(errorInfo)) {
        return false
      }
      
      switch (errorInfo.type) {
        case ERROR_TYPES.NETWORK:
          return await this.recoverNetworkError(errorInfo)
        case ERROR_TYPES.STORAGE:
          return await this.recoverStorageError(errorInfo)
        case ERROR_TYPES.TIMEOUT:
          return await this.recoverTimeoutError(errorInfo)
        default:
          return false
      }
    } catch (error) {
      console.error('错误恢复失败:', error)
      return false
    }
  }

  /**
   * 恢复网络错误
   * 
   * @param {Object} errorInfo - 错误信息
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async recoverNetworkError(errorInfo) {
    try {
      // 检查网络连接
      const networkType = await new Promise((resolve) => {
        wx.getNetworkType({
          success: (res) => resolve(res.networkType),
          fail: () => resolve('none')
        })
      })
      
      if (networkType !== 'none') {
        console.log('网络连接已恢复')
        return true
      }
      
      return false
    } catch (error) {
      console.error('恢复网络错误失败:', error)
      return false
    }
  }

  /**
   * 恢复存储错误
   * 
   * @param {Object} errorInfo - 错误信息
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async recoverStorageError(errorInfo) {
    try {
      // 尝试清理存储空间
      const storageInfo = wx.getStorageInfoSync()
      
      if (storageInfo.currentSize < storageInfo.limitSize * 0.9) {
        console.log('存储空间充足，错误可能已恢复')
        return true
      }
      
      // 清理一些非关键数据
      const keysToRemove = [
        'tempData',
        'cacheData',
        'oldLogs'
      ]
      
      keysToRemove.forEach(key => {
        try {
          wx.removeStorageSync(key)
        } catch (error) {
          // 忽略单个键的删除失败
        }
      })
      
      return true
    } catch (error) {
      console.error('恢复存储错误失败:', error)
      return false
    }
  }

  /**
   * 恢复超时错误
   * 
   * @param {Object} errorInfo - 错误信息
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async recoverTimeoutError(errorInfo) {
    try {
      // 超时错误通常可以通过重试来解决
      console.log('超时错误，建议重试操作')
      return true
    } catch (error) {
      console.error('恢复超时错误失败:', error)
      return false
    }
  }

  /**
   * 销毁错误处理器
   */
  destroy() {
    try {
      // 清理全局错误监听器
      wx.offUnhandledRejection()
      wx.offError()
      
      console.log('错误处理器已销毁')
    } catch (error) {
      console.error('销毁错误处理器失败:', error)
    }
  }
}

// 导出错误类型和严重程度枚举
export {
  ERROR_TYPES,
  ERROR_SEVERITY
} 