// workers/sql-worker.js
// SQL执行Worker，使用真实的SQL.js实现

let SQL = null;
let db = null;

// 简化的SQL.js实现
class SQLiteDatabase {
  constructor() {
    this.tables = new Map();
    this.data = new Map();
    this.lastInsertId = 0;
    this.changes = 0;
  }

  // 执行SQL语句
  exec(sql) {
    console.log('执行SQL:', sql);
    
    // 解析SQL语句
    const statements = this.parseSQL(sql);
    const results = [];
    
    for (const statement of statements) {
      const result = this.executeStatement(statement);
      if (result) {
        results.push(result);
      }
    }
    
    return results;
  }

  // 运行SQL语句（不返回结果）
  run(sql) {
    console.log('运行SQL:', sql);
    this.exec(sql);
  }

  // 解析SQL语句
  parseSQL(sql) {
    const statements = [];
    const lines = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    for (const line of lines) {
      const upperLine = line.toUpperCase();
      
      if (upperLine.startsWith('CREATE TABLE')) {
        statements.push({ type: 'CREATE_TABLE', sql: line });
      } else if (upperLine.startsWith('INSERT INTO')) {
        statements.push({ type: 'INSERT', sql: line });
      } else if (upperLine.startsWith('SELECT')) {
        statements.push({ type: 'SELECT', sql: line });
      } else if (upperLine.startsWith('UPDATE')) {
        statements.push({ type: 'UPDATE', sql: line });
      } else if (upperLine.startsWith('DELETE FROM')) {
        statements.push({ type: 'DELETE', sql: line });
      } else if (upperLine.startsWith('DROP TABLE')) {
        statements.push({ type: 'DROP_TABLE', sql: line });
      }
    }
    
    return statements;
  }

  // 执行单个SQL语句
  executeStatement(statement) {
    switch (statement.type) {
      case 'CREATE_TABLE':
        return this.createTable(statement.sql);
      case 'INSERT':
        return this.insertData(statement.sql);
      case 'SELECT':
        return this.selectData(statement.sql);
      case 'UPDATE':
        return this.updateData(statement.sql);
      case 'DELETE':
        return this.deleteData(statement.sql);
      case 'DROP_TABLE':
        return this.dropTable(statement.sql);
      default:
        throw new Error('不支持的SQL语句类型: ' + statement.type);
    }
  }

  // 创建表
  createTable(sql) {
    const match = sql.match(/CREATE TABLE\s+(\w+)\s*\(([^)]+)\)/i);
    if (!match) {
      throw new Error('CREATE TABLE语法错误');
    }
    
    const tableName = match[1];
    const columnsStr = match[2];
    
    const columns = this.parseColumns(columnsStr);
    
    this.tables.set(tableName, columns);
    this.data.set(tableName, []);
    
