// pages/practice/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // 题目分类
    categories: [
      { id: 'all', name: '全部', count: 0 },
      { id: 'basic', name: '基础查询', count: 0 },
      { id: 'advanced', name: '高级查询', count: 0 },
      { id: 'join', name: '关联查询', count: 0 },
      { id: 'aggregate', name: '聚合函数', count: 0 }
    ],
    
    // 当前选中的分类
    currentCategory: 'all',
    
    // 题目列表
    questions: [],
    
    // 当前题目
    currentQuestion: null,
    
    // 用户答案
    userAnswer: '',
    
    // 答题结果
    answerResult: null,
    
    // 显示答案
    showAnswer: false,
    
    // 用户进度
    userProgress: {
      total: 0,
      completed: 0,
      correct: 0
    },
    
    // 页面状态
    pageState: 'list', // 'list', 'detail', 'result'
    
    // 加载状态
    loading: false,

    // 练习题分类
    practiceCategories: ['全部', '高级', '其他'],
    selectedCategory: '全部',
    allPracticeList: [
      { id: 1, title: '基础题1', category: '全部' },
      { id: 2, title: '高级题1', category: '高级' },
      { id: 3, title: '其他题1', category: '其他' },
      // ... 其他题目 ...
    ],
    practiceList: [],
    currentPractice: '',
    sqlText: '',
    result: null,
    error: '',
    resultType: '',
    executionTime: 0,
    rowCount: 0,
    columnCount: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 页面加载时执行
    this.loadQuestions()
    this.loadUserProgress()
    this.setData({
      practiceList: this.data.allPracticeList.map(q => q.title),
      currentPractice: this.data.allPracticeList.length > 0 ? this.data.allPracticeList[0].title : ''
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时执行
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: 'SQL练习题 - 提升数据库技能',
      path: '/pages/practice/index'
    }
  },

  // 加载题目数据
  loadQuestions() {
    this.setData({ loading: true })
    
    // 模拟题目数据
    const mockQuestions = [
      {
        id: 'q1',
        title: '查询所有用户信息',
        description: '编写SQL语句查询users表中的所有用户信息',
        difficulty: 1,
        category: 'basic',
        sql: 'SELECT * FROM users;',
        explanation: '使用SELECT *可以查询表中的所有列，FROM指定要查询的表名',
        hints: ['使用SELECT语句', '查询users表', '使用*表示所有列'],
        completed: false,
        correct: false
      },
      {
        id: 'q2',
        title: '查询年龄大于25的用户',
        description: '查询users表中年龄大于25岁的用户姓名和年龄',
        difficulty: 1,
        category: 'basic',
        sql: 'SELECT name, age FROM users WHERE age > 25;',
        explanation: '使用WHERE子句添加条件过滤，>表示大于',
        hints: ['使用WHERE条件', '使用>比较运算符', '只查询name和age列'],
        completed: false,
        correct: false
      },
      {
        id: 'q3',
        title: '统计用户总数',
        description: '统计users表中的用户总数',
        difficulty: 2,
        category: 'aggregate',
        sql: 'SELECT COUNT(*) as total FROM users;',
        explanation: 'COUNT(*)函数用于统计行数，as用于给结果列起别名',
        hints: ['使用COUNT函数', '使用as别名', '统计所有行'],
        completed: false,
        correct: false
      },
      {
        id: 'q4',
        title: '关联查询用户订单',
        description: '查询用户姓名和对应的订单信息',
        difficulty: 3,
        category: 'join',
        sql: 'SELECT u.name, o.product_name FROM users u JOIN orders o ON u.id = o.user_id;',
        explanation: '使用JOIN进行表关联，ON指定关联条件',
        hints: ['使用JOIN关联', '使用表别名', '指定关联条件'],
        completed: false,
        correct: false
      }
    ]
    
    // 更新分类统计
    const categories = this.data.categories.map(cat => {
      const count = cat.id === 'all' 
        ? mockQuestions.length 
        : mockQuestions.filter(q => q.category === cat.id).length
      return { ...cat, count }
    })
    
    this.setData({
      questions: mockQuestions,
      categories,
      loading: false
    })
  },

  // 加载用户进度
  loadUserProgress() {
    const progress = wx.getStorageSync('userProgress') || {
      total: 0,
      completed: 0,
      correct: 0
    }
    
    this.setData({
      userProgress: progress
    })
  },

  // 切换分类
  switchCategory(e) {
    const { category } = e.currentTarget.dataset
    this.setData({
      currentCategory: category
    })
  },

  // 获取当前分类的题目
  getCurrentQuestions() {
    if (this.data.currentCategory === 'all') {
      return this.data.questions
    }
    return this.data.questions.filter(q => q.category === this.data.currentCategory)
  },

  // 查看题目详情
  viewQuestion(e) {
    const { id } = e.currentTarget.dataset
    const question = this.data.questions.find(q => q.id === id)
    
    this.setData({
      currentQuestion: question,
      userAnswer: '',
      answerResult: null,
      showAnswer: false,
      pageState: 'detail'
    })
  },

  // 返回题目列表
  backToList() {
    this.setData({
      pageState: 'list',
      currentQuestion: null,
      userAnswer: '',
      answerResult: null,
      showAnswer: false
    })
  },

  // 用户答案输入
  onAnswerInput(e) {
    this.setData({
      userAnswer: e.detail.value
    })
  },

  // 提交答案
  submitAnswer() {
    const { currentQuestion, userAnswer } = this.data
    
    if (!userAnswer.trim()) {
      wx.showToast({
        title: '请输入答案',
        icon: 'none'
      })
      return
    }

    // 简单的答案验证（实际应该使用SQL解析器）
    const isCorrect = this.validateAnswer(userAnswer.trim(), currentQuestion.sql)
    
    const result = {
      correct: isCorrect,
      message: isCorrect ? '回答正确！' : '答案不正确，请重试',
      expected: currentQuestion.sql
    }
    
    this.setData({
      answerResult: result,
      pageState: 'result'
    })
    
    // 更新进度
    this.updateProgress(currentQuestion.id, isCorrect)
  },

  // 验证答案
  validateAnswer(userAnswer, correctAnswer) {
    // 简单的字符串比较，实际应该使用SQL解析器
    const normalize = (sql) => {
      return sql.toLowerCase()
        .replace(/\s+/g, ' ')
        .replace(/;/g, '')
        .trim()
    }
    
    return normalize(userAnswer) === normalize(correctAnswer)
  },

  // 更新进度
  updateProgress(questionId, isCorrect) {
    const questions = this.data.questions.map(q => {
      if (q.id === questionId) {
        return { ...q, completed: true, correct: isCorrect }
      }
      return q
    })
    
    const progress = {
      total: questions.length,
      completed: questions.filter(q => q.completed).length,
      correct: questions.filter(q => q.correct).length
    }
    
    this.setData({
      questions,
      userProgress: progress
    })
    
    // 保存到本地存储
    wx.setStorageSync('userProgress', progress)
  },

  // 查看答案
  showAnswer() {
    this.setData({
      showAnswer: true
    })
  },

  // 下一题
  nextQuestion() {
    const currentQuestions = this.getCurrentQuestions()
    const currentIndex = currentQuestions.findIndex(q => q.id === this.data.currentQuestion.id)
    const nextIndex = (currentIndex + 1) % currentQuestions.length
    const nextQuestion = currentQuestions[nextIndex]
    
    this.setData({
      currentQuestion: nextQuestion,
      userAnswer: '',
      answerResult: null,
      showAnswer: false,
      pageState: 'detail'
    })
  },

  // 重试
  retry() {
    this.setData({
      userAnswer: '',
      answerResult: null,
      showAnswer: false,
      pageState: 'detail'
    })
  },

  // 分类选择事件
  onCategoryChange(e) {
    const idx = e.detail.value;
    const selectedCategory = this.data.practiceCategories[idx];
    // 根据分类筛选题目
    let filtered = this.data.allPracticeList.filter(q => selectedCategory === '全部' || q.category === selectedCategory);
    this.setData({
      selectedCategory,
      practiceList: filtered.map(q => q.title),
      currentPractice: filtered.length > 0 ? filtered[0].title : ''
    });
  },

  // 题目选择事件
  onPracticeChange(e) {
    const idx = e.detail.value;
    this.setData({ currentPractice: this.data.practiceList[idx] });
  },

  // SQL输入事件，实时更新sqlText
  onSqlInput(e) {
    this.setData({ sqlText: e.detail.value });
  },

  // 执行SQL，模拟执行并返回结果
  onExecute() {
    const sql = this.data.sqlText.trim();
    if (!sql) {
      wx.showToast({ title: '请输入SQL语句', icon: 'none' });
      return;
    }
    // 这里模拟SQL执行，实际可调用SQL.js等
    let result = null;
    let error = '';
    try {
      // 简单模拟：只要有select就返回假数据
      if (sql.toLowerCase().includes('select')) {
        result = {
          columns: ['id', 'name'],
          data: [
            [1, '张三'],
            [2, '李四']
          ],
          executionTime: 20
        };
      } else {
        error = '仅支持SELECT语句';
      }
    } catch (err) {
      error = 'SQL执行出错: ' + err.message;
    }
    // 控制台打印结果，便于调试
    console.log('SQL执行结果:', result);
    if (error) {
      console.error('SQL执行错误:', error);
    }
    // 设置结果和错误信息
    this.setData({
      result,
      error,
      resultType: error ? 'error' : (result && result.data && result.data.length > 0 ? 'success' : 'empty'),
      executionTime: result ? result.executionTime : 0,
      rowCount: result ? result.data.length : 0,
      columnCount: result ? result.columns.length : 0
    });
  }
})