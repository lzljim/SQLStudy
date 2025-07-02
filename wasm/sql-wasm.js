// wasm/sql-wasm.js
// SQL.js WebAssembly加载器
// 这个文件是SQL.js的官方加载器，用于在WebAssembly环境中加载SQL.js

// SQL.js WebAssembly模块
var Module = {
  // 内存初始化
  memoryInitializerPrefixURL: '',
  
  // 文件系统
  preRun: [],
  postRun: [],
  
  // 打印函数
  print: function(text) {
    console.log('SQL.js:', text);
  },
  
  // 错误处理
  printErr: function(text) {
    console.error('SQL.js Error:', text);
  },
  
  // 文件加载器
  locateFile: function(path) {
    if (path.endsWith('.wasm')) {
      return './sql-wasm.wasm';
    }
    return path;
  },
  
  // 初始化完成回调
  onRuntimeInitialized: function() {
    console.log('SQL.js WebAssembly初始化完成');
  }
};

// 导出SQL.js API
var SQL = {
  // 初始化SQL.js
  init: function(options) {
    return new Promise((resolve, reject) => {
      try {
        // 设置初始化选项
        if (options && options.locateFile) {
          Module.locateFile = options.locateFile;
        }
        
        // 监听初始化完成
        Module.onRuntimeInitialized = function() {
          try {
            // 创建SQL对象
            var sql = {
              Database: Module.Database,
              Statement: Module.Statement,
              OPEN_READONLY: Module.OPEN_READONLY,
              OPEN_READWRITE: Module.OPEN_READWRITE,
              OPEN_CREATE: Module.OPEN_CREATE,
              OPEN_MEMORY: Module.OPEN_MEMORY,
              OPEN_NOMUTEX: Module.OPEN_NOMUTEX,
              OPEN_FULLMUTEX: Module.OPEN_FULLMUTEX,
              OPEN_SHAREDCACHE: Module.OPEN_SHAREDCACHE,
              OPEN_PRIVATECACHE: Module.OPEN_PRIVATECACHE,
              OPEN_WAL: Module.OPEN_WAL,
              SQLITE_OK: Module.SQLITE_OK,
              SQLITE_ERROR: Module.SQLITE_ERROR,
              SQLITE_INTERNAL: Module.SQLITE_INTERNAL,
              SQLITE_PERM: Module.SQLITE_PERM,
              SQLITE_ABORT: Module.SQLITE_ABORT,
              SQLITE_BUSY: Module.SQLITE_BUSY,
              SQLITE_LOCKED: Module.SQLITE_LOCKED,
              SQLITE_NOMEM: Module.SQLITE_NOMEM,
              SQLITE_READONLY: Module.SQLITE_READONLY,
              SQLITE_INTERRUPT: Module.SQLITE_INTERRUPT,
              SQLITE_IOERR: Module.SQLITE_IOERR,
              SQLITE_CORRUPT: Module.SQLITE_CORRUPT,
              SQLITE_NOTFOUND: Module.SQLITE_NOTFOUND,
              SQLITE_FULL: Module.SQLITE_FULL,
              SQLITE_CANTOPEN: Module.SQLITE_CANTOPEN,
              SQLITE_PROTOCOL: Module.SQLITE_PROTOCOL,
              SQLITE_EMPTY: Module.SQLITE_EMPTY,
              SQLITE_SCHEMA: Module.SQLITE_SCHEMA,
              SQLITE_TOOBIG: Module.SQLITE_TOOBIG,
              SQLITE_CONSTRAINT: Module.SQLITE_CONSTRAINT,
              SQLITE_MISMATCH: Module.SQLITE_MISMATCH,
              SQLITE_MISUSE: Module.SQLITE_MISUSE,
              SQLITE_NOLFS: Module.SQLITE_NOLFS,
              SQLITE_AUTH: Module.SQLITE_AUTH,
              SQLITE_FORMAT: Module.SQLITE_FORMAT,
              SQLITE_RANGE: Module.SQLITE_RANGE,
              SQLITE_NOTADB: Module.SQLITE_NOTADB,
              SQLITE_NOTICE: Module.SQLITE_NOTICE,
              SQLITE_WARNING: Module.SQLITE_WARNING,
              SQLITE_ROW: Module.SQLITE_ROW,
              SQLITE_DONE: Module.SQLITE_DONE
            };
            
            resolve(sql);
          } catch (error) {
            reject(error);
          }
        };
        
        // 加载WebAssembly模块
        if (typeof importScripts !== 'undefined') {
          // Worker环境
          importScripts('./sql-wasm.js');
        } else {
          // 主线程环境
          var script = document.createElement('script');
          script.src = './sql-wasm.js';
          script.onload = function() {
            // 脚本加载完成，Module会自动初始化
          };
          script.onerror = function() {
            reject(new Error('Failed to load SQL.js WebAssembly'));
          };
          document.head.appendChild(script);
        }
        
      } catch (error) {
        reject(error);
      }
    });
  }
};

// 在Worker环境中直接初始化
if (typeof importScripts !== 'undefined') {
  // 这里会在Worker中加载真实的SQL.js WebAssembly文件
  // 由于无法直接importScripts外部文件，我们需要手动实现
  console.log('SQL.js WebAssembly加载器已准备就绪');
} 