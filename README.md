# SQL学习助手 - 微信小程序

一款专为SQL学习者设计的微信小程序，提供在线SQL编辑器和练习题功能。

## 项目概述

本项目是SQL学习微信小程序的MVP版本，专注于SQL练习模块，为用户提供基础的SQL学习和练习功能。采用本地SQLite数据库执行SQL语句，不依赖微信云开发。

## 技术架构

- **前端框架**: 微信小程序原生开发
- **SQL引擎**: SQL.js (WebAssembly)
- **数据存储**: 微信小程序本地存储
- **UI设计**: 简洁大方的现代化设计风格

## 项目结构

```
SQLStudy/
├── app.js                 # 小程序入口文件
├── app.json              # 小程序配置文件
├── app.wxss              # 全局样式文件
├── components/           # 自定义组件
│   ├── sql-editor/       # SQL编辑器组件
│   └── result-viewer/    # 结果展示组件
├── pages/                # 页面文件
│   ├── index/           # 首页
│   ├── editor/          # SQL编辑器页面
│   ├── practice/        # 练习题页面
│   └── about/           # 关于页面
├── utils/               # 工具函数
│   ├── sql-simple.js    # 简单SQL执行器
│   ├── sql-wasm-manager.js # WebAssembly管理器
│   └── sql.js           # SQL.js加载器
├── wasm/                # WebAssembly文件
│   ├── sql-wasm.js      # SQL.js包装器
│   └── sql-wasm.wasm    # SQLite WebAssembly文件
├── workers/             # Worker线程
│   └── sql-worker.js    # SQL执行Worker
└── docs/                # 项目文档
    ├── MVP版本设计文档.md
    ├── 架构设计文档.md
    └── 需求分析文档.md
```

## 核心功能

### 1. SQL编辑器
- 在线编写SQL语句
- 实时语法高亮
- 快捷模板插入
- 执行结果展示
- 表结构查看

### 2. 练习题系统
- 分类题目管理
- 难度等级划分
- 答题进度跟踪
- 答案对比分析
- 学习统计

### 3. 结果展示
- 表格数据展示
- 执行时间统计
- 结果导出功能
- 错误信息提示

## 页面说明

### 首页 (index)
- 应用介绍和功能导航
- 学习进度展示
- 快速开始入口
- 统计数据展示

### SQL编辑器 (editor)
- SQL代码编辑器
- 数据库表结构展示
- 执行结果展示
- 快捷操作按钮

### 练习题 (practice)
- 题目列表和分类
- 答题界面
- 结果反馈
- 进度跟踪

### 关于页面 (about)
- 应用信息
- 功能特性介绍
- 技术栈说明
- 联系方式

## 开发状态

### ✅ 已完成
- [x] 项目基础架构搭建
- [x] 页面结构设计
- [x] 自定义组件开发
- [x] 全局样式设计
- [x] 基础功能实现

### 🔄 进行中
- [ ] SQL.js集成
- [ ] 真实SQL执行引擎
- [ ] 数据持久化

### 📋 待开发
- [ ] 用户登录系统
- [ ] 云端数据同步
- [ ] 高级SQL功能
- [ ] 性能优化

## 开发环境

- 微信开发者工具
- 基础库版本: 2.15.0+
- Node.js (可选)

## 运行方式

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置小程序AppID
4. 编译运行

## 技术特点

- **现代化UI设计**: 采用简洁大方的设计风格
- **响应式布局**: 适配不同屏幕尺寸
- **组件化开发**: 高度复用的组件设计
- **性能优化**: 使用WebAssembly提升SQL执行性能
- **用户体验**: 流畅的交互和友好的反馈

## 贡献指南

欢迎提交Issue和Pull Request来改进项目。

## 许可证

MIT License

## 联系方式

- 邮箱: support@sqlstudy.com
- 官网: https://sqlstudy.com
- GitHub: https://github.com/sqlstudy
