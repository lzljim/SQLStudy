Component({
  /**
   * 组件的属性列表
   */
  properties: {
    result: {
      type: Object,
      value: null
    },
    loading: {
      type: Boolean,
      value: false
    },
    error: {
      type: String,
      value: ''
    },
    showTable: {
      type: Boolean,
      value: true
    },
    showStats: {
      type: Boolean,
      value: true
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    resultType: '', // 'success', 'error', 'empty'
    executionTime: 0,
    rowCount: 0,
    columnCount: 0
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 格式化数据
    formatData(data) {
      if (typeof data === 'string') {
        return data
      }
      if (typeof data === 'number') {
        return data.toString()
      }
      if (typeof data === 'boolean') {
        return data ? 'true' : 'false'
      }
      if (data === null || data === undefined) {
        return 'NULL'
      }
      return JSON.stringify(data)
    },

    // 复制结果到剪贴板
    copyResult() {
      const resultText = this.generateResultText()
      wx.setClipboardData({
        data: resultText,
        success: () => {
          wx.showToast({
            title: '已复制到剪贴板',
            icon: 'success'
          })
        }
      })
    },

    // 生成结果文本
    generateResultText() {
      if (this.data.error) {
        return `错误: ${this.data.error}`
      }
      
      if (!this.data.result || !this.data.result.data) {
        return '无数据'
      }

      const { columns, data } = this.data.result
      let text = columns.join('\t') + '\n'
      data.forEach(row => {
        text += row.map(cell => this.formatData(cell)).join('\t') + '\n'
      })
      return text
    },

    // 导出为CSV
    exportCSV() {
      if (!this.data.result || !this.data.result.data) {
        wx.showToast({
          title: '无数据可导出',
          icon: 'none'
        })
        return
      }

      const { columns, data } = this.data.result
      let csv = '\ufeff' // BOM for UTF-8
      csv += columns.join(',') + '\n'
      data.forEach(row => {
        csv += row.map(cell => {
          const cellStr = this.formatData(cell)
          return `"${cellStr.replace(/"/g, '""')}"`
        }).join(',') + '\n'
      })

      // 保存文件
      const fs = wx.getFileSystemManager()
      const filePath = `${wx.env.USER_DATA_PATH}/sql_result_${Date.now()}.csv`
      
      fs.writeFile({
        filePath,
        data: csv,
        encoding: 'utf8',
        success: () => {
          wx.showModal({
            title: '导出成功',
            content: `文件已保存到: ${filePath}`,
            showCancel: false
          })
        },
        fail: (err) => {
          wx.showToast({
            title: '导出失败',
            icon: 'none'
          })
        }
      })
    },

    // 清空结果
    clearResult() {
      this.triggerEvent('clear')
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例被放入页面节点树时执行
    },

    ready() {
      // 组件在视图层布局完成后执行
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'result, error': function(result, error) {
      if (error) {
        this.setData({
          resultType: 'error'
        })
      } else if (result && result.data && result.data.length > 0) {
        this.setData({
          resultType: 'success',
          rowCount: result.data.length,
          columnCount: result.columns ? result.columns.length : 0,
          executionTime: result.executionTime || 0
        })
      } else {
        this.setData({
          resultType: 'empty',
          rowCount: 0,
          columnCount: 0,
          executionTime: result ? (result.executionTime || 0) : 0
        })
      }
    }
  }
}) 