Component({
  /**
   * 组件的属性列表
   */
  properties: {
    value: {
      type: String,
      value: ''
    },
    placeholder: {
      type: String,
      value: '请输入SQL语句...'
    },
    readonly: {
      type: Boolean,
      value: false
    },
    theme: {
      type: String,
      value: 'light'
    },
    height: {
      type: String,
      value: '400rpx'
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    sqlText: '',
    lineNumbers: [],
    currentLine: 1,
    currentColumn: 1
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 输入事件处理
    onInput(e) {
      const value = e.detail.value
      this.setData({
        sqlText: value,
        lineNumbers: this.generateLineNumbers(value)
      })
      
      // 触发input事件
      this.triggerEvent('input', { value })
    },

    // 生成行号
    generateLineNumbers(text) {
      const lines = text.split('\n')
      return Array.from({ length: lines.length }, (_, i) => i + 1)
    },

    // 格式化SQL
    formatSQL() {
      // TODO: 实现SQL格式化功能
      console.log('格式化SQL')
      this.triggerEvent('format')
    },

    // 清空内容
    clearContent() {
      this.setData({
        sqlText: '',
        lineNumbers: [1]
      })
      this.triggerEvent('input', { value: '' })
    },

    // 插入模板
    insertTemplate(template) {
      const currentText = this.data.sqlText
      const newText = currentText + '\n' + template
      this.setData({
        sqlText: newText,
        lineNumbers: this.generateLineNumbers(newText)
      })
      this.triggerEvent('input', { value: newText })
    },

    // 获取光标位置
    onCursorPosition(e) {
      const { line, column } = e.detail
      this.setData({
        currentLine: line,
        currentColumn: column
      })
    },

    // 执行SQL
    executeSQL() {
      const sql = this.data.sqlText.trim()
      if (!sql) {
        wx.showToast({
          title: '请输入SQL语句',
          icon: 'none'
        })
        return
      }
      
      this.triggerEvent('execute', { sql })
    }
  },

  /**
   * 组件生命周期
   */
  lifetimes: {
    attached() {
      // 组件实例被放入页面节点树时执行
      this.setData({
        sqlText: this.properties.value,
        lineNumbers: this.generateLineNumbers(this.properties.value)
      })
    },

    ready() {
      // 组件在视图层布局完成后执行
    }
  },

  /**
   * 组件所在页面的生命周期
   */
  pageLifetimes: {
    show() {
      // 页面被展示时执行
    },
    hide() {
      // 页面被隐藏时执行
    }
  }
}) 