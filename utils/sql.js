// utils/sql.js
// SQL.js 封装，用于在微信小程序中使用

// 注意：由于微信小程序的限制，SQL.js可能无法直接使用
// 这里提供一个模拟实现，用于验证基本功能

class SQLiteMock {
  constructor() {
    this.tables = new Map();
    this.data = new Map();
  }

  // 执行SQL语句
  exec(sql) {
    try {
      const upperSql = sql.trim().toUpperCase();
      
      // 解析SQL语句
      if (upperSql.startsWith('SELECT')) {
        return this.executeSelect(sql);
      } else if (upperSql.startsWith('CREATE TABLE')) {
        return this.executeCreateTable(sql);
      } else if (upperSql.startsWith('INSERT INTO')) {
        return this.executeInsert(sql);
      } else if (upperSql.startsWith('UPDATE')) {
        return this.executeUpdate(sql);
      } else if (upperSql.startsWith('DELETE FROM')) {
        return this.executeDelete(sql);
      } else {
        throw new Error(`不支持的SQL语句: ${sql}`);
      }
    } catch (error) {
      throw new Error(`SQL执行错误: ${error.message}`);
    }
  }

  // 执行SELECT查询
  executeSelect(sql) {
    // 支持查询sqlite_master表结构
    if (/FROM\\s+sqlite_master/i.test(sql)) {
      // 返回所有表名
      return [{
        columns: ['name'],
        values: Array.from(this.tables.keys()).map(name => [name])
      }];
    }
    
    // 简单的SELECT解析（仅支持基础查询）
    const match = sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?(?:\s+ORDER BY\s+(.+?))?(?:\s+LIMIT\s+(\d+))?;?$/i);
    
    if (!match) {
      throw new Error('SELECT语句格式错误');
    }

    const columns = match[1].split(',').map(col => col.trim());
    const tableName = match[2].trim();
    const whereClause = match[3];
    const orderBy = match[4];
    const limit = match[5] ? parseInt(match[5]) : null;

    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    let data = [...this.data.get(tableName) || []];

    // 处理WHERE条件
    if (whereClause) {
      data = this.filterData(data, whereClause, tableName);
    }

    // 处理ORDER BY
    if (orderBy) {
      data = this.sortData(data, orderBy, tableName);
    }

    // 处理LIMIT
    if (limit) {
      data = data.slice(0, limit);
    }

    // 处理列选择
    const tableSchema = this.tables.get(tableName);
    let resultColumns = tableSchema.columns;
    
    if (columns[0] !== '*') {
      resultColumns = columns;
    }

