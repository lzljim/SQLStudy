/**
 * SQL学习助手小程序 - 主应用文件
 * 
 * 该文件是小程序的入口文件，负责：
 * - 应用生命周期管理
 * - 全局数据管理
 * - 系统初始化
 * - 错误处理和上报
 * - 工具方法提供
 * 
 * @author SQL学习助手团队
 * @version 1.0.0
 * @since 2024-01-01
 */

// 导入工具模块
import { CONSTANTS, StorageUtils, NetworkUtils } from './utils/common.js'
import { ErrorHandler } from './utils/error-handler.js'

/**
 * 小程序应用实例
 * 管理全局状态和生命周期
 */
App({
  /**
   * 应用配置信息
   * @type {Object}
   */
  config: {
    // 应用基本信息
    name: CONSTANTS.APP_NAME,
    version: CONSTANTS.APP_VERSION,
    buildNumber: '1',
    
    // API配置
    apiBaseUrl: 'https://api.example.com',
    apiTimeout: 10000,
    
    // 功能开关
    features: {
      sqlEditor: true,
      practiceMode: true,
      wasmSupport: true,
      offlineMode: true
    },
    
    // 性能配置
    performance: {
      maxHistorySize: CONSTANTS.DEFAULTS.MAX_HISTORY_SIZE,
      maxExecutionRecords: CONSTANTS.DEFAULTS.MAX_EXECUTION_RECORDS,
      executionTimeout: CONSTANTS.DEFAULTS.EXECUTION_TIMEOUT
    }
  },

  /**
   * 全局数据存储
   * @type {Object}
   */
  globalData: {
    // 用户信息
    userInfo: null,
    
    // 数据库状态
    database: {
      initialized: false,
      version: '1.0.0',
      error: null
    },
    
    // 系统信息
    systemInfo: null,
    
    // 主题设置
    theme: 'light',
    
    // 当前状态
    currentQuestion: null,
    currentEditor: null,
    
    // 应用状态
    appState: {
      isOnline: true,
      isInitialized: false,
      lastError: null
    }
  },

  /**
   * 错误处理器实例
   * @type {ErrorHandler}
   */
  errorHandler: null,

  /**
   * 小程序初始化完成时触发，全局只触发一次
   * 
   * @param {Object} options - 启动参数
   * @param {string} options.scene - 启动场景值
   * @param {string} options.query - 启动参数
   * @param {string} options.referrerInfo - 来源信息
   */
  onLaunch(options) {
    console.log('SQL学习助手启动', options)
    
    // 初始化错误处理器
    this.errorHandler = new ErrorHandler()
    
    // 初始化应用
    this.initApp()
    
    // 检查更新
    this.checkUpdate()
    
    // 获取系统信息
    this.getSystemInfo()
  },

  /**
   * 小程序启动，或从后台进入前台显示时触发
   * 
   * @param {Object} options - 显示参数
   */
  onShow(options) {
    console.log('小程序显示', options)
    
    // 更新在线状态
    this.updateOnlineStatus()
    
    // 恢复应用状态
    this.restoreAppState()
  },

  /**
   * 小程序从前台进入后台时触发
   */
  onHide() {
    console.log('小程序隐藏')
    
    // 保存应用状态
    this.saveAppState()
    
    // 清理资源
    this.cleanup()
  },

  /**
   * 小程序发生脚本错误或 API 调用报错时触发
   * 
   * @param {Error} error - 错误对象
   */
  onError(error) {
    console.error('小程序错误:', error)
    
    // 记录错误
    this.globalData.appState.lastError = error
    
    // 上报错误
    this.reportError(error)
  },

  /**
   * 小程序要打开的页面不存在时触发
   * 
   * @param {Object} res - 页面不存在信息
   */
  onPageNotFound(res) {
    console.warn('页面不存在:', res)
    
    // 跳转到首页
    wx.switchTab({
      url: '/pages/index/index',
      fail: (error) => {
        console.error('跳转首页失败:', error)
        this.errorHandler.handleError(error)
      }
    })
  },

  /**
   * 小程序有未处理的 Promise 拒绝时触发
   * 
   * @param {Object} res - Promise拒绝信息
   */
  onUnhandledRejection(res) {
    console.error('未处理的Promise拒绝:', res)
    
    // 上报错误
    this.reportError(res.reason)
  },

  /**
   * 初始化应用
   * 负责应用的核心初始化工作
   */
  async initApp() {
    try {
      console.log('开始初始化应用...')
      
      // 并行执行初始化任务
      await Promise.all([
        this.initDatabase(),
        this.initUserInfo(),
        this.initTheme(),
        this.initSettings()
      ])
      
      // 标记初始化完成
      this.globalData.appState.isInitialized = true
      
      console.log('应用初始化完成')
    } catch (error) {
      console.error('应用初始化失败:', error)
      this.errorHandler.handleError(error)
      
      // 显示错误提示
      this.utils.showError('应用初始化失败，请重启应用')
    }
  },

  /**
   * 检查应用更新
   * 使用微信小程序的更新管理器
   */
  checkUpdate() {
    if (!wx.canIUse('getUpdateManager')) {
      console.warn('当前版本不支持更新管理器')
      return
    }

    const updateManager = wx.getUpdateManager()
    
    // 检查更新
    updateManager.onCheckForUpdate((res) => {
      console.log('检查更新结果:', res)
      
      if (res.hasUpdate) {
        // 有更新可用
        updateManager.onUpdateReady(() => {
          wx.showModal({
            title: '更新提示',
            content: '新版本已经准备好，是否重启应用？',
            success: (res) => {
              if (res.confirm) {
                updateManager.applyUpdate()
              }
            }
          })
        })
        
        // 更新失败
        updateManager.onUpdateFailed(() => {
          wx.showModal({
            title: '更新失败',
            content: '新版本下载失败，请检查网络后重试',
            showCancel: false
          })
        })
      }
    })
  },

  /**
   * 获取系统信息
   * 获取设备信息和系统状态
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.globalData.systemInfo = systemInfo
      
      console.log('系统信息:', systemInfo)
      
      // 检查设备兼容性
      this.checkDeviceCompatibility(systemInfo)
    } catch (error) {
      console.error('获取系统信息失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 检查设备兼容性
   * 
   * @param {Object} systemInfo - 系统信息
   */
  checkDeviceCompatibility(systemInfo) {
    const { platform, system, version } = systemInfo
    
    // 检查微信版本
    if (version && this.compareVersion(version, '7.0.0') < 0) {
      console.warn('微信版本过低，部分功能可能不可用')
    }
    
    // 检查平台支持
    if (!['ios', 'android'].includes(platform)) {
      console.warn('不支持的平台:', platform)
    }
  },

  /**
   * 版本比较
   * 
   * @param {string} v1 - 版本1
   * @param {string} v2 - 版本2
   * @returns {number} 比较结果
   */
  compareVersion(v1, v2) {
    const v1Parts = v1.split('.').map(Number)
    const v2Parts = v2.split('.').map(Number)
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0
      const v2Part = v2Parts[i] || 0
      
      if (v1Part > v2Part) return 1
      if (v1Part < v2Part) return -1
    }
    
    return 0
  },

  /**
   * 初始化数据库
   * 初始化SQLite数据库和相关配置
   */
  async initDatabase() {
    try {
      console.log('初始化数据库...')
      
      // TODO: 初始化SQLite数据库
      // 这里应该集成真实的SQLite数据库
      
      this.globalData.database = {
        initialized: true,
        version: '1.0.0',
        tables: [],
        lastSync: new Date().toISOString()
      }
      
      console.log('数据库初始化完成')
    } catch (error) {
      console.error('数据库初始化失败:', error)
      
      this.globalData.database = {
        initialized: false,
        error: error.message,
        lastError: new Date().toISOString()
      }
      
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 初始化用户信息
   * 从本地存储加载用户信息
   */
  initUserInfo() {
    try {
      const userInfo = StorageUtils.get(CONSTANTS.STORAGE_KEYS.USER_INFO)
      
      if (userInfo) {
        this.globalData.userInfo = userInfo
        console.log('用户信息加载成功')
      } else {
        console.log('未找到用户信息')
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 初始化主题设置
   * 加载并应用主题配置
   */
  initTheme() {
    try {
      const theme = StorageUtils.get(CONSTANTS.STORAGE_KEYS.THEME) || 'light'
      this.globalData.theme = theme
      
      // 应用主题
      this.applyTheme(theme)
      
      console.log('主题初始化完成:', theme)
    } catch (error) {
      console.error('获取主题设置失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 初始化应用设置
   * 加载应用配置和用户偏好
   */
  initSettings() {
    try {
      const settings = StorageUtils.get(CONSTANTS.STORAGE_KEYS.SETTINGS) || {}
      
      // 合并默认设置
      this.globalData.settings = {
        autoSave: true,
        syntaxHighlight: true,
        lineNumbers: true,
        wordWrap: false,
        fontSize: 14,
        ...settings
      }
      
      console.log('设置初始化完成')
    } catch (error) {
      console.error('初始化设置失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 应用主题
   * 
   * @param {string} theme - 主题名称
   */
  applyTheme(theme) {
    try {
      // 这里可以根据主题设置调整UI样式
      console.log('应用主题:', theme)
      
      // 设置导航栏样式
      wx.setNavigationBarColor({
        frontColor: theme === 'dark' ? '#ffffff' : '#000000',
        backgroundColor: theme === 'dark' ? '#000000' : '#ffffff'
      })
    } catch (error) {
      console.error('应用主题失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 更新在线状态
   * 检查网络连接状态
   */
  async updateOnlineStatus() {
    try {
      const networkType = await NetworkUtils.getNetworkType()
      const isOnline = networkType !== 'none'
      
      this.globalData.appState.isOnline = isOnline
      
      if (!isOnline) {
        console.warn('网络连接已断开')
      }
    } catch (error) {
      console.error('检查网络状态失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 保存应用状态
   * 保存当前应用状态到本地存储
   */
  saveAppState() {
    try {
      const appState = {
        currentQuestion: this.globalData.currentQuestion,
        currentEditor: this.globalData.currentEditor,
        theme: this.globalData.theme,
        timestamp: new Date().toISOString()
      }
      
      StorageUtils.set('appState', appState)
    } catch (error) {
      console.error('保存应用状态失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 恢复应用状态
   * 从本地存储恢复应用状态
   */
  restoreAppState() {
    try {
      const appState = StorageUtils.get('appState')
      
      if (appState) {
        this.globalData.currentQuestion = appState.currentQuestion
        this.globalData.currentEditor = appState.currentEditor
        
        if (appState.theme && appState.theme !== this.globalData.theme) {
          this.applyTheme(appState.theme)
        }
      }
    } catch (error) {
      console.error('恢复应用状态失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 清理资源
   * 在应用进入后台时清理不必要的资源
   */
  cleanup() {
    try {
      // 清理临时数据
      this.globalData.currentQuestion = null
      this.globalData.currentEditor = null
      
      // 保存重要数据
      this.saveAppState()
      
      console.log('资源清理完成')
    } catch (error) {
      console.error('资源清理失败:', error)
      this.errorHandler.handleError(error)
    }
  },

  /**
   * 上报错误信息
   * 
   * @param {Error} error - 错误对象
   */
  reportError(error) {
    try {
      // TODO: 实现错误上报逻辑
      // 这里应该将错误信息发送到服务器
      
      const errorInfo = {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        systemInfo: this.globalData.systemInfo,
        userInfo: this.globalData.userInfo
      }
      
      console.error('上报错误:', errorInfo)
      
      // 存储错误日志
      const errorLogs = StorageUtils.get('errorLogs') || []
      errorLogs.push(errorInfo)
      
      // 限制错误日志数量
      if (errorLogs.length > 100) {
        errorLogs.splice(0, errorLogs.length - 100)
      }
      
      StorageUtils.set('errorLogs', errorLogs)
    } catch (reportError) {
      console.error('错误上报失败:', reportError)
    }
  },

  /**
   * 工具方法集合
   * 提供常用的工具方法
   */
  utils: {
    /**
     * 显示加载提示
     * 
     * @param {string} title - 提示文字
     * @param {boolean} mask - 是否显示遮罩
     */
    showLoading(title = '加载中...', mask = true) {
      wx.showLoading({
        title,
        mask
      })
    },

    /**
     * 隐藏加载提示
     */
    hideLoading() {
      wx.hideLoading()
    },

    /**
     * 显示成功提示
     * 
     * @param {string} title - 提示文字
     * @param {number} duration - 显示时长
     */
    showSuccess(title, duration = 1500) {
      wx.showToast({
        title,
        icon: 'success',
        duration
      })
    },

    /**
     * 显示错误提示
     * 
     * @param {string} title - 提示文字
     * @param {number} duration - 显示时长
     */
    showError(title, duration = 2000) {
      wx.showToast({
        title,
        icon: 'error',
        duration
      })
    },

    /**
     * 显示确认对话框
     * 
     * @param {string} title - 标题
     * @param {string} content - 内容
     * @param {string} confirmText - 确认按钮文字
     * @param {string} cancelText - 取消按钮文字
     * @returns {Promise<boolean>} 用户选择结果
     */
    showConfirm(title, content, confirmText = '确定', cancelText = '取消') {
      return new Promise((resolve) => {
        wx.showModal({
          title,
          content,
          confirmText,
          cancelText,
          success: (res) => {
            resolve(res.confirm)
          },
          fail: () => {
            resolve(false)
          }
        })
      })
    },

    /**
     * 复制文本到剪贴板
     * 
     * @param {string} text - 要复制的文本
     * @returns {Promise<boolean>} 复制结果
     */
    copyToClipboard(text) {
      return new Promise((resolve) => {
        wx.setClipboardData({
          data: text,
          success: () => {
            this.showSuccess('复制成功')
            resolve(true)
          },
          fail: (error) => {
            console.error('复制失败:', error)
            this.showError('复制失败')
            resolve(false)
          }
        })
      })
    },

    /**
     * 获取页面参数
     * 
     * @param {Object} options - 页面参数
     * @returns {Object} 解析后的参数
     */
    parsePageOptions(options) {
      const result = {}
      
      if (options && options.query) {
        try {
          // 解析查询参数
          const query = decodeURIComponent(options.query)
          const params = new URLSearchParams(query)
          
          for (const [key, value] of params) {
            result[key] = value
          }
        } catch (error) {
          console.error('解析页面参数失败:', error)
        }
      }
      
      return result
    }
  }
})
