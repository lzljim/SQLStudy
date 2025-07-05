/**
 * 错误处理工具类
 * 统一管理错误处理和日志记录
 */

import { CONSTANTS } from './common.js'

// 错误类型枚举
export const ErrorTypes = {
  NETWORK: 'network',
  DATABASE: 'database',
  VALIDATION: 'validation',
  PERMISSION: 'permission',
  BUSINESS: 'business',
  SYSTEM: 'system',
  UNKNOWN: 'unknown'
}

// 错误级别枚举
export const ErrorLevels = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
}

// 错误处理器类
class ErrorHandler {
  constructor() {
    this.errorLogs = []
    this.maxLogSize = 100
    this.isInitialized = false
  }

  /**
   * 初始化错误处理器
   */
  init() {
    if (this.isInitialized) return

    try {
      // 监听全局错误
      this.setupGlobalErrorHandlers()
      
      // 监听未处理的Promise拒绝
      this.setupUnhandledRejectionHandler()
      
      this.isInitialized = true
      console.log('错误处理器初始化完成')
    } catch (error) {
      console.error('错误处理器初始化失败:', error)
    }
  }

  /**
   * 设置全局错误处理器
   */
  setupGlobalErrorHandlers() {
    // 监听小程序错误
    if (typeof wx !== 'undefined') {
      const originalOnError = wx.onError
      wx.onError = (error) => {
        this.handleError(error, ErrorTypes.SYSTEM, ErrorLevels.ERROR)
        if (originalOnError) {
          originalOnError.call(wx, error)
        }
      }
    }
  }

  /**
   * 设置未处理Promise拒绝处理器
   */
  setupUnhandledRejectionHandler() {
    if (typeof wx !== 'undefined') {
      const originalOnUnhandledRejection = wx.onUnhandledRejection
      wx.onUnhandledRejection = (event) => {
        this.handleError(event.reason, ErrorTypes.SYSTEM, ErrorLevels.ERROR)
        if (originalOnUnhandledRejection) {
          originalOnUnhandledRejection.call(wx, event)
        }
      }
    }
  }

  /**
   * 处理错误
   */
  handleError(error, type = ErrorTypes.UNKNOWN, level = ErrorLevels.ERROR, context = {}) {
    try {
      const errorInfo = this.createErrorInfo(error, type, level, context)
      
      // 记录错误日志
      this.logError(errorInfo)
      
      // 根据错误级别处理
      this.processErrorByLevel(errorInfo)
      
      // 上报错误（可选）
      this.reportError(errorInfo)
      
      return errorInfo
    } catch (err) {
      console.error('错误处理失败:', err)
    }
  }

  /**
   * 创建错误信息对象
   */
  createErrorInfo(error, type, level, context) {
    const errorInfo = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      type,
      level,
      message: this.extractErrorMessage(error),
      stack: this.extractErrorStack(error),
      context: {
        ...context,
        userAgent: this.getUserAgent(),
        systemInfo: this.getSystemInfo(),
        pageInfo: this.getCurrentPageInfo()
      }
    }

