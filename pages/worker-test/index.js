// pages/worker-test/index.js

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sqlText: '', // SQL编辑器内容
    result: null, // SQL执行结果
    error: '', // 错误信息
    status: '', // Worker状态
    logs: [] // 日志信息
  },

  /**
   * SQL输入事件
   */
  onSqlInput(e) {
    this.setData({ sqlText: e.detail.value });
  },

  /**
   * 执行SQL，模拟执行并返回结果
   */
  onExecute() {
    const sql = this.data.sqlText.trim();
    if (!sql) {
      wx.showToast({ title: '请输入SQL语句', icon: 'none' });
      return;
    }
    // 这里模拟SQL执行，实际可调用Worker等
    let result = null;
    let error = '';
    try {
      if (sql.toLowerCase().includes('select')) {
        result = {
          columns: ['id', 'name'],
          data: [
            [1, 'Tom'],
            [2, 'Jerry']
          ]
        };
      } else {
        error = '仅支持SELECT语句';
      }
    } catch (err) {
      error = 'SQL执行出错: ' + err.message;
    }
    // 控制台打印结果，便于调试
    console.log('SQL执行结果:', result);
    if (error) {
      console.error('SQL执行错误:', error);
    }
    this.setData({ result, error });
  },

  /**
   * 清空结果
   */
  onClearResult() {
    this.setData({ result: null, error: '' });
  },

  /**
   * 清空日志
   */
  clearLogs() {
    this.setData({ logs: [] });
  },

  /**
   * 重新测试
   */
  retest() {
    this.setData({ status: '', result: null, error: '' });
    // 可在此处重新发起Worker测试
  }
}); 