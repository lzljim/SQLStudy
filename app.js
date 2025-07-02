// app.js
App({
  onLaunch() {
    // 小程序启动时执行
    console.log('SQL学习助手启动')
    
    // 检查更新
    this.checkUpdate()
    
    // 初始化数据库
    this.initDatabase()
  },

  onShow() {
    // 小程序显示时执行
  },

  onHide() {
    // 小程序隐藏时执行
  },

  onError(msg) {
    // 小程序发生错误时执行
    console.error('小程序错误:', msg)
  },

  // 检查更新
  checkUpdate() {
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      updateManager.onCheckForUpdate((res) => {
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
        }
      })
    }
  },

  // 初始化数据库
  initDatabase() {
    // TODO: 初始化SQLite数据库
    console.log('初始化数据库')
  },

  // 全局数据
  globalData: {
    userInfo: null,
    database: null,
    currentQuestion: null
  }
})
