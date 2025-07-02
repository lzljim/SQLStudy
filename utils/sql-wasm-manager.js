// utils/sql-wasm-manager.js
// WebAssembly SQL.js管理器

class SQLWasmManager {
  constructor() {
    this.worker = null;
    this.isInitialized = false;
    this.messageCallbacks = new Map();
    this.messageId = 0;
  }

  // 初始化Worker
  async init() {
    try {
      console.log('开始初始化SQL WebAssembly Worker...');
      
      // 检查基础库版本
      const systemInfo = wx.getSystemInfoSync();
      const libVersion = systemInfo.SDKVersion;
      console.log('当前基础库版本:', libVersion);
      
      // 检查是否支持Worker
      if (!wx.createWorker) {
        throw new Error('当前基础库不支持Worker，请升级到2.15.0+');
      }
      
      // 创建Worker
      this.worker = wx.createWorker('workers/sql-worker.js');
      
      // 设置消息监听
      this.worker.onMessage((result) => {
        this.handleWorkerMessage(result);
      });
      
      // 设置错误监听
      this.worker.onError((error) => {
        console.error('Worker错误:', error);
        this.rejectAllCallbacks('Worker错误: ' + error.message);
      });
      
      // 发送初始化消息
      const initResult = await this.sendMessage('init');
      
      if (initResult.success) {
        this.isInitialized = true;
        console.log('SQL WebAssembly Worker初始化成功');
        return initResult;
      } else {
        throw new Error(initResult.error);
      }
      
    } catch (error) {
      console.error('SQL WebAssembly Worker初始化失败:', error);
      throw error;
    }
  }

  // 发送消息到Worker
  sendMessage(type, data = {}) {
    return new Promise((resolve, reject) => {
      const messageId = ++this.messageId;
      
      console.log('发送Worker消息:', messageId, type, data);
      
      // 存储回调
      this.messageCallbacks.set(messageId, { resolve, reject });
      
      // 发送消息
      this.worker.postMessage({
        id: messageId,
        type: type,
        data: data
      });
      
      // 设置超时
      setTimeout(() => {
        if (this.messageCallbacks.has(messageId)) {
          this.messageCallbacks.delete(messageId);
          console.error('Worker消息超时:', type, messageId);
          reject(new Error(`Worker消息超时: ${type}`));
        }
      }, 30000); // 30秒超时
    });
  }

  // 处理Worker消息
  handleWorkerMessage(result) {
    const { id, type, data } = result;
    
    console.log('收到Worker消息:', id, type, data);
    
    // 处理Worker级别的错误
    if (type === 'worker_error') {
      console.error('Worker级别错误:', data.error);
      this.rejectAllCallbacks(data.error);
      return;
    }
    
    if (id && this.messageCallbacks.has(id)) {
      const callback = this.messageCallbacks.get(id);
      this.messageCallbacks.delete(id);
      
      if (type === 'error') {
        callback.reject(new Error(data.error));
      } else {
        callback.resolve(data);
      }
    } else {
      console.warn('未找到对应的消息回调:', id, type);
    }
  }

  // 拒绝所有回调
  rejectAllCallbacks(error) {
    for (const [id, callback] of this.messageCallbacks) {
      callback.reject(new Error(error));
    }
    this.messageCallbacks.clear();
  }

  // 执行SQL语句
  async executeSQL(sql) {
    if (!this.isInitialized) {
      throw new Error('SQL WebAssembly Worker未初始化');
    }
    
    console.log('执行SQL:', sql);
    return await this.sendMessage('execute', { sql });
  }

  // 创建示例数据
  async createSampleData() {
    if (!this.isInitialized) {
      throw new Error('SQL WebAssembly Worker未初始化');
    }
    
    console.log('创建示例数据...');
    return await this.sendMessage('createSampleData');
  }

  // 获取表结构
  async getTableSchema() {
    if (!this.isInitialized) {
      throw new Error('SQL WebAssembly Worker未初始化');
    }
    
    console.log('获取表结构...');
    return await this.sendMessage('getTableSchema');
  }

  // 检查基础库版本
  checkLibVersion() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      const libVersion = systemInfo.SDKVersion;
      
      // 解析版本号
      const versionParts = libVersion.split('.').map(Number);
      const major = versionParts[0] || 0;
      const minor = versionParts[1] || 0;
      
      // 检查是否支持WebAssembly (2.13.0+)
      if (major > 2 || (major === 2 && minor >= 13)) {
        return {
          supported: true,
          version: libVersion,
          webassembly: true,
          worker: major > 2 || (major === 2 && minor >= 15)
        };
      } else {
        return {
          supported: false,
          version: libVersion,
          webassembly: false,
          worker: false,
          required: '2.15.0+'
        };
      }
    } catch (error) {
      return {
        supported: false,
        version: 'unknown',
        webassembly: false,
        worker: false,
        error: error.message
      };
    }
  }

  // 销毁Worker
  destroy() {
    console.log('销毁SQL WebAssembly Worker...');
    
    if (this.worker) {
      this.worker.terminate();
      this.worker = null;
    }
    
    this.isInitialized = false;
    this.rejectAllCallbacks('Worker已销毁');
  }
}

module.exports = SQLWasmManager; 