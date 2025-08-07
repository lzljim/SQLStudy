# SQL学习助手小程序

一个功能完整的微信小程序，帮助用户随时随地学习SQL语言。

## 📋 项目概述

SQL学习助手是一个专为SQL学习者设计的微信小程序，提供在线SQL编辑器、练习题、语法高亮等功能，让用户能够方便地学习和练习SQL语句。

## ✨ 主要功能

- **SQL编辑器**: 在线编写和执行SQL语句，实时查看执行结果
- **练习题**: 通过练习题巩固SQL知识，提升实战能力
- **语法高亮**: 支持SQL语法高亮显示
- **历史记录**: 保存SQL执行历史
- **离线支持**: 支持离线模式学习
- **主题切换**: 支持明暗主题切换

## 🏗️ 项目结构

```
SQL学习助手/
├── app.js                          # 小程序入口文件
├── app.json                        # 小程序配置文件
├── app.wxss                        # 全局样式文件
├── project.config.json             # 项目配置文件
├── sitemap.json                    # 站点地图配置
├── theme.json                      # 主题配置文件
├── README.md                       # 项目说明文档
├── pages/                          # 页面目录
│   ├── index/                      # 首页
│   ├── editor/                     # SQL编辑器
│   ├── practice/                   # 练习题
│   ├── about/                      # 关于页面
│   ├── sql-test/                   # SQL测试页面
│   ├── wasm-test/                  # WASM测试页面
│   └── worker-test/                # Worker测试页面
├── components/                     # 自定义组件
├── utils/                          # 工具类目录
│   ├── common.js                   # 通用工具类
│   ├── error-handler.js            # 错误处理工具
│   ├── sql.js                      # SQL处理工具
│   ├── sql-simple.js               # 简化SQL工具
│   └── sql-wasm-manager.js         # WASM管理器
├── wasm/                           # WebAssembly文件
├── workers/                        # Worker文件
└── docs/                           # 文档目录
```

## 🛠️ 技术栈

- **框架**: 微信小程序原生框架
- **语言**: JavaScript ES6+
- **存储**: 微信小程序本地存储
- **数据库**: SQLite (通过WASM)
- **构建工具**: 微信开发者工具

## 📦 核心模块

### 1. 应用入口 (app.js)

主应用文件，负责：
- 应用生命周期管理
- 全局数据管理
- 系统初始化
- 错误处理和上报
- 工具方法提供

```javascript
// 主要功能
- 应用初始化 (initApp)
- 数据库初始化 (initDatabase)
- 用户信息管理 (initUserInfo)
- 主题设置 (initTheme)
- 错误处理 (reportError)
- 工具方法 (utils)
```

### 2. 通用工具类 (utils/common.js)

提供应用所需的通用工具方法和常量定义：

```javascript
// 常量定义
export const CONSTANTS = {
  APP_NAME: 'SQL学习助手',
  APP_VERSION: '1.0.0',
  STORAGE_KEYS: { ... },
  DEFAULTS: { ... },
  ERROR_MESSAGES: { ... },
  SUCCESS_MESSAGES: { ... },
  REGEX: { ... },
  THEMES: { ... }
}

// 工具类
export const DateTimeUtils = { ... }    // 日期时间工具
export const StringUtils = { ... }      // 字符串处理工具
export const NumberUtils = { ... }      // 数字处理工具
export const ArrayUtils = { ... }       // 数组处理工具
export const ObjectUtils = { ... }      // 对象处理工具
export const ValidationUtils = { ... }  // 验证工具
export const StorageUtils = { ... }     // 存储工具
export const NetworkUtils = { ... }     // 网络工具
export const DeviceUtils = { ... }      // 设备信息工具
```

### 3. 错误处理工具 (utils/error-handler.js)

统一的错误处理机制：

```javascript
export class ErrorHandler {
  // 错误类型
  ERROR_TYPES = {
    NETWORK: 'NETWORK_ERROR',
    DATABASE: 'DATABASE_ERROR',
    VALIDATION: 'VALIDATION_ERROR',
    PERMISSION: 'PERMISSION_ERROR',
    TIMEOUT: 'TIMEOUT_ERROR',
    STORAGE: 'STORAGE_ERROR',
    API: 'API_ERROR',
    UNKNOWN: 'UNKNOWN_ERROR'
  }

  // 错误严重程度
  ERROR_SEVERITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  }

  // 主要方法
  handleError(error, options)     // 处理错误
  logError(errorInfo)             // 记录错误日志
  reportError(errorInfo)          // 上报错误
  showUserFriendlyError(errorInfo) // 显示用户友好错误提示
  tryRecoverError(errorInfo)      // 尝试恢复错误
}
```

### 4. SQL处理工具 (utils/sql.js)

SQL语句处理和数据库操作：

```javascript
class SQLiteMock {
  exec(sql)                    // 执行SQL语句
  executeSelect(sql)           // 执行SELECT查询
  executeCreateTable(sql)      // 执行CREATE TABLE
  executeInsert(sql)           // 执行INSERT语句
  executeUpdate(sql)           // 执行UPDATE语句
  executeDelete(sql)           // 执行DELETE语句
}
```

## 🚀 快速开始

### 环境要求