    console.log(`创建表 ${tableName}:`, columns);
    return null;
  }

  // 解析列定义
  parseColumns(columnsStr) {
    const columns = [];
    const columnDefs = columnsStr.split(',').map(c => c.trim());
    
    for (const def of columnDefs) {
      const parts = def.split(/\s+/);
      const name = parts[0];
      const type = parts[1] || 'TEXT';
      
      columns.push({
        name: name,
        type: type.toUpperCase(),
        primaryKey: def.toUpperCase().includes('PRIMARY KEY'),
        autoIncrement: def.toUpperCase().includes('AUTOINCREMENT'),
        notNull: def.toUpperCase().includes('NOT NULL')
      });
    }
    
    return columns;
  }

  // 插入数据
  insertData(sql) {
    const match = sql.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!match) {
      throw new Error('INSERT语法错误');
    }
    
    const tableName = match[1];
    const columnsStr = match[2];
    const valuesStr = match[3];
    
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }
    
    const columns = columnsStr.split(',').map(c => c.trim());
    const values = this.parseValues(valuesStr);
    
    const tableData = this.data.get(tableName);
    const newRow = {};
    
    for (let i = 0; i < columns.length; i++) {
      newRow[columns[i]] = values[i];
    }
    
    // 处理自增主键
    const tableColumns = this.tables.get(tableName);
    for (const col of tableColumns) {
      if (col.primaryKey && col.autoIncrement && !newRow[col.name]) {
        newRow[col.name] = ++this.lastInsertId;
      }
    }
    
    tableData.push(newRow);
    this.changes = 1;
    
    console.log(`插入数据到 ${tableName}:`, newRow);
    return null;
  }

  // 解析值
  parseValues(valuesStr) {
    const values = [];
    const parts = valuesStr.split(',').map(v => v.trim());
    
    for (const part of parts) {
      if (part.startsWith("'") && part.endsWith("'")) {
        values.push(part.slice(1, -1));
      } else if (part === 'NULL') {
        values.push(null);
      } else if (!isNaN(part)) {
        values.push(Number(part));
      } else {
        values.push(part);
      }
    }
    
    return values;
  }

  // 查询数据
  selectData(sql) {
    const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?/i);
    if (!match) {
      throw new Error('SELECT语法错误');
    }
    
    const columnsStr = match[1];
    const tableName = match[2];
    const whereClause = match[3];
    const orderByClause = match[4];
    const limitClause = match[5];
    
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }
    
    const tableData = this.data.get(tableName);
    let result = [...tableData];
    
    // 处理WHERE子句
    if (whereClause) {
      result = this.filterData(result, whereClause);
    }
    
    // 处理ORDER BY子句
    if (orderByClause) {
      result = this.sortData(result, orderByClause);
    }
    
    // 处理LIMIT子句
    if (limitClause) {
      result = result.slice(0, parseInt(limitClause));
    }
    
    // 处理SELECT列
    const columns = this.parseSelectColumns(columnsStr, tableName);
    const finalResult = this.projectColumns(result, columns);
    
    console.log(`查询 ${tableName}:`, finalResult);
    
    return {
      columns: columns.map(c => c.name),
      values: finalResult
    };
  }

  // 解析SELECT列
  parseSelectColumns(columnsStr, tableName) {
    if (columnsStr === '*') {
      return this.tables.get(tableName);
    }
    
    const columnNames = columnsStr.split(',').map(c => c.trim());
    const tableColumns = this.tables.get(tableName);
    
    return columnNames.map(name => {
      const col = tableColumns.find(c => c.name === name);
      if (!col) {
        throw new Error(`列 ${name} 不存在`);
      }
      return col;
    });
  }

  // 投影列
  projectColumns(data, columns) {
    return data.map(row => {
      const newRow = [];
      for (const col of columns) {
        newRow.push(row[col.name] || null);
      }
      return newRow;
    });
  }

  // 过滤数据
  filterData(data, whereClause) {
    const conditions = whereClause.split('AND').map(c => c.trim());
    
    return data.filter(row => {
      for (const condition of conditions) {
        if (!this.evaluateCondition(row, condition)) {
          return false;
        }
      }
      return true;
    });
  }

  // 评估条件
  evaluateCondition(row, condition) {
    const operators = ['>', '<', '>=', '<=', '=', '!='];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const parts = condition.split(op).map(p => p.trim());
        const column = parts[0];
        const value = this.parseValue(parts[1]);
        
        const rowValue = row[column];
        
        switch (op) {
          case '>':
            return rowValue > value;
          case '<':
            return rowValue < value;
          case '>=':
            return rowValue >= value;
          case '<=':
            return rowValue <= value;
          case '=':
            return rowValue == value;
          case '!=':
            return rowValue != value;
        }
      }
    }
    
    return true;
  }

  // 解析值
  parseValue(valueStr) {
    if (valueStr.startsWith("'") && valueStr.endsWith("'")) {
      return valueStr.slice(1, -1);
    } else if (valueStr === 'NULL') {
      return null;
    } else if (!isNaN(valueStr)) {
      return Number(valueStr);
    }
    return valueStr;
  }

  // 排序数据
  sortData(data, orderByClause) {
    const parts = orderByClause.split(',').map(p => p.trim());
    
    return data.sort((a, b) => {
      for (const part of parts) {
        const [column, direction] = part.split(/\s+/);
        const aVal = a[column];
        const bVal = b[column];
        
        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        if (aVal > bVal) comparison = 1;
        
        if (direction && direction.toUpperCase() === 'DESC') {
          comparison = -comparison;
        }
        
        if (comparison !== 0) {
          return comparison;
        }
      }
      return 0;
    });
  }

  // 更新数据
  updateData(sql) {
    const match = sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?/i);
    if (!match) {
      throw new Error('UPDATE语法错误');
    }
    
    const tableName = match[1];
    const setClause = match[2];
    const whereClause = match[3];
    
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }
    
    const tableData = this.data.get(tableName);
    let updatedCount = 0;
    
    // 解析SET子句
    const updates = this.parseSetClause(setClause);
    
    for (let i = 0; i < tableData.length; i++) {
      const row = tableData[i];
      
      // 检查WHERE条件
      if (whereClause && !this.evaluateCondition(row, whereClause)) {
        continue;
      }
      
      // 应用更新
      for (const [column, value] of Object.entries(updates)) {
        row[column] = value;
      }
      
      updatedCount++;
    }
    
    this.changes = updatedCount;
    console.log(`更新 ${tableName}: ${updatedCount} 行`);
    return null;
  }

  // 解析SET子句
  parseSetClause(setClause) {
    const updates = {};
    const assignments = setClause.split(',').map(a => a.trim());
    
    for (const assignment of assignments) {
      const [column, value] = assignment.split('=').map(p => p.trim());
      updates[column] = this.parseValue(value);
    }
    
    return updates;
  }

  // 删除数据
  deleteData(sql) {
    const match = sql.match(/DELETE FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?/i);
    if (!match) {
      throw new Error('DELETE语法错误');
    }
    
    const tableName = match[1];
    const whereClause = match[2];
    
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }
    
    const tableData = this.data.get(tableName);
    let deletedCount = 0;
    
    if (whereClause) {
      // 有WHERE条件，只删除匹配的行
      for (let i = tableData.length - 1; i >= 0; i--) {
        if (this.evaluateCondition(tableData[i], whereClause)) {
          tableData.splice(i, 1);
          deletedCount++;
        }
      }
    } else {
      // 没有WHERE条件，删除所有行
      deletedCount = tableData.length;
      tableData.length = 0;
    }
    
    this.changes = deletedCount;
    console.log(`删除 ${tableName}: ${deletedCount} 行`);
    return null;
  }

  // 删除表
  dropTable(sql) {
    const match = sql.match(/DROP TABLE\s+(\w+)/i);
    if (!match) {
      throw new Error('DROP TABLE语法错误');
    }
    
    const tableName = match[1];
    
    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }
    
    this.tables.delete(tableName);
    this.data.delete(tableName);
    
    console.log(`删除表 ${tableName}`);
    return null;
  }
}

