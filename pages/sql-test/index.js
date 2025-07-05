Page({
  /**
   * 页面的初始数据
   */
  data: {
    sqlCode: 'SELECT * FROM users LIMIT 5;', // SQL编辑器内容
    result: null, // SQL执行结果
    error: null, // 错误信息
    loading: false, // 加载状态
    db: null,
    isDbInitialized: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    this.initSQLite();
  },

  // 初始化SQLite数据库
  async initSQLite() {
    try {
      this.setData({ loading: true });
      
      // 动态导入SQL.js
      const initSqlJs = require('../../utils/sql.js');
      
      // 初始化SQL.js
      const SQL = await initSqlJs({
        locateFile: file => `https://sql.js.org/dist/${file}`
      });
      
      // 创建数据库
      const db = new SQL.Database();
      
      // 创建示例表和数据
      this.createSampleData(db);
      
      this.setData({ 
        db: db, 
        isDbInitialized: true,
        loading: false 
      });
      
      console.log('SQLite数据库初始化成功');
      
    } catch (error) {
      console.error('SQLite初始化失败:', error);
      this.setData({ 
        error: 'SQLite初始化失败: ' + error.message,
        loading: false 
      });
    }
  },

  // 创建示例数据
  createSampleData(db) {
    try {
      // 创建用户表
      db.run(`
        CREATE TABLE users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          email TEXT,
          age INTEGER,
          city TEXT
        );
      `);

      // 插入示例数据
      db.run(`
        INSERT INTO users (name, email, age, city) VALUES 
        ('张三', 'zhangsan@example.com', 25, '北京'),
        ('李四', 'lisi@example.com', 30, '上海'),
        ('王五', 'wangwu@example.com', 28, '广州'),
        ('赵六', 'zhaoliu@example.com', 35, '深圳'),
        ('钱七', 'qianqi@example.com', 27, '杭州');
      `);

      // 创建订单表
      db.run(`
        CREATE TABLE orders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          product_name TEXT NOT NULL,
          quantity INTEGER NOT NULL,
          price DECIMAL(10,2) NOT NULL
        );
      `);

      // 插入订单数据
      db.run(`
        INSERT INTO orders (user_id, product_name, quantity, price) VALUES 
        (1, 'iPhone 15', 1, 5999.00),
        (2, 'MacBook Pro', 1, 12999.00),
        (3, 'iPad Air', 2, 3999.00),
        (1, 'AirPods Pro', 1, 1999.00),
        (4, 'Apple Watch', 1, 2999.00);
      `);

      console.log('示例数据创建成功');
    } catch (error) {
      console.error('创建示例数据失败:', error);
      throw error;
    }
  },

  /**
   * SQL输入事件
   */
  onSqlInput(e) {
    this.setData({
      sqlCode: e.detail.value
    });
  },

  /**
   * 执行SQL，模拟执行并返回结果
   */
  executeSQL() {
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

      const startTime = Date.now();
      
      // 执行SQL查询
      const result = this.data.db.exec(sql);
      const executionTime = Date.now() - startTime;

      console.log('SQL执行结果:', result);
      console.log('执行时间:', executionTime + 'ms');

      this.setData({
        result: {
          data: result,
          executionTime: executionTime,
          rowCount: result.length > 0 ? result[0].values.length : 0
        },
        loading: false
      });

    } catch (error) {
      console.error('SQL执行失败:', error);
      this.setData({
        error: 'SQL执行失败: ' + error.message,
        loading: false
      });
    }
  },

  /**
   * 清空结果
   */
  clearResult() {
    this.setData({
      result: null,
      error: null
    });
  },

  // 重置数据库
  resetDatabase() {
    try {
      this.setData({ loading: true });
      
      // 重新初始化数据库
      this.createSampleData(this.data.db);
      
      this.setData({ 
        loading: false,
        result: null,
        error: null
      });
      
      wx.showToast({
        title: '数据库已重置',
        icon: 'success'
      });
      
    } catch (error) {
      console.error('重置数据库失败:', error);
      this.setData({
        error: '重置数据库失败: ' + error.message,
        loading: false
      });
    }
  },

  // 获取表结构
  getTableSchema() {
    try {
      const result = this.data.db.exec(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        ORDER BY name;
      `);
      
      this.setData({
        result: {
          data: result,
          executionTime: 0,
          rowCount: result.length > 0 ? result[0].values.length : 0
        }
      });
      
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
  }
}); 