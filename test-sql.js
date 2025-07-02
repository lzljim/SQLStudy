// test-sql.js - 测试SQL解析器
const initSqlJs = require('./utils/sql.js');

async function testSQLParser() {
  try {
    console.log('开始测试SQL解析器...');
    
    // 初始化SQL.js
    const SQL = await initSqlJs();
    const db = new SQL.Database();
    
    console.log('✅ SQL.js初始化成功');
    
    // 测试CREATE TABLE
    console.log('\n测试CREATE TABLE...');
    db.run(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        age INTEGER,
        city TEXT
      );
    `);
    console.log('✅ CREATE TABLE users 成功');
    
    // 测试INSERT
    console.log('\n测试INSERT...');
    db.run(`
      INSERT INTO users (name, email, age, city) VALUES 
      ('张三', 'zhangsan@example.com', 25, '北京'),
      ('李四', 'lisi@example.com', 30, '上海'),
      ('王五', 'wangwu@example.com', 28, '广州');
    `);
    console.log('✅ INSERT 成功');
    
    // 测试SELECT
    console.log('\n测试SELECT...');
    const result = db.exec('SELECT * FROM users;');
    console.log('✅ SELECT 成功');
    console.log('查询结果:', result);
    
    // 测试条件查询
    console.log('\n测试条件查询...');
    const result2 = db.exec('SELECT name, age FROM users WHERE age > 25;');
    console.log('✅ 条件查询成功');
    console.log('查询结果:', result2);
    
    console.log('\n🎉 所有测试通过！');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

// 运行测试
testSQLParser(); 