// 保存学习数据到本地存储
function saveData(data) {
  localStorage.setItem('hanziLearningData', JSON.stringify(data));
}

// 从本地存储加载学习数据
function loadData() {
  const data = localStorage.getItem('hanziLearningData');
  return data ? JSON.parse(data) : initializeData();
}

// 初始化新的学习数据
function initializeData() {
  return {
    currentUnit: "unit3",
    user: {
      name: "小朋友",
      startDate: new Date().toISOString().split('T')[0]
    },
    unitProgress: {
      "unit3": {
        totalWords: 36,
        completedWords: [],
        startedAt: new Date().toISOString().split('T')[0],
        completedAt: null
      }
    },
    wordRecords: {}
  };
}

// 更新词语学习记录
function updateWordRecord(word, isCorrect, errorChars = []) {
  const data = loadData();
  
  // 如果词语记录不存在，创建新记录
  if (!data.wordRecords[word]) {
    data.wordRecords[word] = {
      attempts: 0,
      correctCount: 0,
      lastAttempt: null,
      errorChars: [],
      nextReview: null
    };
  }
  
  const record = data.wordRecords[word];
  record.attempts += 1;
  record.lastAttempt = new Date().toISOString().split('T')[0];
  
  if (isCorrect) {
    record.correctCount += 1;
    // 计算下次复习时间 (简单版本)
    const daysToAdd = calculateNextReviewDays(record);
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + daysToAdd);
    record.nextReview = nextDate.toISOString().split('T')[0];
  } else {
    record.errorChars = [...new Set([...record.errorChars, ...errorChars])];
    // 错误的词语明天复习
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    record.nextReview = tomorrow.toISOString().split('T')[0];
  }
  
  // 更新单元进度
  if (isCorrect && !data.unitProgress[data.currentUnit].completedWords.includes(word)) {
    data.unitProgress[data.currentUnit].completedWords.push(word);
  }
  
  saveData(data);
  return record;
}

// 计算下次复习间隔天数
function calculateNextReviewDays(record) {
  // 基于简化的艾宾浩斯记忆曲线
  const reviewSchedule = [1, 3, 7, 14, 30];
  const correctStreak = record.correctCount;
  const index = Math.min(correctStreak, reviewSchedule.length - 1);
  return reviewSchedule[index];
}

// 获取今日需要学习的词语
function getTodayWords(unitName, maxNewWords = 5, maxReviewWords = 5) {
  const data = loadData();
  const today = new Date().toISOString().split('T')[0];
  const result = {
    newWords: [],
    reviewWords: []
  };
  
  // 获取单元中的所有词语
  const unitWords = getUnitWords(unitName);
  
  // 找出需要复习的词语
  for (const word in data.wordRecords) {
    const record = data.wordRecords[word];
    if (record.nextReview && record.nextReview <= today) {
      result.reviewWords.push(word);
    }
  }
  
  // 按优先级排序复习词语 (错误次数多的优先)
  result.reviewWords.sort((a, b) => {
    const recordA = data.wordRecords[a];
    const recordB = data.wordRecords[b];
    return (recordA.attempts - recordA.correctCount) - (recordB.attempts - recordB.correctCount);
  });
  
  // 限制复习词语数量
  result.reviewWords = result.reviewWords.slice(0, maxReviewWords);
  
  // 找出新词语 (未学过的词语)
  const learnedWords = new Set(Object.keys(data.wordRecords));
  result.newWords = unitWords.filter(word => !learnedWords.has(word)).slice(0, maxNewWords);
  
  return result;
}

// 获取单元中的所有词语
function getUnitWords(unitName) {
  if (unitName === "unit3" && unit3Data) {
    return unit3Data.words.map(item => item.word);
  }
  return [];
} 