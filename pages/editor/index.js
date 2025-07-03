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
    this.setData({ loading: true })
    setTimeout(() => {
      // 假设执行SQL并返回结果
      this.setData({
        loading: false,
        result: { rowCount: 2, executionTime: 123, data: [
          { columns: ['id', 'name'], values: [[1, 'Tom'], [2, 'Jerry']] }
        ] },
        error: ''
      })
      wx.showToast({ title: '执行成功', icon: 'success' })
    }, 1200)
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
  }
})