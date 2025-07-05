// pages/editor/index.js
const app = getApp()

Page({

  /**
   * 页面的初始数据
   */
  data: {
    sqlText: '', // SQL编辑器输入内容
    sqlHistory: [], // SQL历史记录
    historyIndex: -1, // 当前历史索引
    maxHistorySize: 50, // 最大历史记录数
    showSchemaPanel: false, // 是否显示表结构弹窗
    showHistoryPanel: false, // 是否显示历史SQL弹窗
    showMorePanel: false, // 是否显示更多菜单
    showClearConfirm: false, // 是否显示清空确认弹窗
    loading: false, // SQL执行加载状态
    result: null, // SQL执行结果对象
    error: '', // SQL执行错误信息
    // 示例数据库信息
    databaseInfo: {
      name: '示例数据库',
      tables: ['users', 'orders', 'products'],
      version: '1.0.0'
    },
    // 表结构数据，供表结构区展示
    tableSchema: [],
    // 练习题分类
    practiceCategories: ['全部', '基础', '高级', '其他'],
    selectedCategory: '全部',
    allPracticeList: [
      { id: 1, title: '查询所有用户', category: '基础', sql: 'SELECT * FROM users;' },
      { id: 2, title: '条件查询', category: '基础', sql: 'SELECT name, age FROM users WHERE age > 25;' },
      { id: 3, title: '聚合查询', category: '高级', sql: 'SELECT COUNT(*) as total FROM users;' },
      { id: 4, title: '连接查询', category: '高级', sql: 'SELECT u.name, o.product_name FROM users u JOIN orders o ON u.id = o.user_id;' },
      { id: 5, title: '分组查询', category: '其他', sql: 'SELECT city, COUNT(*) as count FROM users GROUP BY city;' }
    ],
    practiceList: [], // 当前分类下的题目列表
    currentPractice: null, // 当前选中题目
    initialized: false,
    error: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('编辑器页面加载', options)
    this.initPage()
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log('编辑器页面渲染完成')
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    console.log('编辑器页面显示')
    this.refreshData()
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {
    console.log('编辑器页面隐藏')
    this.saveCurrentState()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    console.log('编辑器页面卸载')
    this.saveCurrentState()
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
    // 编辑器页面不需要上拉加载更多
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    const { sqlText } = this.data
    return {
      title: 'SQL编辑器 - 在线编写和执行SQL',
      path: '/pages/editor/index',
      query: sqlText ? `sql=${encodeURIComponent(sqlText)}` : ''
    }
  },

  /**
   * 初始化页面
   */
  async initPage() {
    try {
      this.setData({ loading: true, error: null })
      
      // 并行初始化
      await Promise.all([
        this.loadTableSchema(),
        this.loadPracticeList(),
        this.loadSavedState()
      ])
      
      this.setData({ initialized: true })
      console.log('编辑器页面初始化完成')
    } catch (error) {
      console.error('编辑器页面初始化失败:', error)
      this.setData({ 
        error: '页面初始化失败，请重试',
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
      await Promise.all([
        this.loadTableSchema(),
        this.loadPracticeList()
      ])
      
      wx.stopPullDownRefresh()
    } catch (error) {
      console.error('刷新数据失败:', error)
      app.utils.showError('刷新失败，请重试')
    }
  },

  /**
   * 加载表结构信息
   */
  async loadTableSchema() {
    try {
      // 模拟从数据库获取表结构
      const mockSchema = [
        {
          table: 'users',
          columns: [
            { name: 'id', type: 'INTEGER', primary: true, nullable: false },
            { name: 'name', type: 'TEXT', nullable: false },
            { name: 'email', type: 'TEXT', nullable: true },
            { name: 'age', type: 'INTEGER', nullable: true },
            { name: 'city', type: 'TEXT', nullable: true },
            { name: 'created_at', type: 'DATETIME', nullable: false }
          ]
        },
        {
          table: 'orders',
          columns: [
            { name: 'id', type: 'INTEGER', primary: true, nullable: false },
            { name: 'user_id', type: 'INTEGER', nullable: false },
            { name: 'product_name', type: 'TEXT', nullable: false },
            { name: 'quantity', type: 'INTEGER', nullable: false },
            { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'order_date', type: 'DATETIME', nullable: false }
          ]
        },
        {
          table: 'products',
          columns: [
            { name: 'id', type: 'INTEGER', primary: true, nullable: false },
            { name: 'name', type: 'TEXT', nullable: false },
            { name: 'category', type: 'TEXT', nullable: true },
            { name: 'price', type: 'DECIMAL(10,2)', nullable: false },
            { name: 'stock', type: 'INTEGER', nullable: false }
          ]
        }
      ]
      
      this.setData({ tableSchema: mockSchema })
    } catch (error) {
      console.error('加载表结构失败:', error)
      throw error
    }
  },

  /**
   * 加载练习题列表
   */
  async loadPracticeList() {
    try {
      const { allPracticeList, selectedCategory } = this.data
      
      // 根据分类筛选题目
      const practiceList = selectedCategory === '全部' 
        ? allPracticeList 
        : allPracticeList.filter(q => q.category === selectedCategory)
      
      this.setData({ 
        practiceList,
        currentPractice: practiceList.length > 0 ? practiceList[0] : null
      })
    } catch (error) {
      console.error('加载练习题失败:', error)
      throw error
    }
  },

  /**
   * 加载保存的状态
   */
  async loadSavedState() {
    try {
      const savedState = wx.getStorageSync('editorState')
      if (savedState) {
        this.setData({
          sqlText: savedState.sqlText || '',
          sqlHistory: savedState.sqlHistory || [],
          historyIndex: savedState.historyIndex || -1
        })
      }
    } catch (error) {
      console.error('加载保存状态失败:', error)
    }
  },

  /**
   * 保存当前状态
   */
  saveCurrentState() {
    try {
      const { sqlText, sqlHistory, historyIndex } = this.data
      wx.setStorageSync('editorState', {
        sqlText,
        sqlHistory,
        historyIndex
      })
    } catch (error) {
      console.error('保存状态失败:', error)
    }
  },

  /**
   * SQL输入事件处理
   */
  onSqlInput(e) {
    try {
      const value = e.detail.value
      this.updateSqlHistory(value)
      this.setData({ sqlText: value })
    } catch (error) {
      console.error('SQL输入处理失败:', error)
    }
  },

  /**
   * 更新SQL历史记录
   */
  updateSqlHistory(sql) {
    try {
      let { sqlHistory, historyIndex, maxHistorySize } = this.data
      
      // 如果当前不在历史记录末尾，截断历史
      if (historyIndex < sqlHistory.length - 1) {
        sqlHistory = sqlHistory.slice(0, historyIndex + 1)
      }
      
      // 添加新的SQL到历史记录
      sqlHistory.push(sql)
      historyIndex = sqlHistory.length - 1
      
      // 限制历史记录大小
      if (sqlHistory.length > maxHistorySize) {
        sqlHistory = sqlHistory.slice(-maxHistorySize)
        historyIndex = sqlHistory.length - 1
      }
      
      this.setData({ sqlHistory, historyIndex })
    } catch (error) {
      console.error('更新SQL历史失败:', error)
    }
  },

  /**
   * 执行SQL
   */
  async onExecute() {
    try {
      const sql = this.data.sqlText.trim()
      
      if (!sql) {
        app.utils.showError('请输入SQL语句')
        return
      }
      
      this.setData({ 
        loading: true, 
        error: '',
        result: null 
      })
      
      // 模拟SQL执行
      const result = await this.executeSQL(sql)
      
      this.setData({ 
        result,
        loading: false 
      })
      
      // 记录执行历史
      this.recordExecution(sql, result)
      
    } catch (error) {
      console.error('SQL执行失败:', error)
      this.setData({ 
        error: error.message || 'SQL执行失败',
        loading: false 
      })
    }
  },

  /**
   * 执行SQL（模拟）
   */
  async executeSQL(sql) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const lowerSql = sql.toLowerCase()
          let result = null
          
          // 模拟不同的SQL执行结果
          if (lowerSql.includes('select * from users')) {
            result = {
              columns: ['id', 'name', 'email', 'age', 'city', 'created_at'],
              data: [
                [1, '张三', 'zhangsan@example.com', 25, '北京', '2024-01-01 10:00:00'],
                [2, '李四', 'lisi@example.com', 30, '上海', '2024-01-02 11:00:00'],
                [3, '王五', 'wangwu@example.com', 28, '广州', '2024-01-03 12:00:00'],
                [4, '赵六', 'zhaoliu@example.com', 35, '深圳', '2024-01-04 13:00:00']
              ],
              executionTime: 45,
              affectedRows: 4
            }
          } else if (lowerSql.includes('select * from orders')) {
            result = {
              columns: ['id', 'user_id', 'product_name', 'quantity', 'price', 'order_date'],
              data: [
                [1, 1, 'iPhone 15', 1, 5999.00, '2024-01-15 14:00:00'],
                [2, 2, 'MacBook Pro', 1, 12999.00, '2024-01-16 15:00:00'],
                [3, 1, 'AirPods Pro', 2, 1899.00, '2024-01-17 16:00:00'],
                [4, 3, 'iPad Air', 1, 4399.00, '2024-01-18 17:00:00'],
                [5, 4, 'Apple Watch', 1, 2999.00, '2024-01-19 18:00:00']
              ],
              executionTime: 32,
              affectedRows: 5
            }
          } else if (lowerSql.includes('select * from products')) {
            result = {
              columns: ['id', 'name', 'category', 'price', 'stock'],
              data: [
                [1, 'iPhone 15', '手机', 5999.00, 100],
                [2, 'MacBook Pro', '电脑', 12999.00, 50],
                [3, 'AirPods Pro', '耳机', 1899.00, 200],
                [4, 'iPad Air', '平板', 4399.00, 80],
                [5, 'Apple Watch', '手表', 2999.00, 150]
              ],
              executionTime: 28,
              affectedRows: 5
            }
          } else if (lowerSql.includes('count')) {
            result = {
              columns: ['total'],
              data: [[4]],
              executionTime: 15,
              affectedRows: 1
            }
          } else if (lowerSql.includes('join')) {
            result = {
              columns: ['user_name', 'product_name', 'quantity'],
              data: [
                ['张三', 'iPhone 15', 1],
                ['李四', 'MacBook Pro', 1],
                ['张三', 'AirPods Pro', 2],
                ['王五', 'iPad Air', 1],
                ['赵六', 'Apple Watch', 1]
              ],
              executionTime: 67,
              affectedRows: 5
            }
          } else {
            // 默认返回空结果
            result = {
              columns: [],
              data: [],
              executionTime: 10,
              affectedRows: 0
            }
          }
          
          resolve(result)
        } catch (error) {
          reject(new Error('SQL执行失败: ' + error.message))
        }
      }, 500) // 模拟执行时间
    })
  },

  /**
   * 记录执行历史
   */
  recordExecution(sql, result) {
    try {
      const executionRecord = {
        sql,
        timestamp: new Date().toISOString(),
        success: !result.error,
        executionTime: result.executionTime,
        affectedRows: result.affectedRows
      }
      
      // 保存到本地存储
      const executions = wx.getStorageSync('sqlExecutions') || []
      executions.unshift(executionRecord)
      
      // 限制记录数量
      if (executions.length > 100) {
        executions.splice(100)
      }
      
      wx.setStorageSync('sqlExecutions', executions)
    } catch (error) {
      console.error('记录执行历史失败:', error)
    }
  },

  /**
   * 清空结果
   */
  onClearResult() {
    this.setData({ 
      result: null, 
      error: '' 
    })
  },

  /**
   * 切换表结构面板
   */
  toggleSchema() {
    this.setData({ 
      showSchemaPanel: !this.data.showSchemaPanel 
    })
  },

  /**
   * 插入表名
   */
  insertTableName(e) {
    try {
      const { table } = e.currentTarget.dataset
      const { sqlText } = this.data
      
      // 在光标位置插入表名
      const newSql = sqlText + table
      this.setData({ sqlText: newSql })
      
      app.utils.showSuccess(`已插入表名: ${table}`)
    } catch (error) {
      console.error('插入表名失败:', error)
      app.utils.showError('插入失败')
    }
  },

  /**
   * 分类切换
   */
  onCategoryChange(e) {
    try {
      const category = e.detail.value
      this.setData({ selectedCategory: category })
      this.loadPracticeList()
    } catch (error) {
      console.error('分类切换失败:', error)
    }
  },

  /**
   * 练习题切换
   */
  onPracticeChange(e) {
    try {
      const index = e.detail.value
      const { practiceList } = this.data
      
      if (index >= 0 && index < practiceList.length) {
        const practice = practiceList[index]
        this.setData({ 
          currentPractice: practice,
          sqlText: practice.sql 
        })
      }
    } catch (error) {
      console.error('练习题切换失败:', error)
    }
  },

  /**
   * 格式化SQL
   */
  onFormatSQL() {
    try {
      const { sqlText } = this.data
      if (!sqlText.trim()) {
        app.utils.showError('请先输入SQL语句')
        return
      }
      
      // 简单的SQL格式化
      const formatted = sqlText
        .replace(/\s+/g, ' ')
        .replace(/\s*,\s*/g, ', ')
        .replace(/\s*=\s*/g, ' = ')
        .replace(/\s*>\s*/g, ' > ')
        .replace(/\s*<\s*/g, ' < ')
        .trim()
      
      this.setData({ sqlText: formatted })
      app.utils.showSuccess('SQL格式化完成')
    } catch (error) {
      console.error('SQL格式化失败:', error)
      app.utils.showError('格式化失败')
    }
  },

  /**
   * 分享SQL
   */
  onShareSQL() {
    try {
      const { sqlText } = this.data
      if (!sqlText.trim()) {
        app.utils.showError('请先输入SQL语句')
        return
      }
      
      wx.setClipboardData({
        data: sqlText,
        success: () => {
          app.utils.showSuccess('SQL已复制到剪贴板')
        }
      })
    } catch (error) {
      console.error('分享SQL失败:', error)
      app.utils.showError('分享失败')
    }
  },

  /**
   * 快速操作
   */
  onQuickAction(e) {
    try {
      // 优先支持 data-sql 方式
      const { sql, action } = e.currentTarget.dataset;
      if (sql) {
        this.setData({ sqlText: sql });
        // 可选：让输入框聚焦（如有需求）
        return;
      }
      // 兼容原有 action 方式
      switch (action) {
        case 'clear':
          this.onClear();
          break;
        case 'format':
          this.onFormatSQL();
          break;
        case 'share':
          this.onShareSQL();
          break;
        default:
          console.warn('未知的快速操作:', action);
      }
    } catch (error) {
      console.error('快速操作失败:', error);
    }
  },

  /**
   * 显示表结构
   */
  onSchema() {
    this.toggleSchema()
  },

  /**
   * 关闭表结构面板
   */
  closeSchemaPanel() {
    this.setData({ showSchemaPanel: false })
  },

  /**
   * 插入字段
   */
  insertField(e) {
    try {
      const { field } = e.currentTarget.dataset
      const { sqlText } = this.data
      
      const newSql = sqlText + field
      this.setData({ sqlText: newSql })
      
      app.utils.showSuccess(`已插入字段: ${field}`)
    } catch (error) {
      console.error('插入字段失败:', error)
      app.utils.showError('插入失败')
    }
  },

  /**
   * 显示历史记录
   */
  onHistory() {
    this.setData({ showHistoryPanel: true })
  },

  /**
   * 选择历史记录
   */
  selectHistory(e) {
    try {
      const { index } = e.currentTarget.dataset
      const { sqlHistory } = this.data
      
      if (index >= 0 && index < sqlHistory.length) {
        this.setData({ 
          sqlText: sqlHistory[index],
          showHistoryPanel: false 
        })
      }
    } catch (error) {
      console.error('选择历史记录失败:', error)
    }
  },

  /**
   * 撤销操作
   */
  onUndo() {
    try {
      const { historyIndex, sqlHistory } = this.data
      
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1
        this.setData({
          sqlText: sqlHistory[newIndex],
          historyIndex: newIndex
        })
      }
    } catch (error) {
      console.error('撤销操作失败:', error)
    }
  },

  /**
   * 重做操作
   */
  onRedo() {
    try {
      const { historyIndex, sqlHistory } = this.data
      
      if (historyIndex < sqlHistory.length - 1) {
        const newIndex = historyIndex + 1
        this.setData({
          sqlText: sqlHistory[newIndex],
          historyIndex: newIndex
        })
      }
    } catch (error) {
      console.error('重做操作失败:', error)
    }
  },

  /**
   * 清空编辑器
   */
  onClear() {
    this.setData({ showClearConfirm: true })
  },

  /**
   * 确认清空
   */
  confirmClear() {
    this.setData({ 
      sqlText: '',
      showClearConfirm: false 
    })
    app.utils.showSuccess('编辑器已清空')
  },

  /**
   * 取消清空
   */
  cancelClear() {
    this.setData({ showClearConfirm: false })
  },

  /**
   * 显示更多菜单
   */
  onMore() {
    this.setData({ showMorePanel: true })
  },

  /**
   * 分享
   */
  onShare() {
    this.onShareSQL()
  },

  /**
   * 导出结果
   */
  onExport() {
    try {
      const { result } = this.data
      if (!result || !result.data) {
        app.utils.showError('没有可导出的数据')
        return
      }
      
      // 触发组件导出事件
      this.selectComponent('#resultViewer').exportCSV()
    } catch (error) {
      console.error('导出失败:', error)
      app.utils.showError('导出失败')
    }
  },

  /**
   * 返回
   */
  onBack() {
    wx.navigateBack({
      delta: 1,
      fail: () => {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    })
  },

  /**
   * 关闭面板
   */
  closePanel() {
    this.setData({
      showSchemaPanel: false,
      showHistoryPanel: false,
      showMorePanel: false,
      showClearConfirm: false
    })
  },

  /**
   * 复制结果
   */
  copyResult() {
    try {
      const { result } = this.data
      if (!result || !result.data) {
        app.utils.showError('没有可复制的数据')
        return
      }
      
      // 触发组件复制事件
      this.selectComponent('#resultViewer').copyResult()
    } catch (error) {
      console.error('复制失败:', error)
      app.utils.showError('复制失败')
    }
  },

  /**
   * 导出CSV
   */
  exportCSV() {
    this.onExport()
  },

  /**
   * 错误重试
   */
  retry() {
    this.initPage()
  }
})