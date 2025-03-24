// 主应用逻辑

// 全局变量
let currentWords = []; // 当前学习的词语列表
let currentWordIndex = 0; // 当前词语索引
let charEvalResult = []; // 字符评分结果

// 初始化应用
function initApp() {
    // 加载数据
    const data = loadData();
    
    // 设置当前单元
    document.getElementById('unit-select').value = data.currentUnit;
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 初始化界面
    showMode('mode-selector');
}

// 绑定事件监听器
function bindEventListeners() {
    // 单元选择器
    document.getElementById('unit-select').addEventListener('change', function() {
        const unitName = this.value;
        const data = loadData();
        data.currentUnit = unitName;
        saveData(data);
    });
    
    // 模式选择按钮
    document.getElementById('dictation-mode').addEventListener('click', function() {
        startDictationMode();
    });
    
    document.getElementById('review-mode').addEventListener('click', function() {
        startReviewMode();
    });
    
    document.getElementById('progress-mode').addEventListener('click', function() {
        startProgressMode();
    });
    
    // 听写练习按钮
    document.getElementById('play-sound').addEventListener('click', function() {
        const word = currentWords[currentWordIndex].word;
        playWordAudio(word);
    });
    
    document.getElementById('correct-button').addEventListener('click', function() {
        const word = currentWords[currentWordIndex].word;
        updateWordRecord(word, true);
        showWordResult();
    });
    
    document.getElementById('partial-button').addEventListener('click', function() {
        const word = currentWords[currentWordIndex].word;
        showCharEvaluation(word);
    });
    
    document.getElementById('wrong-button').addEventListener('click', function() {
        const word = currentWords[currentWordIndex].word;
        updateWordRecord(word, false, word.split(''));
        showWordResult();
    });
    
    document.getElementById('next-word').addEventListener('click', function() {
        currentWordIndex++;
        if (currentWordIndex < currentWords.length) {
            showCurrentWord();
        } else {
            // 学习完成，返回模式选择
            showMode('mode-selector');
            alert('听写练习完成！');
        }
    });
}

// 开始听写模式
function startDictationMode() {
    showMode('dictation-area');
    
    // 获取当前单元
    const unitName = document.getElementById('unit-select').value;
    
    // 获取今日学习词语
    const todayWords = getTodayWords(unitName, 5, 5);
    
    // 合并复习词语和新词语
    currentWords = [];
    
    // 添加复习词语
    todayWords.reviewWords.forEach(word => {
        const wordData = unit3Data.words.find(w => w.word === word);
        if (wordData) {
            currentWords.push(wordData);
        }
    });
    
    // 添加新词语
    todayWords.newWords.forEach(word => {
        const wordData = unit3Data.words.find(w => w.word === word);
        if (wordData) {
            currentWords.push(wordData);
        }
    });
    
    // 如果没有词语需要学习，使用单元中的前10个词语
    if (currentWords.length === 0) {
        currentWords = unit3Data.words.slice(0, 10);
    }
    
    // 初始化听写界面
    initDictationUI(currentWords);
}

// 开始复习模式
function startReviewMode() {
    showMode('review-area');
    updateReviewUI();
}

// 开始进度模式
function startProgressMode() {
    showMode('progress-area');
    updateProgressUI();
}

// 初始化单元数据
function initializeUnitData() {
    const data = loadData();
    const unitName = data.currentUnit;
    
    // 如果单元进度不存在，初始化它
    if (!data.unitProgress[unitName]) {
        data.unitProgress[unitName] = {
            totalWords: unit3Data.words.length,
            completedWords: [],
            startedAt: new Date().toISOString().split('T')[0],
            completedAt: null
        };
        saveData(data);
    }
}

// 当页面加载完成时初始化应用
window.addEventListener('DOMContentLoaded', function() {
    initApp();
    initializeUnitData();
}); 