- 微信开发者工具 1.06.2401150 或更高版本
- 微信小程序基础库 3.8.9 或更高版本
- Node.js 16.0.0 或更高版本

### 安装步骤

1. **克隆项目**
   ```bash
   git clone https://github.com/your-username/sql-study-miniprogram.git
   cd sql-study-miniprogram
   ```

2. **打开微信开发者工具**
   - 导入项目
   - 选择小程序项目
   - 填入AppID（如果没有，可以选择测试号）

3. **配置项目**
   - 在 `project.config.json` 中配置你的AppID
   - 根据需要修改 `app.json` 中的页面配置

4. **运行项目**
   - 点击编译
   - 在模拟器中预览效果

### 开发指南

#### 1. 添加新页面

1. 在 `pages/` 目录下创建新页面文件夹
2. 在文件夹中创建 `.js`、`.wxml`、`.wxss`、`.json` 文件
3. 在 `app.json` 的 `pages` 数组中添加页面路径

```javascript
// pages/new-page/new-page.js
Page({
  data: {
    // 页面数据
  },
  
  onLoad(options) {
    // 页面加载时执行
  },
  
  // 其他生命周期方法...
})
```

#### 2. 使用工具类

```javascript
// 导入工具类
import { CONSTANTS, StorageUtils, DateTimeUtils } from '../../utils/common.js'
import { ErrorHandler } from '../../utils/error-handler.js'

// 使用常量
console.log(CONSTANTS.APP_NAME)

// 使用存储工具
StorageUtils.set('key', 'value')
const value = StorageUtils.get('key')

// 使用日期工具
const formattedDate = DateTimeUtils.formatDate(new Date(), 'YYYY-MM-DD')

// 使用错误处理
const errorHandler = new ErrorHandler()
errorHandler.handleError(error, {
  type: 'NETWORK_ERROR',
  severity: 'MEDIUM'
})
```

#### 3. 错误处理

```javascript
// 在页面中使用错误处理
const app = getApp()

try {
  // 可能出错的代码
} catch (error) {
  app.errorHandler.handleError(error, {
    type: 'DATABASE_ERROR',
    severity: 'HIGH',
    context: 'PageOperation'
  })
}
```

## 📝 代码规范

### 1. 文件命名

- 使用小写字母和连字符
- 页面文件使用 `kebab-case`
- 工具类文件使用 `camelCase`

### 2. 代码注释

- 使用 JSDoc 格式的注释
- 为所有公共方法添加注释
- 为复杂逻辑添加行内注释

```javascript
/**
 * 格式化日期
 * 
 * @param {Date|string|number} date - 日期对象、日期字符串或时间戳
 * @param {string} format - 格式化模板
 * @returns {string} 格式化后的日期字符串
 */
formatDate(date, format = 'YYYY-MM-DD') {
  // 实现代码...
}
```

### 3. 错误处理

- 使用统一的错误处理机制
- 为用户提供友好的错误提示
- 记录详细的错误日志

### 4. 性能优化

- 合理使用缓存
- 避免频繁的存储操作
- 优化页面渲染性能

## 🔧 配置说明

### 应用配置 (app.json)

```json
{
  "pages": [
    "pages/index/index",
    "pages/editor/index",
    "pages/practice/index",
    "pages/about/index"
  ],
  "window": {
    "backgroundTextStyle": "light",
    "navigationBarBackgroundColor": "#fff",
    "navigationBarTitleText": "SQL学习助手",
    "navigationBarTextStyle": "black"
  },
  "style": "v2",
  "sitemapLocation": "sitemap.json"
}
```

### 项目配置 (project.config.json)

```json
{
  "appid": "your-app-id",
  "compileType": "miniprogram",
  "libVersion": "3.8.9",
  "setting": {
    "es6": true,
    "enhance": true,
    "postcss": true,
    "minified": true
  }
}
```

## 🧪 测试

### 单元测试

项目包含基本的测试文件：

- `test-sql.js` - SQL功能测试

### 手动测试

1. **功能测试**
   - 测试SQL编辑器功能
   - 测试练习题功能
   - 测试主题切换功能

2. **兼容性测试**
   - 测试不同设备兼容性
   - 测试不同微信版本兼容性

3. **性能测试**
   - 测试页面加载性能
   - 测试SQL执行性能

## 📦 部署

### 发布流程

1. **代码审查**
   - 确保代码质量
   - 检查功能完整性

2. **测试验证**
   - 在真机上测试
   - 验证所有功能

3. **提交审核**
   - 上传代码到微信公众平台
   - 填写版本信息
   - 提交审核

4. **发布上线**
   - 审核通过后发布
   - 监控应用运行状态

## 🤝 贡献指南

### 提交代码

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

### 代码规范

- 遵循现有的代码风格
- 添加适当的注释
- 确保代码通过测试
- 更新相关文档

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 联系方式

- 项目维护者: [Your Name]
- 邮箱: [your.email@example.com]
- 项目链接: [https://github.com/your-username/sql-study-miniprogram](https://github.com/your-username/sql-study-miniprogram)

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户。

---

**注意**: 这是一个学习项目，仅供学习和参考使用。在生产环境中使用时，请确保遵循相关的安全最佳实践。
