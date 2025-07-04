// pages/editor/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sqlText: '',
    sqlHistory: [],
    historyIndex: -1,
    showSchemaPanel: false,
    showHistoryPanel: false,
    showMorePanel: false,
    showClearConfirm: false,
    loading: false,
    result: null,
    error: '',
    // 示例数据库信息
    databaseInfo: {
      name: '示例数据库',
      tables: ['users', 'orders', 'products']
    },
    // 假设有表结构数据
    tableSchema: [
      { table: 'users', columns: ['id', 'name', 'age'] },
      { table: 'orders', columns: ['id', 'user_id', 'product', 'price'] }
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
    this.loadTableSchema()
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
      title: 'SQL编辑器 - 在线编写和执行SQL',
      path: '/pages/editor/index'
    }
  },

  // 加载表结构信息
  loadTableSchema() {
    // TODO: 从SQLite获取表结构
    const mockSchema = [
      {
        table: 'users',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true },
          { name: 'name', type: 'TEXT', nullable: false },
          { name: 'email', type: 'TEXT' },
          { name: 'age', type: 'INTEGER' },
          { name: 'city', type: 'TEXT' }
        ]
      },
      {
        table: 'orders',
        columns: [
          { name: 'id', type: 'INTEGER', primary: true },
          { name: 'user_id', type: 'INTEGER' },
          { name: 'product_name', type: 'TEXT', nullable: false },
          { name: 'quantity', type: 'INTEGER', nullable: false },
          { name: 'price', type: 'DECIMAL(10,2)', nullable: false }
        ]
      }
    ]
    
    this.setData({
      tableSchema: mockSchema
    })
  },

  // SQL输入事件
  onSqlInput(e) {
    const value = e.detail.value
    let { sqlHistory, historyIndex } = this.data
    // 只在新输入时追加历史
    if (historyIndex === sqlHistory.length - 1) {
      sqlHistory.push(value)
      historyIndex = sqlHistory.length - 1
    } else {
      sqlHistory = sqlHistory.slice(0, historyIndex + 1)
      sqlHistory.push(value)
      historyIndex = sqlHistory.length - 1
    }
    this.setData({ sqlText: value, sqlHistory, historyIndex })
  },

  // 执行SQL
  onExecute() {
    const sql = this.data.sqlText.trim()
    if (!sql) {
      wx.showToast({
        title: '请输入SQL语句',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true, error: '' })
    
    setTimeout(() => {
      // 模拟SQL执行结果
      let result = null
      let error = ''
      
      try {
        // 根据不同的SQL语句返回不同的模拟结果
        if (sql.toLowerCase().includes('select * from users')) {
          result = {
            columns: ['id', 'name', 'email', 'age', 'city'],
            data: [
              [1, '张三', 'zhangsan@example.com', 25, '北京'],
              [2, '李四', 'lisi@example.com', 30, '上海'],
              [3, '王五', 'wangwu@example.com', 28, '广州'],
              [4, '赵六', 'zhaoliu@example.com', 35, '深圳']
            ],
            executionTime: 45
          }
        } else if (sql.toLowerCase().includes('select * from orders')) {
          result = {
            columns: ['id', 'user_id', 'product_name', 'quantity', 'price'],
            data: [
              [1, 1, 'iPhone 15', 1, 5999.00],
              [2, 2, 'MacBook Pro', 1, 12999.00],
              [3, 1, 'AirPods Pro', 2, 1899.00],
              [4, 3, 'iPad Air', 1, 4399.00],
              [5, 4, 'Apple Watch', 1, 2999.00]
            ],
            executionTime: 32
          }
        } else if (sql.toLowerCase().includes('count')) {
          result = {
            columns: ['total'],
            data: [[4]],
            executionTime: 15
          }
        } else if (sql.toLowerCase().includes('join')) {
          result = {
            columns: ['user_name', 'product_name'],
            data: [
              ['张三', 'iPhone 15'],
              ['张三', 'AirPods Pro'],
              ['李四', 'MacBook Pro'],
              ['王五', 'iPad Air'],
              ['赵六', 'Apple Watch']
            ],
            executionTime: 67
          }
        } else {
          // 默认返回一个通用的结果
          result = {
            columns: ['id', 'name', 'value'],
            data: [
              [1, '示例数据1', '值1'],
              [2, '示例数据2', '值2'],
              [3, '示例数据3', '值3']
            ],
            executionTime: 28
          }
        }
      } catch (err) {
        error = 'SQL执行出错: ' + err.message
      }
      
      this.setData({
        loading: false,
        result: result,
        error: error
      })
      
      if (!error) {
        wx.showToast({ 
          title: '执行成功', 
          icon: 'success' 
        })
      }
    }, 800)
  },

  // 清空结果
  onClearResult() {
    this.setData({
      result: null,
      error: ''
    })
  },

  // 切换表结构显示
  toggleSchema() {
    this.setData({
      showSchema: !this.data.showSchema
    })
  },

  // 插入表名
  insertTableName(e) {
    const { table } = e.currentTarget.dataset
    const currentSql = this.data.sqlText
    const newSql = currentSql + table
    
    this.setData({
      sqlText: newSql
    })
  },

  // 格式化SQL
  onFormatSQL() {
    // TODO: 实现SQL格式化
    wx.showToast({
      title: '格式化功能开发中',
      icon: 'none'
    })
  },

  // 分享SQL
  onShareSQL() {
    const sql = this.data.sqlText
    if (!sql.trim()) {
      wx.showToast({
        title: '没有可分享的SQL',
        icon: 'none'
      })
      return
    }

    wx.setClipboardData({
      data: sql,
      success: () => {
        wx.showToast({
          title: 'SQL已复制到剪贴板',
          icon: 'success'
        })
      }
    })
  },

  // 快捷操作
  onQuickAction(e) {
    const { sql } = e.currentTarget.dataset
    this.setData({
      sqlText: sql
    })
  },

  // 表结构弹窗
  onSchema() {
    this.setData({ showSchemaPanel: true })
  },
  closeSchemaPanel() {
    this.setData({ showSchemaPanel: false })
  },
  insertField(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ sqlText: this.data.sqlText + ' ' + field })
    wx.showToast({ title: '已插入字段', icon: 'none' })
  },

  // 历史下拉
  onHistory() {
    this.setData({ showHistoryPanel: !this.data.showHistoryPanel })
  },
  selectHistory(e) {
    const sql = e.currentTarget.dataset.sql
    this.setData({ sqlText: sql, showHistoryPanel: false })
    wx.showToast({ title: '已回填历史SQL', icon: 'none' })
  },

  // 撤销/重做
  onUndo() {
    const { sqlHistory, historyIndex } = this.data
    if (historyIndex > 0) {
      this.setData({
        sqlText: sqlHistory[historyIndex - 1],
        historyIndex: historyIndex - 1
      })
    }
  },
  onRedo() {
    const { sqlHistory, historyIndex } = this.data
    if (historyIndex < sqlHistory.length - 1) {
      this.setData({
        sqlText: sqlHistory[historyIndex + 1],
        historyIndex: historyIndex + 1
      })
    }
  },

  // 清空确认
  onClear() {
    this.setData({ showClearConfirm: true })
  },
  confirmClear() {
    this.setData({ sqlText: '', showClearConfirm: false })
    wx.showToast({ title: '已清空', icon: 'none' })
  },
  cancelClear() {
    this.setData({ showClearConfirm: false })
  },

  // 更多菜单
  onMore() {
    this.setData({ showMorePanel: !this.data.showMorePanel })
  },
  onShare() {
    wx.showShareMenu()
    wx.showToast({ title: '分享', icon: 'none' })
  },
  onExport() {
    wx.showToast({ title: '导出CSV', icon: 'none' })
    // 实际导出逻辑略
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 关闭弹窗
  closePanel() {
    this.setData({ showSchemaPanel: false, showHistoryPanel: false, showMorePanel: false, showClearConfirm: false })
  },

  // 复制结果
  copyResult() {
    this.selectComponent('.result-viewer-component').copyResult();
  },
  // 导出CSV
  exportCSV() {
    this.selectComponent('.result-viewer-component').exportCSV();
  },
})