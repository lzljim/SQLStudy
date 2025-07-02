// pages/index/index.js
Page({
  data: {
    // 功能卡片数据
    featureCards: [
      {
        id: 'editor',
        title: 'SQL编辑器',
        description: '在线编写和执行SQL语句，实时查看执行结果',
        icon: '💻',
        color: '#007aff',
        path: '/pages/editor/index'
      },
      {
        id: 'practice',
        title: '练习题',
        description: '通过练习题巩固SQL知识，提升实战能力',
        icon: '📚',
        color: '#34c759',
        path: '/pages/practice/index'
      },
      {
        id: 'about',
        title: '关于',
        description: '了解应用信息和使用说明',
        icon: 'ℹ️',
        color: '#ff9500',
        path: '/pages/about/index'
      }
    ],
    
    // 统计数据
    stats: {
      totalQuestions: 50,
      completedQuestions: 0,
      totalUsers: 1000
    },
    
    // 快速开始SQL示例
    quickStartExamples: [
      'SELECT * FROM users;',
      'SELECT name, email FROM users WHERE age > 18;',
      'SELECT COUNT(*) FROM orders;'
    ]
  },

  onLoad() {
    // 页面加载时执行
    this.loadUserStats()
  },

  onShow() {
    // 页面显示时执行
  },

  // 加载用户统计数据
  loadUserStats() {
    // TODO: 从本地存储加载用户统计数据
    const stats = wx.getStorageSync('userStats') || {
      completedQuestions: 0
    }
    
    this.setData({
      'stats.completedQuestions': stats.completedQuestions
    })
  },

  // 导航到功能页面
  navigateToFeature(e) {
    const { path } = e.currentTarget.dataset
    wx.navigateTo({
      url: path
    })
  },

  // 快速开始 - 跳转到编辑器
  quickStart() {
    wx.navigateTo({
      url: '/pages/editor/index'
    })
  },

  // 复制SQL示例
  copyExample(e) {
    const { sql } = e.currentTarget.dataset
    wx.setClipboardData({
      data: sql,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 分享应用
  onShareAppMessage() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      path: '/pages/index/index',
      imageUrl: '/images/share-cover.png'
    }
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      imageUrl: '/images/share-cover.png'
    }
  }
})
