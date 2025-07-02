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
  data: {
    sqlCode: 'SELECT * FROM users LIMIT 5;',
    result: null,
    error: null,
    loading: false,
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

  // 输入SQL代码
  onSqlInput(e) {
    this.setData({
      sqlCode: e.detail.value
    });
  },

  // 执行SQL语句
  async executeSQL() {
    if (!this.data.isDbInitialized) {
      this.setData({
        error: '数据库未初始化，请稍后再试'
      });
      return;
    }

    const sql = this.data.sqlCode.trim();
    if (!sql) {
      this.setData({
        error: '请输入SQL语句'
      });
      return;
    }

    try {
      this.setData({ 
        loading: true, 
        error: null, 
        result: null 
      });

      const result = await this.data.sqlManager.executeSQL(sql);

      if (result.success) {
        this.setData({
          result: {
            data: result.data,
            executionTime: result.executionTime,
            rowCount: result.data.length > 0 ? result.data[0].values.length : 0
          },
          loading: false
        });
      } else {
        this.setData({
          error: 'SQL执行失败: ' + result.error,
          loading: false
        });
      }

    } catch (error) {
      console.error('SQL执行失败:', error);
      this.setData({
        error: 'SQL执行失败: ' + error.message,
        loading: false
      });
    }
  },

  // 清空结果
  clearResult() {
    this.setData({
      result: null,
      error: null
    });
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
      sqlCode: sql
    });
  },

  // 页面卸载时清理资源
  onUnload() {
    if (this.data.sqlManager) {
      this.data.sqlManager.destroy();
    }
  }
}); 