    return [{
      columns: resultColumns,
      values: data.map(row => {
        if (columns[0] === '*') {
          return row;
        } else {
          return columns.map(col => row[tableSchema.columns.indexOf(col)]);
        }
      })
    }];
  }

  // 执行CREATE TABLE
  executeCreateTable(sql) {
    console.log('解析CREATE TABLE:', sql);
    
    // 改进的正则表达式，支持多行和更复杂的列定义
    const match = sql.match(/CREATE TABLE\s+(\w+)\s*\(\s*([\s\S]+?)\s*\);?/i);
    
    if (!match) {
      console.log('CREATE TABLE匹配失败');
      throw new Error('CREATE TABLE语句格式错误');
    }

    const tableName = match[1];
    const columnsDef = match[2];
    
    console.log('表名:', tableName);
    console.log('列定义:', columnsDef);

    if (this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 已存在`);
    }

    // 解析列定义，处理多行和复杂定义
    const columnLines = columnsDef.split(',').map(line => line.trim()).filter(line => line.length > 0);
    const columns = [];

    console.log('解析的列行:', columnLines);

    for (const line of columnLines) {
      // 跳过PRIMARY KEY, FOREIGN KEY等约束
      if (line.toUpperCase().includes('PRIMARY KEY') || 
          line.toUpperCase().includes('FOREIGN KEY') ||
          line.toUpperCase().includes('UNIQUE') ||
          line.toUpperCase().includes('CHECK')) {
        console.log('跳过约束:', line);
        continue;
      }
      
      // 提取列名（第一个单词）
      const colMatch = line.match(/^(\w+)/);
      if (colMatch) {
        columns.push(colMatch[1]);
        console.log('添加列:', colMatch[1]);
      }
    }

    if (columns.length === 0) {
      throw new Error('没有找到有效的列定义');
    }

    console.log('最终列:', columns);
    this.tables.set(tableName, { columns });
    this.data.set(tableName, []);

    return [];
  }

  // 执行INSERT
  executeInsert(sql) {
    // 改进的正则表达式，支持多行INSERT语句
    const match = sql.match(/INSERT INTO\s+(\w+)\s*\(\s*([\s\S]+?)\s*\)\s*VALUES\s*([\s\S]+?);?$/i);
    
    if (!match) {
      throw new Error('INSERT语句格式错误');
    }

    const tableName = match[1];
    const columns = match[2].split(',').map(col => col.trim());
    const valuesStr = match[3];

    if (!this.tables.has(tableName)) {
      throw new Error(`表 ${tableName} 不存在`);
    }

    // 解析VALUES
    const valuesList = this.parseValues(valuesStr);
    
    for (const values of valuesList) {
      if (values.length !== columns.length) {
        throw new Error('列数与值数不匹配');
      }

      const row = new Array(this.tables.get(tableName).columns.length);
      columns.forEach((col, index) => {
        const colIndex = this.tables.get(tableName).columns.indexOf(col);
        if (colIndex >= 0) {
          row[colIndex] = this.parseValue(values[index]);
        }
      });

      this.data.get(tableName).push(row);
    }

    return [];
  }

  // 解析VALUES
  parseValues(valuesStr) {
    const values = [];
    // 改进的正则表达式，更好地处理多行和空格
    const regex = /\(\s*([^)]+)\s*\)/g;
    let match;
    
    while ((match = regex.exec(valuesStr)) !== null) {
      const valueList = match[1].split(',').map(v => v.trim());
      values.push(valueList);
    }
    
    return values;
  }

  // 解析单个值
  parseValue(value) {
    value = value.trim();
    
    if (value.startsWith("'") && value.endsWith("'")) {
      return value.slice(1, -1);
    } else if (value === 'NULL') {
      return null;
    } else if (!isNaN(value)) {
      return parseFloat(value);
    } else {
      return value;
    }
  }

  // 过滤数据
  filterData(data, whereClause, tableName) {
    // 简单的WHERE条件解析
    const conditions = whereClause.split('AND').map(cond => cond.trim());
    
    return data.filter(row => {
      return conditions.every(condition => {
        return this.evaluateCondition(row, condition, tableName);
      });
    });
  }

  // 评估条件
  evaluateCondition(row, condition, tableName) {
    const operators = ['=', '>', '<', '>=', '<=', '!='];
    let operator = '';
    let parts = [];

    for (const op of operators) {
      if (condition.includes(op)) {
        operator = op;
        parts = condition.split(op).map(p => p.trim());
        break;
      }
    }

    if (!operator || parts.length !== 2) {
      return true; // 无法解析的条件，默认通过
    }

    const tableSchema = this.tables.get(tableName);
    const columnIndex = tableSchema.columns.indexOf(parts[0]);
    
    if (columnIndex === -1) {
      return true;
    }

    const leftValue = row[columnIndex];
    const rightValue = this.parseValue(parts[1]);

    switch (operator) {
      case '=':
        return leftValue === rightValue;
      case '>':
        return leftValue > rightValue;
      case '<':
        return leftValue < rightValue;
      case '>=':
        return leftValue >= rightValue;
      case '<=':
        return leftValue <= rightValue;
      case '!=':
        return leftValue !== rightValue;
      default:
        return true;
    }
  }

  // 排序数据
  sortData(data, orderBy, tableName) {
    const tableSchema = this.tables.get(tableName);
    const [column, direction] = orderBy.split(/\s+/);
    const columnIndex = tableSchema.columns.indexOf(column);
    
    if (columnIndex === -1) {
      return data;
    }

    return data.sort((a, b) => {
      const aVal = a[columnIndex];
      const bVal = b[columnIndex];
      
      if (direction && direction.toUpperCase() === 'DESC') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  }

  // 运行SQL语句（用于INSERT, UPDATE, DELETE等）
  run(sql) {
    this.exec(sql);
  }
}

// 模拟SQL.js的初始化函数
function initSqlJs(options = {}) {
  return Promise.resolve({
    Database: SQLiteMock
  });
}

module.exports = initSqlJs; 