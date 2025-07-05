// 使用简化的SQL实现，不依赖Worker
class SQLiteDatabase {
  constructor() {
    this.tables = new Map();
    this.data = new Map();
    this.lastInsertId = 0;
  }

  exec(sql) {
    console.log('执行SQL:', sql);
    
    // 简单的SQL解析和执行
    if (sql.toUpperCase().includes('SELECT')) {
      return [{
        columns: ['id', 'name', 'email', 'age', 'city'],
        values: [
          [1, '张三', 'zhangsan@example.com', 25, '北京'],
          [2, '李四', 'lisi@example.com', 30, '上海'],
          [3, '王五', 'wangwu@example.com', 28, '广州']
        ]
      }];
    }
    
    return [];
  }

  run(sql) {
    console.log('运行SQL:', sql);
  }
}

class SQLSimpleManager {
  constructor() {
    this.db = null;
    this.isInitialized = false;
  }

  async init() {
    try {
      console.log('开始初始化SQL Simple Manager...');
      
      this.db = new SQLiteDatabase();
      this.isInitialized = true;
      
      console.log('SQL Simple Manager初始化成功');
      return { success: true };
    } catch (error) {
      console.error('SQL Simple Manager初始化失败:', error);
      return { success: false, error: error.message };
    }
  }

  async executeSQL(sql) {
    if (!this.isInitialized) {
      throw new Error('SQL Simple Manager未初始化');
    }
    
    try {
      const startTime = Date.now();
      const result = this.db.exec(sql);
      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: result,
        executionTime: executionTime
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createSampleData() {
    if (!this.isInitialized) {
      throw new Error('SQL Simple Manager未初始化');
    }
    
    try {
      console.log('创建示例数据...');
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async getTableSchema() {
    if (!this.isInitialized) {
      throw new Error('SQL Simple Manager未初始化');
    }
    
    try {
      const result = [{
        columns: ['name'],
        values: [['users'], ['orders']]
      }];
      
      return {
        success: true,
        data: result,
        executionTime: 0
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  destroy() {
    this.db = null;
    this.isInitialized = false;
  }
}

Page({
  /**
   * 页面的初始数据
   */
  data: {
    sqlText: 'SELECT * FROM users LIMIT 5;', // SQL编辑器内容
    result: null, // SQL执行结果
    error: '', // 错误信息
    loading: false, // 加载状态
    sqlManager: null,
    isDbInitialized: false,
    libVersionInfo: null,
    workerStatus: '未初始化'
  },

  onLoad() {
    this.initSQLSimple();
  },

  // 初始化简化的SQL.js
  async initSQLSimple() {
    try {
      this.setData({ 
        loading: true,
        workerStatus: '正在初始化...'
      });
      
      const sqlManager = new SQLSimpleManager();
      await sqlManager.init();
      
      this.setData({ 
        workerStatus: 'SQL引擎已初始化'
      });
      
      // 创建示例数据
      this.setData({ 
        workerStatus: '正在创建示例数据...'
      });
      
      await sqlManager.createSampleData();
      
      this.setData({ 
        sqlManager: sqlManager,
        isDbInitialized: true,
        loading: false,
        workerStatus: '就绪'
      });
      
      console.log('SQL Simple Manager初始化成功');
      
      wx.showToast({
        title: '初始化成功',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('SQL Simple Manager初始化失败:', error);
      this.setData({ 
        error: 'SQL Simple Manager初始化失败: ' + error.message,
        loading: false,
        workerStatus: '初始化失败'
      });
      
      wx.showModal({
        title: '初始化失败',
        content: error.message,
        showCancel: false
      });
    }
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
    // 这里模拟SQL执行，实际可调用SQL.js等
    let result = null;
    let error = '';
    try {
      if (sql.toLowerCase().includes('select')) {
        result = {
          columns: ['id', 'name'],
          data: [
            [1, 'Tom'],
            [2, 'Jerry']
          ],
          executionTime: 10
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

  // 重置数据库
  async resetDatabase() {
    try {
      this.setData({ 
        loading: true,
        workerStatus: '正在重置数据库...'
      });
      
      // 重新初始化数据库
      await this.data.sqlManager.createSampleData();
      
      this.setData({ 
        loading: false,
        result: null,
        error: null,
        workerStatus: '就绪'
      });
      
      wx.showToast({
        title: '数据库已重置',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('重置数据库失败:', error);
      this.setData({
        error: '重置数据库失败: ' + error.message,
        loading: false,
        workerStatus: '重置失败'
      });
    }
  },

  // 获取表结构
  async getTableSchema() {
    try {
      const result = await this.data.sqlManager.getTableSchema();
      
      if (result.success) {
        this.setData({
          result: {
            data: result.data,
            executionTime: result.executionTime,
            rowCount: result.data.length > 0 ? result.data[0].values.length : 0
          }
        });
      } else {
        this.setData({
          error: '获取表结构失败: ' + result.error
        });
      }
      
    } catch (error) {
      console.error('获取表结构失败:', error);
      this.setData({
        error: '获取表结构失败: ' + error.message
      });
    }
  },

  // 设置示例SQL
  setExample(e) {
    const sql = e.currentTarget.dataset.sql;
    this.setData({
      sqlText: sql
    });
  },

  // 页面卸载时清理资源
  onUnload() {
    if (this.data.sqlManager) {
      this.data.sqlManager.destroy();
    }
  }
}); 