// pages/editor/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sqlText: '',
    result: null,
    error: '',
    loading: false,
    showSchema: false,
    tableSchema: [],
    // 示例数据库信息
    databaseInfo: {
      name: '示例数据库',
      tables: ['users', 'orders', 'products']
    }
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
    this.setData({
      sqlText: e.detail.value
    })
  },

  // 执行SQL
  onExecuteSQL(e) {
    const sql = e.detail.sql
    if (!sql.trim()) {
      wx.showToast({
        title: '请输入SQL语句',
        icon: 'none'
      })
      return
    }

    this.executeSQL(sql)
  },

  // 执行SQL语句
  async executeSQL(sql) {
    this.setData({
      loading: true,
      result: null,
      error: ''
    })

    try {
      // TODO: 调用SQL执行引擎
      const result = await this.mockExecuteSQL(sql)
      
      this.setData({
        result,
        loading: false
      })
    } catch (error) {
      this.setData({
        error: error.message,
        loading: false
      })
    }
  },

  // 模拟SQL执行
  mockExecuteSQL(sql) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const upperSql = sql.toUpperCase()
        
        if (upperSql.includes('SELECT')) {
          // 模拟SELECT查询
          if (upperSql.includes('USERS')) {
            resolve({
              columns: ['id', 'name', 'email', 'age', 'city'],
              data: [
                [1, '张三', 'zhangsan@example.com', 25, '北京'],
                [2, '李四', 'lisi@example.com', 30, '上海'],
                [3, '王五', 'wangwu@example.com', 28, '广州']
              ],
              executionTime: Math.floor(Math.random() * 50) + 10
            })
          } else if (upperSql.includes('ORDERS')) {
            resolve({
              columns: ['id', 'user_id', 'product_name', 'quantity', 'price'],
              data: [
                [1, 1, 'iPhone 15', 1, 5999.00],
                [2, 2, 'MacBook Pro', 1, 12999.00],
                [3, 1, 'AirPods Pro', 2, 1999.00]
              ],
              executionTime: Math.floor(Math.random() * 50) + 10
            })
          } else {
            resolve({
              columns: ['message'],
              data: [['查询执行成功']],
              executionTime: Math.floor(Math.random() * 50) + 10
            })
          }
        } else if (upperSql.includes('INSERT') || upperSql.includes('UPDATE') || upperSql.includes('DELETE')) {
          // 模拟DML操作
          resolve({
            columns: ['affected_rows'],
            data: [[1]],
            executionTime: Math.floor(Math.random() * 30) + 5
          })
        } else {
          reject(new Error('不支持的SQL语句类型'))
        }
      }, 500) // 模拟网络延迟
    })
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

  onSchema() {
    wx.showToast({ title: '表结构', icon: 'none' })
  },
  onHistory() {
    wx.showToast({ title: '历史', icon: 'none' })
  },
  onUndo() {
    wx.showToast({ title: '撤销', icon: 'none' })
  },
  onRedo() {
    wx.showToast({ title: '重做', icon: 'none' })
  },
  onClear() {
    wx.showToast({ title: '清空', icon: 'none' })
  },
  onExecute() {
    wx.showToast({ title: '执行SQL', icon: 'none' })
  },
  onBack() {
    wx.navigateBack()
  },
  onMore() {
    wx.showToast({ title: '更多', icon: 'none' })
  }
})