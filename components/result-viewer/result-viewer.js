Component({
  /**
   * 组件的属性列表
   */
  properties: {
    result: {
      type: Object,
      value: null,
      observer: function(newVal, oldVal) {
        this.handleResultChange(newVal, oldVal)
      }
    },
    loading: {
      type: Boolean,
      value: false
    },
    error: {
      type: String,
      value: '',
      observer: function(newVal, oldVal) {
        this.handleErrorChange(newVal, oldVal)
      }
    },
    showTable: {
      type: Boolean,
      value: true
    },
    showStats: {
      type: Boolean,
      value: true
    },
    maxRows: {
      type: Number,
      value: 100
    },
    maxColumns: {
      type: Number,
      value: 10
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    // 结果状态
    resultType: '', // 'success', 'error', 'empty', 'loading'
    executionTime: 0,
    rowCount: 0,
    columnCount: 0,
    affectedRows: 0,
    
    // 表格数据
    tableData: {
      columns: [],
      data: [],
      truncated: false,
      truncatedRows: 0,
      truncatedColumns: 0
    },
    
    // 显示状态
    showFullData: false,
    showColumnDetails: false,
    
    // 错误信息
    errorDetails: null
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 处理结果变化
     */
    handleResultChange(newResult, oldResult) {
      if (newResult === oldResult) return
      
      try {
        if (newResult && newResult.data) {
          this.processResultData(newResult)
        } else {
          this.setData({
            resultType: 'empty',
            tableData: { columns: [], data: [], truncated: false }
          })
        }
      } catch (error) {
        console.error('处理结果数据失败:', error)
        this.setData({
          resultType: 'error',
          errorDetails: error.message
        })
      }
    },

    /**
     * 处理错误变化
     */
    handleErrorChange(newError, oldError) {
      if (newError === oldError) return
      
      if (newError) {
        this.setData({
          resultType: 'error',
          errorDetails: newError
        })
      }
    },

    /**
     * 处理结果数据
     */
    processResultData(result) {
      try {
        const { columns = [], data = [], executionTime = 0, affectedRows = 0 } = result
        const { maxRows, maxColumns } = this.properties
        
        // 处理列数据
        const processedColumns = this.processColumns(columns, maxColumns)
        
        // 处理行数据
        const processedData = this.processData(data, maxRows)
        
        // 检查是否被截断
        const truncated = {
          rows: data.length > maxRows,
          columns: columns.length > maxColumns
        }
        
        this.setData({
          resultType: 'success',
          executionTime,
          affectedRows,
          rowCount: data.length,
          columnCount: columns.length,
          tableData: {
            columns: processedColumns,
            data: processedData,
            truncated: truncated.rows || truncated.columns,
            truncatedRows: truncated.rows ? data.length - maxRows : 0,
            truncatedColumns: truncated.columns ? columns.length - maxColumns : 0
          }
        })
      } catch (error) {
        console.error('处理结果数据失败:', error)
        throw error
      }
    },

    /**
     * 处理列数据
     */
    processColumns(columns, maxColumns) {
      try {
        if (!Array.isArray(columns)) {
          return []
        }
        
        return columns.slice(0, maxColumns).map((column, index) => ({
          name: column,
          index,
          type: this.inferColumnType(column)
        }))
      } catch (error) {
        console.error('处理列数据失败:', error)
        return []
      }
    },

    /**
     * 处理行数据
     */
    processData(data, maxRows) {
      try {
        if (!Array.isArray(data)) {
          return []
        }
        
        return data.slice(0, maxRows).map((row, rowIndex) => {
          if (!Array.isArray(row)) {
            return [this.formatData(row)]
          }
          
          return row.map((cell, cellIndex) => ({
            value: this.formatData(cell),
            type: this.inferDataType(cell),
            rowIndex,
            cellIndex
          }))
        })
      } catch (error) {
        console.error('处理行数据失败:', error)
        return []
      }
    },

    /**
     * 推断列类型
     */
    inferColumnType(columnName) {
      const name = columnName.toLowerCase()
      
      if (name.includes('id')) return 'id'
      if (name.includes('name')) return 'text'
      if (name.includes('email')) return 'email'
      if (name.includes('date') || name.includes('time')) return 'datetime'
      if (name.includes('price') || name.includes('amount') || name.includes('cost')) return 'currency'
      if (name.includes('count') || name.includes('total') || name.includes('num')) return 'number'
      
      return 'text'
    },

    /**
     * 推断数据类型
     */
    inferDataType(value) {
      if (value === null || value === undefined) return 'null'
      if (typeof value === 'number') return 'number'
      if (typeof value === 'boolean') return 'boolean'
      if (typeof value === 'string') {
        if (this.isDateString(value)) return 'datetime'
        if (this.isEmail(value)) return 'email'
        if (this.isUrl(value)) return 'url'
        return 'text'
      }
      
      return 'text'
    },

    /**
     * 检查是否为日期字符串
     */
    isDateString(value) {
      if (typeof value !== 'string') return false
      
      const datePatterns = [
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/,
        /^\d{2}\/\d{2}\/\d{4}$/
      ]
      
      return datePatterns.some(pattern => pattern.test(value))
    },

    /**
     * 检查是否为邮箱
     */
    isEmail(value) {
      if (typeof value !== 'string') return false
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      return emailPattern.test(value)
    },

    /**
     * 检查是否为URL
     */
    isUrl(value) {
      if (typeof value !== 'string') return false
      try {
        new URL(value)
        return true
      } catch {
        return false
      }
    },

    /**
     * 格式化数据
     */
    formatData(data) {
      try {
        if (data === null || data === undefined) return 'NULL'
        if (typeof data === 'string') return data
        if (typeof data === 'number') {
          // 处理小数位数
          if (Number.isInteger(data)) return data.toString()
          return data.toFixed(2)
        }
        if (typeof data === 'boolean') return data ? 'true' : 'false'
        if (data instanceof Date) return data.toLocaleString()
        
        return JSON.stringify(data)
      } catch (error) {
        console.error('格式化数据失败:', error)
        return String(data)
      }
    },

    /**
     * 复制结果到剪贴板
     */
    copyResult() {
      try {
        const resultText = this.generateResultText()
        
        if (!resultText) {
          this.showToast('没有可复制的数据', 'error')
          return
        }
        
        wx.setClipboardData({
          data: resultText,
          success: () => {
            this.showToast('已复制到剪贴板', 'success')
          },
          fail: (error) => {
            console.error('复制失败:', error)
            this.showToast('复制失败', 'error')
          }
        })
      } catch (error) {
        console.error('复制结果失败:', error)
        this.showToast('复制失败', 'error')
      }
    },

    /**
     * 生成结果文本
     */
    generateResultText() {
      try {
        const { resultType, tableData, errorDetails } = this.data
        
        if (resultType === 'error') {
          return `错误: ${errorDetails}`
        }
        
        if (resultType === 'empty') {
          return '无数据'
        }
        
        if (resultType === 'success' && tableData.columns.length > 0) {
          const { columns, data } = tableData
          
          // 生成CSV格式
          let text = columns.map(col => col.name).join(',') + '\n'
          
          data.forEach(row => {
            if (Array.isArray(row)) {
              text += row.map(cell => {
                const value = typeof cell === 'object' ? cell.value : cell
                return `"${String(value).replace(/"/g, '""')}"`
              }).join(',') + '\n'
            }
          })
          
          return text
        }
        
        return '无数据'
      } catch (error) {
        console.error('生成结果文本失败:', error)
        return '生成失败'
      }
    },

    /**
     * 导出为CSV
     */
    exportCSV() {
      try {
        const { resultType, tableData } = this.data
        
        if (resultType !== 'success' || !tableData.data.length) {
          this.showToast('没有可导出的数据', 'error')
          return
        }
        
        const csv = this.generateCSV()
        const fileName = `sql_result_${Date.now()}.csv`
        
        this.saveFile(fileName, csv)
      } catch (error) {
        console.error('导出CSV失败:', error)
        this.showToast('导出失败', 'error')
      }
    },

    /**
     * 生成CSV内容
     */
    generateCSV() {
      try {
        const { columns, data } = this.data.tableData
        
        // 添加BOM以支持中文
        let csv = '\ufeff'
        
        // 添加列头
        csv += columns.map(col => col.name).join(',') + '\n'
        
        // 添加数据行
        data.forEach(row => {
          if (Array.isArray(row)) {
            csv += row.map(cell => {
              const value = typeof cell === 'object' ? cell.value : cell
              const cellStr = String(value).replace(/"/g, '""')
              return `"${cellStr}"`
            }).join(',') + '\n'
          }
        })
        
        return csv
      } catch (error) {
        console.error('生成CSV失败:', error)
        throw error
      }
    },

    /**
     * 保存文件
     */
    saveFile(fileName, content) {
      try {
        const fs = wx.getFileSystemManager()
        const filePath = `${wx.env.USER_DATA_PATH}/${fileName}`
        
        fs.writeFile({
          filePath,
          data: content,
          encoding: 'utf8',
          success: () => {
            wx.showModal({
              title: '导出成功',
              content: `文件已保存到: ${fileName}`,
              showCancel: false,
              confirmText: '确定'
            })
          },
          fail: (error) => {
            console.error('保存文件失败:', error)
            this.showToast('保存失败', 'error')
          }
        })
      } catch (error) {
        console.error('保存文件失败:', error)
        this.showToast('保存失败', 'error')
      }
    },

    /**
     * 清空结果
     */
    clearResult() {
      try {
        this.triggerEvent('clear')
        this.setData({
          resultType: '',
          tableData: { columns: [], data: [], truncated: false },
          errorDetails: null
        })
      } catch (error) {
        console.error('清空结果失败:', error)
      }
    },

    /**
     * 显示完整数据
     */
    toggleFullData() {
      this.setData({
        showFullData: !this.data.showFullData
      })
    },

    /**
     * 显示列详情
     */
    toggleColumnDetails() {
      this.setData({
        showColumnDetails: !this.data.showColumnDetails
      })
    },

    /**
     * 显示提示
     */
    showToast(title, icon = 'none') {
      wx.showToast({
        title,
        icon,
        duration: 2000
      })
    },

    /**
     * 单元格点击事件
     */
    onCellTap(e) {
      try {
        const { rowIndex, cellIndex, value } = e.currentTarget.dataset
        
        // 可以在这里添加单元格点击处理逻辑
        console.log('单元格点击:', { rowIndex, cellIndex, value })
        
        // 复制单元格内容
        wx.setClipboardData({
          data: value,
          success: () => {
            this.showToast('已复制单元格内容', 'success')
          }
        })
      } catch (error) {
        console.error('单元格点击处理失败:', error)
      }
    },

    /**
     * 列头点击事件
     */
    onColumnTap(e) {
      try {
        const { column } = e.currentTarget.dataset
        
        // 可以在这里添加列头点击处理逻辑
        console.log('列头点击:', column)
        
        // 复制列名
        wx.setClipboardData({
          data: column.name,
          success: () => {
            this.showToast('已复制列名', 'success')
          }
        })
      } catch (error) {
        console.error('列头点击处理失败:', error)
      }
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    created() {
      console.log('结果查看器组件创建')
    },

    attached() {
      console.log('结果查看器组件挂载')
    },

    ready() {
      console.log('结果查看器组件就绪')
    },

    moved() {
      console.log('结果查看器组件移动')
    },

    detached() {
      console.log('结果查看器组件卸载')
    }
  },

  /**
   * 数据监听器
   */
  observers: {
    'loading': function(loading) {
      if (loading) {
        this.setData({ resultType: 'loading' })
      }
    }
  }
}) 