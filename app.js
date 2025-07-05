// app.js
App({
  /**
   * 小程序初始化完成时触发，全局只触发一次
   */
  onLaunch(options) {
    console.log('SQL学习助手启动', options)
    
    // 初始化应用
    this.initApp()
    
    // 检查更新
    this.checkUpdate()
    
    // 获取系统信息
    this.getSystemInfo()
  },

  /**
   * 小程序启动，或从后台进入前台显示时触发
   */
  onShow(options) {
    console.log('小程序显示', options)
    // 可以在这里处理从后台恢复的逻辑
  },

  /**
   * 小程序从前台进入后台时触发
   */
  onHide() {
    console.log('小程序隐藏')
    // 可以在这里保存数据或清理资源
  },

  /**
   * 小程序发生脚本错误或 API 调用报错时触发
   */
  onError(error) {
    console.error('小程序错误:', error)
    // 可以在这里上报错误信息
    this.reportError(error)
  },

  /**
   * 小程序要打开的页面不存在时触发
   */
  onPageNotFound(res) {
    console.warn('页面不存在:', res)
    wx.switchTab({
      url: '/pages/index/index'
    })
  },

  /**
   * 小程序有未处理的 Promise 拒绝时触发
   */
  onUnhandledRejection(res) {
    console.error('未处理的Promise拒绝:', res)
    this.reportError(res.reason)
  },

  /**
   * 初始化应用
   */
  initApp() {
    try {
      // 初始化数据库
      this.initDatabase()
      
      // 初始化用户信息
      this.initUserInfo()
      
      // 初始化主题设置
      this.initTheme()
      
      console.log('应用初始化完成')
    } catch (error) {
      console.error('应用初始化失败:', error)
      this.reportError(error)
    }
  },

  /**
   * 检查更新
   */
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      
      updateManager.onCheckForUpdate((res) => {
        console.log('检查更新结果:', res)
        if (res.hasUpdate) {
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
          
          updateManager.onUpdateFailed(() => {
            wx.showModal({
              title: '更新失败',
              content: '新版本下载失败，请检查网络后重试',
              showCancel: false
            })
          })
        }
      })
    }
  },

  /**
   * 获取系统信息
   */
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync()
      this.globalData.systemInfo = systemInfo
      console.log('系统信息:', systemInfo)
    } catch (error) {
      console.error('获取系统信息失败:', error)
    }
  },

  /**
   * 初始化数据库
   */
  initDatabase() {
    try {
      // TODO: 初始化SQLite数据库
      console.log('初始化数据库')
      this.globalData.database = {
        initialized: true,
        version: '1.0.0'
      }
    } catch (error) {
      console.error('数据库初始化失败:', error)
      this.globalData.database = {
        initialized: false,
        error: error.message
      }
    }
  },

  /**
   * 初始化用户信息
   */
  initUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
      }
    } catch (error) {
      console.error('获取用户信息失败:', error)
    }
  },

  /**
   * 初始化主题设置
   */
  initTheme() {
    try {
      const theme = wx.getStorageSync('theme') || 'light'
      this.globalData.theme = theme
      this.applyTheme(theme)
    } catch (error) {
      console.error('获取主题设置失败:', error)
    }
  },

  /**
   * 应用主题
   */
  applyTheme(theme) {
    // 这里可以根据主题设置调整UI样式
    console.log('应用主题:', theme)
  },

  /**
   * 上报错误信息
   */
  reportError(error) {
    // TODO: 实现错误上报逻辑
    console.error('上报错误:', error)
  },

  /**
   * 全局数据
   */
  globalData: {
    userInfo: null,
    database: null,
    systemInfo: null,
    theme: 'light',
    currentQuestion: null,
    // 应用配置
    config: {
      version: '1.0.0',
      buildNumber: '1',
      apiBaseUrl: 'https://api.example.com'
    }
  },

  /**
   * 工具方法
   */
  utils: {
    /**
     * 显示加载提示
     */
    showLoading(title = '加载中...') {
      wx.showLoading({
        title,
        mask: true
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
     */
    showConfirm(title, content) {
      return new Promise((resolve) => {
        wx.showModal({
          title,
          content,
          success: (res) => {
            resolve(res.confirm)
          }
        })
      })
    }
  }
})
