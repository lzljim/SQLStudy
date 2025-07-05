// pages/index/index.js
const app = getApp()

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 功能卡片数据
    featureCards: [
      {
        id: 'editor',
        title: 'SQL编辑器',
        description: '在线编写和执行SQL语句，实时查看执行结果',
        icon: '💻',
        color: '#007aff',
        path: '/pages/editor/index',
        badge: ''
      },
      {
        id: 'practice',
        title: '练习题',
        description: '通过练习题巩固SQL知识，提升实战能力',
        icon: '📚',
        color: '#34c759',
        path: '/pages/practice/index',
        badge: ''
      },
      {
        id: 'about',
        title: '关于',
        description: '了解应用信息和使用说明',
        icon: 'ℹ️',
        color: '#ff9500',
        path: '/pages/about/index',
        badge: ''
      }
    ],
    
    // 统计数据
    stats: {
      totalQuestions: 50,
      completedQuestions: 0,
      totalUsers: 1000,
      accuracy: 0
    },
    
    // 快速开始SQL示例
    quickStartExamples: [
      {
        sql: 'SELECT * FROM users;',
        description: '查询所有用户信息'
      },
      {
        sql: 'SELECT name, email FROM users WHERE age > 18;',
        description: '查询成年用户姓名和邮箱'
      },
      {
        sql: 'SELECT COUNT(*) FROM orders;',
        description: '统计订单总数'
      }
    ],

    // 页面状态
    loading: false,
    refreshing: false,
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('首页加载', options)
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('首页渲染完成')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('首页显示')
    this.refreshData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('首页隐藏')
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('首页卸载')
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {
    this.refreshData()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {
    // 首页不需要上拉加载更多
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

  /**
   * 分享到朋友圈
   */
  onShareTimeline() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      imageUrl: '/images/share-cover.png'
    }
  },

  /**
   * 初始化页面
   */
  async initPage() {
    try {
      this.setData({ loading: true, error: null })
      
      // 并行加载数据
      await Promise.all([
        this.loadUserStats(),
        this.loadFeatureBadges(),
        this.checkDatabaseStatus()
      ])
      
      console.log('页面初始化完成')
    } catch (error) {
      console.error('页面初始化失败:', error)
      this.setData({ 
        error: '页面加载失败，请重试',
        loading: false 
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 刷新数据
   */
  async refreshData() {
    try {
      this.setData({ refreshing: true })
      
      await Promise.all([
        this.loadUserStats(),
        this.loadFeatureBadges()
      ])
      
      wx.stopPullDownRefresh()
    } catch (error) {
      console.error('刷新数据失败:', error)
      app.utils.showError('刷新失败，请重试')
    } finally {
      this.setData({ refreshing: false })
    }
  },

  /**
   * 加载用户统计数据
   */
  async loadUserStats() {
    try {
      // 从本地存储加载用户统计数据
      const stats = wx.getStorageSync('userStats') || {
        completedQuestions: 0,
        totalQuestions: 0,
        accuracy: 0
      }
      
      // 计算准确率
      const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.completedQuestions / stats.totalQuestions) * 100)
        : 0
      
      this.setData({
        'stats.completedQuestions': stats.completedQuestions,
        'stats.totalQuestions': stats.totalQuestions || 50,
        'stats.accuracy': accuracy
      })
    } catch (error) {
      console.error('加载用户统计失败:', error)
    }
  },

  /**
   * 加载功能徽章
   */
  async loadFeatureBadges() {
    try {
      const featureCards = [...this.data.featureCards]
      
      // 为练习题添加完成数量徽章
      const completedCount = this.data.stats.completedQuestions
      if (completedCount > 0) {
        const practiceCard = featureCards.find(card => card.id === 'practice')
        if (practiceCard) {
          practiceCard.badge = completedCount.toString()
        }
      }
      
      this.setData({ featureCards })
    } catch (error) {
      console.error('加载功能徽章失败:', error)
    }
  },

  /**
   * 检查数据库状态
   */
  async checkDatabaseStatus() {
    try {
      const database = app.globalData.database
      if (database && !database.initialized) {
        console.warn('数据库未初始化')
        // 可以在这里显示数据库状态提示
      }
    } catch (error) {
      console.error('检查数据库状态失败:', error)
    }
  },

  /**
   * 导航到功能页面
   */
  navigateToFeature(e) {
    try {
      const { path } = e.currentTarget.dataset
      
      // 检查路径有效性
      if (!path) {
        app.utils.showError('页面路径无效')
        return
      }
      
      wx.navigateTo({
        url: path,
        fail: (error) => {
          console.error('页面跳转失败:', error)
          app.utils.showError('页面跳转失败')
        }
      })
    } catch (error) {
      console.error('导航失败:', error)
      app.utils.showError('导航失败')
    }
  },

  /**
   * 快速开始 - 跳转到编辑器
   */
  quickStart() {
    try {
      wx.navigateTo({
        url: '/pages/editor/index',
        fail: (error) => {
          console.error('跳转编辑器失败:', error)
          app.utils.showError('跳转失败')
        }
      })
    } catch (error) {
      console.error('快速开始失败:', error)
      app.utils.showError('操作失败')
    }
  },

  /**
   * 复制SQL示例
   */
  copyExample(e) {
    try {
      const { sql } = e.currentTarget.dataset
      
      if (!sql) {
        app.utils.showError('SQL示例无效')
        return
      }
      
      wx.setClipboardData({
        data: sql,
        success: () => {
          app.utils.showSuccess('已复制到剪贴板')
        },
        fail: (error) => {
          console.error('复制失败:', error)
          app.utils.showError('复制失败')
        }
      })
    } catch (error) {
      console.error('复制示例失败:', error)
      app.utils.showError('复制失败')
    }
  },

  /**
   * 查看SQL示例详情
   */
  viewExample(e) {
    try {
      const { sql, description } = e.currentTarget.dataset
      
      wx.showModal({
        title: 'SQL示例',
        content: `${description}\n\n${sql}`,
        confirmText: '复制',
        cancelText: '关闭',
        success: (res) => {
          if (res.confirm) {
            this.copyExample({ currentTarget: { dataset: { sql } } })
          }
        }
      })
    } catch (error) {
      console.error('查看示例失败:', error)
      app.utils.showError('操作失败')
    }
  },

  /**
   * 错误重试
   */
  retry() {
    this.initPage()
  }
})