    return errorInfo
  }

  /**
   * 提取错误消息
   */
  extractErrorMessage(error) {
    if (!error) return '未知错误'
    
    if (typeof error === 'string') return error
    if (error.message) return error.message
    if (error.errMsg) return error.errMsg
    if (error.error) return error.error
    
    return String(error)
  }

  /**
   * 提取错误堆栈
   */
  extractErrorStack(error) {
    if (!error) return ''
    
    if (error.stack) return error.stack
    if (error.stackTrace) return error.stackTrace
    
    return ''
  }

  /**
   * 生成错误ID
   */
  generateErrorId() {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * 获取用户代理信息
   */
  getUserAgent() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      return {
        platform: systemInfo.platform,
        system: systemInfo.system,
        version: systemInfo.version,
        SDKVersion: systemInfo.SDKVersion
      }
    } catch (error) {
      return {}
    }
  }

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      return wx.getSystemInfoSync()
    } catch (error) {
      return {}
    }
  }

  /**
   * 获取当前页面信息
   */
  getCurrentPageInfo() {
    try {
      const pages = getCurrentPages()
      const currentPage = pages[pages.length - 1]
      
      if (currentPage) {
        return {
          route: currentPage.route,
          options: currentPage.options || {}
        }
      }
      
      return {}
    } catch (error) {
      return {}
    }
  }

  /**
   * 记录错误日志
   */
  logError(errorInfo) {
    try {
      // 添加到内存日志
      this.errorLogs.unshift(errorInfo)
      
      // 限制日志数量
      if (this.errorLogs.length > this.maxLogSize) {
        this.errorLogs = this.errorLogs.slice(0, this.maxLogSize)
      }
      
      // 保存到本地存储
      this.saveErrorLogs()
      
      // 控制台输出
      this.consoleLog(errorInfo)
    } catch (error) {
      console.error('记录错误日志失败:', error)
    }
  }

  /**
   * 保存错误日志到本地存储
   */
  saveErrorLogs() {
    try {
      wx.setStorageSync('errorLogs', this.errorLogs)
    } catch (error) {
      console.error('保存错误日志失败:', error)
    }
  }

  /**
   * 加载错误日志从本地存储
   */
  loadErrorLogs() {
    try {
      const logs = wx.getStorageSync('errorLogs')
      if (Array.isArray(logs)) {
        this.errorLogs = logs
      }
    } catch (error) {
      console.error('加载错误日志失败:', error)
    }
  }

  /**
   * 控制台输出错误
   */
  consoleLog(errorInfo) {
    const { level, message, type, timestamp } = errorInfo
    
    const logMessage = `[${timestamp}] [${level.toUpperCase()}] [${type}] ${message}`
    
    switch (level) {
      case ErrorLevels.DEBUG:
        console.debug(logMessage)
        break
      case ErrorLevels.INFO:
        console.info(logMessage)
        break
      case ErrorLevels.WARN:
        console.warn(logMessage)
        break
      case ErrorLevels.ERROR:
      case ErrorLevels.FATAL:
        console.error(logMessage)
        break
      default:
        console.log(logMessage)
    }
  }

  /**
   * 根据错误级别处理错误
   */
  processErrorByLevel(errorInfo) {
    const { level, message, type } = errorInfo
    
    switch (level) {
      case ErrorLevels.FATAL:
        this.handleFatalError(errorInfo)
        break
      case ErrorLevels.ERROR:
        this.handleError(errorInfo)
        break
      case ErrorLevels.WARN:
        this.handleWarning(errorInfo)
        break
      case ErrorLevels.INFO:
      case ErrorLevels.DEBUG:
        // 信息级别错误不需要特殊处理
        break
    }
  }

  /**
   * 处理致命错误
   */
  handleFatalError(errorInfo) {
    // 显示错误页面或重启应用
    wx.showModal({
      title: '应用错误',
      content: '应用遇到严重错误，建议重启应用',
      showCancel: false,
      confirmText: '确定'
    })
  }

  /**
   * 处理一般错误
   */
  handleError(errorInfo) {
    // 可以在这里添加错误处理逻辑
    // 比如显示错误提示、记录用户行为等
  }

  /**
   * 处理警告
   */
  handleWarning(errorInfo) {
    // 警告级别错误通常不需要用户干预
    // 可以在这里添加警告处理逻辑
  }

  /**
   * 上报错误
   */
  reportError(errorInfo) {
    // 这里可以实现错误上报逻辑
    // 比如上报到服务器、第三方错误监控平台等
    console.log('错误上报:', errorInfo)
  }

  /**
   * 获取错误日志
   */
  getErrorLogs(limit = 50) {
    return this.errorLogs.slice(0, limit)
  }

  /**
   * 清空错误日志
   */
  clearErrorLogs() {
    this.errorLogs = []
    try {
      wx.removeStorageSync('errorLogs')
    } catch (error) {
      console.error('清空错误日志失败:', error)
    }
  }

  /**
   * 导出错误日志
   */
  exportErrorLogs() {
    try {
      const logs = JSON.stringify(this.errorLogs, null, 2)
      const fileName = `error_logs_${Date.now()}.json`
      
      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
      
      fs.writeFile({
        filePath,
        data: logs,
        encoding: 'utf8',
        success: () => {
          wx.showModal({
            title: '导出成功',
            content: `错误日志已导出到: ${fileName}`,
            showCancel: false
          })
        },
        fail: (error) => {
          console.error('导出错误日志失败:', error)
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      })
    } catch (error) {
      console.error('导出错误日志失败:', error)
    }
  }
}

// 创建全局错误处理器实例
const errorHandler = new ErrorHandler()

// 便捷方法
export const handleError = (error, type, level, context) => {
  return errorHandler.handleError(error, type, level, context)
}

export const handleNetworkError = (error, context = {}) => {
  return errorHandler.handleError(error, ErrorTypes.NETWORK, ErrorLevels.ERROR, context)
}

export const handleDatabaseError = (error, context = {}) => {
  return errorHandler.handleError(error, ErrorTypes.DATABASE, ErrorLevels.ERROR, context)
}

export const handleValidationError = (error, context = {}) => {
  return errorHandler.handleError(error, ErrorTypes.VALIDATION, ErrorLevels.WARN, context)
}

export const handlePermissionError = (error, context = {}) => {
  return errorHandler.handleError(error, ErrorTypes.PERMISSION, ErrorLevels.ERROR, context)
}

export const handleBusinessError = (error, context = {}) => {
  return errorHandler.handleError(error, ErrorTypes.BUSINESS, ErrorLevels.INFO, context)
}

// 错误包装器
export const withErrorHandling = (fn, errorType = ErrorTypes.UNKNOWN, errorLevel = ErrorLevels.ERROR) => {
  return async (...args) => {
    try {
      return await fn(...args)
    } catch (error) {
      errorHandler.handleError(error, errorType, errorLevel, { function: fn.name })
      throw error
    }
  }
}

// 同步错误包装器
export const withSyncErrorHandling = (fn, errorType = ErrorTypes.UNKNOWN, errorLevel = ErrorLevels.ERROR) => {
  return (...args) => {
    try {
      return fn(...args)
    } catch (error) {
      errorHandler.handleError(error, errorType, errorLevel, { function: fn.name })
      throw error
    }
  }
}

// 导出错误处理器实例和工具
export default {
  ErrorTypes,
  ErrorLevels,
  errorHandler,
  handleError,
  handleNetworkError,
  handleDatabaseError,
  handleValidationError,
  handlePermissionError,
  handleBusinessError,
  withErrorHandling,
  withSyncErrorHandling
} 