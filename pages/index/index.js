/**
 * 首页模块
 * 
 * 该页面是应用的主入口，提供：
 * - 功能导航卡片
 * - 用户学习统计
 * - 快速开始功能
 * - SQL示例展示
 * 
 * @author SQL学习助手团队
 * @version 1.0.0
 * @since 2024-01-01
 */

// 导入工具模块
import { CONSTANTS, DateTimeUtils, StringUtils } from '../../utils/common.js'

const app = getApp()

/**
 * 首页页面实例
 * 管理首页的所有功能和状态
 */
Page({
  /**
   * 页面的初始数据
   * @type {Object}
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
        badge: '',
        enabled: true
      },
      {
        id: 'practice',
        title: '练习题',
        description: '通过练习题巩固SQL知识，提升实战能力',
        icon: '📚',
        color: '#34c759',
        path: '/pages/practice/index',
        badge: '',
        enabled: true
      },
      {
        id: 'about',
        title: '关于',
        description: '了解应用信息和使用说明',
        icon: 'ℹ️',
        color: '#ff9500',
        path: '/pages/about/index',
        badge: '',
        enabled: true
      }
    ],
    
    // 用户统计数据
    stats: {
      totalQuestions: 50,
      completedQuestions: 0,
      totalUsers: 1000,
      accuracy: 0,
      studyTime: 0, // 学习时长（分钟）
      lastStudyDate: null
    },
    
    // 快速开始SQL示例
    quickStartExamples: [
      {
        id: 'basic-select',
        sql: 'SELECT * FROM users;',
        description: '查询所有用户信息',
        difficulty: 'beginner',
        category: 'SELECT'
      },
      {
        id: 'conditional-select',
        sql: 'SELECT name, email FROM users WHERE age > 18;',
        description: '查询成年用户姓名和邮箱',
        difficulty: 'beginner',
        category: 'WHERE'
      },
      {
        id: 'aggregate-function',
        sql: 'SELECT COUNT(*) FROM orders;',
        description: '统计订单总数',
        difficulty: 'intermediate',
        category: 'AGGREGATE'
      }
    ],

    // 页面状态
    loading: false,
    refreshing: false,
    error: null,
    
    // 用户信息
    userInfo: null,
    
    // 应用状态
    appState: {
      isOnline: true,
      databaseReady: false
    }
  },

  /**
   * 生命周期函数--监听页面加载
   * 
   * @param {Object} options - 页面参数
   */
  onLoad(options) {
    console.log('首页加载', options)
    
    // 解析页面参数
    const pageOptions = app.utils.parsePageOptions(options)
    
    // 初始化页面
    this.initPage(pageOptions)
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('首页渲染完成')
    
    // 设置页面标题
    wx.setNavigationBarTitle({
      title: 'SQL学习助手'
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('首页显示')
    
    // 刷新数据
    this.refreshData()
    
    // 更新用户信息
    this.updateUserInfo()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('首页隐藏')
    
    // 保存页面状态
    this.savePageState()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('首页卸载')
    
    // 清理资源
    this.cleanup()
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
    console.log('到达页面底部')
  },

  /**
   * 用户点击右上角分享
   * 
   * @returns {Object} 分享信息
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
   * 
   * @returns {Object} 分享信息
   */
  onShareTimeline() {
    return {
      title: 'SQL学习助手 - 随时随地学习SQL',
      imageUrl: '/images/share-cover.png'
    }
  },

  /**
   * 初始化页面
   * 
   * @param {Object} options - 页面参数
   */
  async initPage(options = {}) {
    try {
      this.setData({ 
        loading: true, 
        error: null 
      })
      
      // 并行加载数据
      await Promise.all([
        this.loadUserStats(),
        this.loadFeatureBadges(),
        this.checkDatabaseStatus(),
        this.loadUserInfo()
      ])
      
      // 处理页面参数
      this.handlePageOptions(options)
      
      console.log('页面初始化完成')
    } catch (error) {
      console.error('页面初始化失败:', error)
      this.setData({ 
        error: '页面加载失败，请重试',
        loading: false 
      })
      
      app.errorHandler.handleError(error)
    } finally {
      this.setData({ loading: false })
    }
  },

  /**
   * 刷新数据
   * 重新加载页面所需的所有数据
   */
  async refreshData() {
    try {
      this.setData({ refreshing: true })
      
      await Promise.all([
        this.loadUserStats(),
        this.loadFeatureBadges(),
        this.updateOnlineStatus()
      ])
      
      wx.stopPullDownRefresh()
      app.utils.showSuccess('刷新成功')
    } catch (error) {
      console.error('刷新数据失败:', error)
      app.utils.showError('刷新失败，请重试')
      app.errorHandler.handleError(error)
    } finally {
      this.setData({ refreshing: false })
    }
  },

  /**
   * 加载用户统计数据
   * 从本地存储和服务器获取用户学习统计
   */
  async loadUserStats() {
    try {
      // 从本地存储加载用户统计数据
      const stats = wx.getStorageSync('userStats') || {
        completedQuestions: 0,
        totalQuestions: 0,
        accuracy: 0,
        studyTime: 0,
        lastStudyDate: null
      }
      
      // 计算准确率
      const accuracy = stats.totalQuestions > 0 
        ? Math.round((stats.completedQuestions / stats.totalQuestions) * 100)
        : 0
      
      // 格式化学习时长
      const studyTime = this.formatStudyTime(stats.studyTime || 0)
      
      this.setData({
        'stats.completedQuestions': stats.completedQuestions,
        'stats.totalQuestions': stats.totalQuestions || 50,
        'stats.accuracy': accuracy,
        'stats.studyTime': studyTime,
        'stats.lastStudyDate': stats.lastStudyDate
      })
    } catch (error) {
      console.error('加载用户统计失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 格式化学习时长
   * 
   * @param {number} minutes - 学习时长（分钟）
   * @returns {string} 格式化后的时长
   */
  formatStudyTime(minutes) {
    if (minutes < 60) {
      return `${minutes}分钟`
    } else if (minutes < 1440) {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
    } else {
      const days = Math.floor(minutes / 1440)
      const remainingHours = Math.floor((minutes % 1440) / 60)
      return remainingHours > 0 ? `${days}天${remainingHours}小时` : `${days}天`
    }
  },

  /**
   * 加载功能徽章
   * 为功能卡片添加徽章显示
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
      
      // 检查功能可用性
      featureCards.forEach(card => {
        card.enabled = this.isFeatureEnabled(card.id)
      })
      
      this.setData({ featureCards })
    } catch (error) {
      console.error('加载功能徽章失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 检查功能是否可用
   * 
   * @param {string} featureId - 功能ID
   * @returns {boolean} 是否可用
   */
  isFeatureEnabled(featureId) {
    const appConfig = app.config.features
    
    switch (featureId) {
      case 'editor':
        return appConfig.sqlEditor
      case 'practice':
        return appConfig.practiceMode
      case 'about':
        return true // 关于页面始终可用
      default:
        return true
    }
  },

  /**
   * 检查数据库状态
   * 验证数据库是否已正确初始化
   */
  async checkDatabaseStatus() {
    try {
      const database = app.globalData.database
      const isReady = database && database.initialized
      
      this.setData({
        'appState.databaseReady': isReady
      })
      
      if (!isReady) {
        console.warn('数据库未初始化')
        // 可以在这里显示数据库状态提示
      }
    } catch (error) {
      console.error('检查数据库状态失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 加载用户信息
   * 获取并显示用户基本信息
   */
  async loadUserInfo() {
    try {
      const userInfo = app.globalData.userInfo
      
      if (userInfo) {
        this.setData({ userInfo })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 更新用户信息
   * 刷新用户信息显示
   */
  updateUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo && userInfo !== this.data.userInfo) {
      this.setData({ userInfo })
    }
  },

  /**
   * 更新在线状态
   * 检查并更新网络连接状态
   */
  async updateOnlineStatus() {
    try {
      const isOnline = app.globalData.appState.isOnline
      
      if (this.data.appState.isOnline !== isOnline) {
        this.setData({
          'appState.isOnline': isOnline
        })
      }
    } catch (error) {
      console.error('更新在线状态失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 处理页面参数
   * 
   * @param {Object} options - 页面参数
   */
  handlePageOptions(options) {
    if (!options) return
    
    // 处理直接跳转参数
    if (options.target) {
      this.navigateToFeature({
        currentTarget: {
          dataset: { path: options.target }
        }
      })
    }
    
    // 处理其他参数
    if (options.refresh) {
      this.refreshData()
    }
  },

  /**
   * 导航到功能页面
   * 
   * @param {Object} e - 事件对象
   */
  navigateToFeature(e) {
    try {
      const { path } = e.currentTarget.dataset
      
      // 检查路径有效性
      if (!path) {
        app.utils.showError('页面路径无效')
        return
      }
      
      // 检查功能是否可用
      const card = this.data.featureCards.find(card => card.path === path)
      if (card && !card.enabled) {
        app.utils.showError('该功能暂不可用')
        return
      }
      
      wx.navigateTo({
        url: path,
        fail: (error) => {
          console.error('页面跳转失败:', error)
          app.utils.showError('页面跳转失败')
          app.errorHandler.handleError(error)
        }
      })
    } catch (error) {
      console.error('导航失败:', error)
      app.utils.showError('导航失败')
      app.errorHandler.handleError(error)
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
          app.errorHandler.handleError(error)
        }
      })
    } catch (error) {
      console.error('快速开始失败:', error)
      app.utils.showError('操作失败')
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 复制SQL示例
   * 
   * @param {Object} e - 事件对象
   */
  copyExample(e) {
    try {
      const { sql } = e.currentTarget.dataset
      
      if (!sql) {
        app.utils.showError('SQL示例无效')
        return
      }
      
      app.utils.copyToClipboard(sql)
    } catch (error) {
      console.error('复制示例失败:', error)
      app.utils.showError('复制失败')
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 查看SQL示例详情
   * 
   * @param {Object} e - 事件对象
   */
  viewExample(e) {
    try {
      const { sql, description } = e.currentTarget.dataset
      
      if (!sql || !description) {
        app.utils.showError('示例信息不完整')
        return
      }
      
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
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 保存页面状态
   * 保存当前页面状态到本地存储
   */
  savePageState() {
    try {
      const pageState = {
        lastVisit: new Date().toISOString(),
        stats: this.data.stats,
        userInfo: this.data.userInfo
      }
      
      wx.setStorageSync('indexPageState', pageState)
    } catch (error) {
      console.error('保存页面状态失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 清理资源
   * 在页面卸载时清理资源
   */
  cleanup() {
    try {
      // 清理临时数据
      this.setData({
        userInfo: null,
        error: null
      })
      
      console.log('页面资源清理完成')
    } catch (error) {
      console.error('页面资源清理失败:', error)
      app.errorHandler.handleError(error)
    }
  },

  /**
   * 错误重试
   * 重新初始化页面
   */
  retry() {
    this.initPage()
  }
})
