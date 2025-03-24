// 示例数据结构
const characterData = {
  "火": {
    pinyin: "huǒ",
    relatedWords: ["火苗", "大火", "火山", "火车", "火柴"]
  },
  "柴": {
    pinyin: "chái",
    relatedWords: ["柴火", "砍柴", "柴油", "柴堆", "火柴"]
  },
  // 更多汉字...
};

const wordData = {
  "火柴": {
    pinyin: "huǒ chái",
    characters: ["火", "柴"],
    sentences: ["小明用火柴点燃了蜡烛。"]
  },
  // 更多词语...
};

// 学习记录数据结构
const learningData = {
  // 当前学习单元
  currentUnit: "unit3",
  
  // 用户信息
  user: {
    name: "小朋友",
    startDate: "2023-05-15"
  },
  
  // 单元进度
  unitProgress: {
    "unit3": {
      totalWords: 36,
      completedWords: ["火柴", "旧围裙"],
      startedAt: "2023-05-15",
      completedAt: null
    }
  },
  
  // 词语学习记录
  wordRecords: {
    "火柴": {
      attempts: 3,
      correctCount: 2,
      lastAttempt: "2023-05-15",
      errorChars: ["柴"],
      nextReview: "2023-05-16"
    },
    "旧围裙": {
      attempts: 1,
      correctCount: 1,
      lastAttempt: "2023-05-15",
      errorChars: [],
      nextReview: "2023-05-18"
    }
  }
};