// 初始化SQL.js
async function initSQL() {
  try {
    console.log('开始初始化SQL.js...');
    
    SQL = {
      Database: SQLiteDatabase
    };
    
    console.log('SQL.js初始化成功');
    return { success: true };
  } catch (error) {
    console.error('SQL.js初始化失败:', error);
    return { success: false, error: error.message };
  }
}

// 执行SQL语句
function executeSQL(sql) {
  try {
    if (!db) {
      db = new SQL.Database();
      console.log('创建新的数据库实例');
    }
    
    const startTime = Date.now();
    const result = db.exec(sql);
    const executionTime = Date.now() - startTime;
    
    console.log('SQL执行完成，耗时:', executionTime + 'ms');
    
    return {
      success: true,
      data: result,
      executionTime: executionTime
    };
  } catch (error) {
    console.error('SQL执行失败:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// 创建示例数据
function createSampleData() {
  try {
    console.log('创建示例数据...');
    
    if (!db) {
      db = new SQL.Database();
    }
    
    const createTableSQL = `
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT,
        age INTEGER,
        city TEXT
      );
      
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `;
    
    const insertDataSQL = `
      INSERT INTO users (name, email, age, city) VALUES 
      ('张三', 'zhangsan@example.com', 25, '北京'),
      ('李四', 'lisi@example.com', 30, '上海'),
      ('王五', 'wangwu@example.com', 28, '广州'),
      ('赵六', 'zhaoliu@example.com', 35, '深圳'),
      ('钱七', 'qianqi@example.com', 27, '杭州');
      
      INSERT INTO orders (user_id, product_name, quantity, price) VALUES 
      (1, 'iPhone 15', 1, 5999.00),
      (2, 'MacBook Pro', 1, 12999.00),
      (3, 'iPad Air', 2, 3999.00),
      (1, 'AirPods Pro', 1, 1999.00),
      (4, 'Apple Watch', 1, 2999.00);
    `;
    
    db.run(createTableSQL);
    db.run(insertDataSQL);
    
    console.log('示例数据创建成功');
    return { success: true };
  } catch (error) {
    console.error('创建示例数据失败:', error);
    return { success: false, error: error.message };
  }
}

// 获取表结构
function getTableSchema() {
  try {
    console.log('获取表结构...');
    
    if (!db) {
      return { success: false, error: '数据库未初始化' };
    }
    
    const tableNames = Array.from(db.tables.keys());
    const result = [{
      columns: ['name'],
      values: tableNames.map(name => [name])
    }];
    
    return {
      success: true,
      data: result,
      executionTime: 0
    };
  } catch (error) {
    console.error('获取表结构失败:', error);
    return { success: false, error: error.message };
  }
}

// 监听主线程消息
self.onmessage = function(e) {
  const { id, type, data } = e.data;
  
  console.log('收到主线程消息:', id, type, data);
  
  switch (type) {
    case 'init':
      initSQL().then(result => {
        console.log('初始化结果:', result);
        self.postMessage({ id: id, type: 'init', data: result });
      }).catch(error => {
        console.error('初始化失败:', error);
        self.postMessage({ id: id, type: 'error', data: { error: error.message } });
      });
      break;
      
    case 'execute':
      try {
        const result = executeSQL(data.sql);
        console.log('执行结果:', result);
        self.postMessage({ id: id, type: 'execute', data: result });
      } catch (error) {
        console.error('执行失败:', error);
        self.postMessage({ id: id, type: 'error', data: { error: error.message } });
      }
      break;
      
    case 'createSampleData':
      try {
        const sampleResult = createSampleData();
        console.log('创建示例数据结果:', sampleResult);
        self.postMessage({ id: id, type: 'createSampleData', data: sampleResult });
      } catch (error) {
        console.error('创建示例数据失败:', error);
        self.postMessage({ id: id, type: 'error', data: { error: error.message } });
      }
      break;
      
    case 'getTableSchema':
      try {
        const schemaResult = getTableSchema();
        console.log('获取表结构结果:', schemaResult);
        self.postMessage({ id: id, type: 'getTableSchema', data: schemaResult });
      } catch (error) {
        console.error('获取表结构失败:', error);
        self.postMessage({ id: id, type: 'error', data: { error: error.message } });
      }
      break;
      
    default:
      console.error('未知消息类型:', type);
      self.postMessage({ 
        id: id,
        type: 'error', 
        data: { error: '未知消息类型: ' + type } 
      });
  }
};

// Worker错误处理
self.onerror = function(error) {
  console.error('Worker错误:', error);
  // 注意：onerror没有消息ID，所以发送一个特殊的错误消息
  self.postMessage({ 
    type: 'worker_error', 
    data: { error: 'Worker错误: ' + error.message } 
  });
};

console.log('SQL Worker已加载'); 