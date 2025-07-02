// pages/about/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 应用信息
    appInfo: {
      name: 'SQL学习助手',
      version: '1.0.0',
      description: '一款专为SQL学习者设计的微信小程序，提供在线SQL编辑器和练习题功能。',
      features: [
        '在线SQL编辑器',
        '实时SQL执行',
        '丰富的练习题',
        '学习进度跟踪',
        '表结构查看',
        '结果导出功能'
      ]
    },
    
    // 技术栈
    techStack: [
      { name: '微信小程序', description: '原生小程序开发' },
      { name: 'SQL.js', description: 'WebAssembly SQLite引擎' },
      { name: 'WXWebAssembly', description: '微信小程序WebAssembly支持' },
      { name: '本地存储', description: '微信小程序本地数据存储' }
    ],
    
    // 开发团队
    team: [
      { name: '开发团队', role: '产品设计与开发' },
      { name: 'SQL学习社区', role: '内容贡献' }
    ],
    
    // 联系方式
    contact: {
      email: 'support@sqlstudy.com',
      website: 'https://sqlstudy.com',
      github: 'https://github.com/sqlstudy'
    },
    
    // 更新日志
    changelog: [
      {
        version: '1.0.0',
        date: '2024-01-01',
        changes: [
          '初始版本发布',
          'SQL编辑器功能',
          '练习题系统',
          '基础SQL执行引擎'
        ]
      }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时执行
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    }
  },

  // 复制联系方式
  copyContact(e) {
    const { type } = e.currentTarget.dataset
    let content = ''
    
    switch (type) {
      case 'email':
        content = this.data.contact.email
        break
      case 'website':
        content = this.data.contact.website
        break
      case 'github':
        content = this.data.contact.github
        break
    }
    
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 查看完整更新日志
  viewFullChangelog() {
    wx.showModal({
      title: '更新日志',
      content: '当前版本：1.0.0\n\n- 初始版本发布\n- SQL编辑器功能\n- 练习题系统\n- 基础SQL执行引擎',
      showCancel: false
    })
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      imageUrl: '/images/share-cover.png'
    }
  },

  // 反馈建议
  feedback() {
    wx.showModal({
      title: '反馈建议',
      content: '如有问题或建议，请通过以下方式联系我们：\n\n邮箱：support@sqlstudy.com\n\n我们会认真处理每一条反馈！',
      showCancel: false
    })
  },

  // 使用帮助
  showHelp() {
    wx.showModal({
      title: '使用帮助',
      content: '1. SQL编辑器：输入SQL语句并执行\n2. 练习题：选择题目进行练习\n3. 表结构：查看数据库表结构\n4. 进度跟踪：查看学习进度\n\n更多帮助请查看应用内说明。',
      showCancel: false
    })
  }
})