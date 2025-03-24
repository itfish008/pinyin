// UI 交互相关函数

// 显示指定的学习模式区域，隐藏其他区域
function showMode(modeId) {
    const modes = ['mode-selector', 'dictation-area', 'review-area', 'progress-area'];
    modes.forEach(mode => {
        document.getElementById(mode).style.display = mode === modeId ? 'block' : 'none';
    });
}

// 初始化听写练习界面
function initDictationUI(words) {
    const totalWordsElement = document.getElementById('total-words');
    totalWordsElement.textContent = words.length;
    
    // 重置当前词语索引
    currentWordIndex = 0;
    
    // 显示第一个词语
    showCurrentWord();
}

// 显示当前词语
function showCurrentWord() {
    const currentWordIndexElement = document.getElementById('current-word-index');
    currentWordIndexElement.textContent = currentWordIndex + 1;
    
    const currentWord = currentWords[currentWordIndex];
    
    const pinyinElement = document.getElementById('current-pinyin');
    pinyinElement.textContent = currentWord.pinyin;
    
    const wordElement = document.getElementById('current-word');
    wordElement.textContent = currentWord.word;
    wordElement.style.visibility = 'hidden';
    
    // 重置评分区域
    document.getElementById('word-result').style.display = 'none';
    document.getElementById('char-eval').style.display = 'none';
}

// 显示字符评分界面
function showCharEvaluation(word) {
    const charEvalDiv = document.getElementById('char-eval');
    charEvalDiv.style.display = 'block';
    
    const charButtonsDiv = document.getElementById('char-buttons');
    charButtonsDiv.innerHTML = '';
    
    // 为每个字符创建评分按钮
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        
        const charDiv = document.createElement('div');
        charDiv.className = 'char-button';
        
        const charDisplay = document.createElement('div');
        charDisplay.className = 'char-display';
        charDisplay.textContent = char;
        
        const charEvalButtons = document.createElement('div');
        charEvalButtons.className = 'char-eval-buttons';
        
        const correctButton = document.createElement('button');
        correctButton.className = 'char-eval-button correct';
        correctButton.textContent = '✓';
        correctButton.onclick = function() {
            charEvalResult[i] = true;
            this.style.opacity = '1';
            wrongButton.style.opacity = '0.5';
            checkAllCharsEvaluated();
        };
        
        const wrongButton = document.createElement('button');
        wrongButton.className = 'char-eval-button wrong';
        wrongButton.textContent = '✗';
        wrongButton.onclick = function() {
            charEvalResult[i] = false;
            this.style.opacity = '1';
            correctButton.style.opacity = '0.5';
            checkAllCharsEvaluated();
        };
        
        charEvalButtons.appendChild(correctButton);
        charEvalButtons.appendChild(wrongButton);
        
        charDiv.appendChild(charDisplay);
        charDiv.appendChild(charEvalButtons);
        
        charButtonsDiv.appendChild(charDiv);
    }
    
    // 初始化字符评分结果数组
    charEvalResult = new Array(word.length).fill(null);
}

// 检查是否所有字符都已评分
function checkAllCharsEvaluated() {
    const allEvaluated = charEvalResult.every(result => result !== null);
    if (allEvaluated) {
        const word = currentWords[currentWordIndex].word;
        const errorChars = [];
        
        for (let i = 0; i < word.length; i++) {
            if (!charEvalResult[i]) {
                errorChars.push(word[i]);
            }
        }
        
        // 计算是否全部正确
        const isAllCorrect = errorChars.length === 0;
        
        // 更新学习记录
        updateWordRecord(word, isAllCorrect, errorChars);
        
        // 显示结果
        showWordResult();
    }
}

// 显示词语结果和扩展词
function showWordResult() {
    const wordResultDiv = document.getElementById('word-result');
    wordResultDiv.style.display = 'block';
    
    const charEvalDiv = document.getElementById('char-eval');
    charEvalDiv.style.display = 'none';
    
    const wordElement = document.getElementById('current-word');
    wordElement.style.visibility = 'visible';
    
    const resultWordElement = document.getElementById('result-word');
    resultWordElement.textContent = currentWords[currentWordIndex].word;
    
    // 显示相关词语
    const currentWord = currentWords[currentWordIndex];
    const relatedWords = currentWord.relatedWords;
    
    let index = 1;
    for (const char in relatedWords) {
        const relatedWordsElement = document.getElementById(`related-words-${index}`);
        if (relatedWordsElement) {
            relatedWordsElement.innerHTML = '';
            
            const relatedWordsList = relatedWords[char];
            relatedWordsList.forEach(word => {
                const wordSpan = document.createElement('span');
                wordSpan.className = 'related-word';
                wordSpan.textContent = word;
                relatedWordsElement.appendChild(wordSpan);
            });
            
            // 更新标题
            const heading = relatedWordsElement.previousElementSibling;
            if (heading) {
                heading.textContent = `${char}:`;
            }
        }
        index++;
    }
}

// 更新进度界面
function updateProgressUI() {
    const data = loadData();
    const currentUnit = data.currentUnit;
    const unitProgress = data.unitProgress[currentUnit];
    
    // 更新统计数据
    document.getElementById('learned-count').textContent = Object.keys(data.wordRecords).length;
    
    // 计算掌握的词语数量（正确率 >= 80%）
    let masteredCount = 0;
    for (const word in data.wordRecords) {
        const record = data.wordRecords[word];
        if (record.attempts > 0 && (record.correctCount / record.attempts) >= 0.8) {
            masteredCount++;
        }
    }
    document.getElementById('mastered-count').textContent = masteredCount;
    
    // 计算需要复习的词语
    const today = new Date().toISOString().split('T')[0];
    let reviewCount = 0;
    for (const word in data.wordRecords) {
        const record = data.wordRecords[word];
        if (record.nextReview && record.nextReview <= today) {
            reviewCount++;
        }
    }
    document.getElementById('review-count').textContent = reviewCount;
    
    // 更新进度条
    const progressPercentage = unitProgress.totalWords > 0 
        ? Math.round((unitProgress.completedWords.length / unitProgress.totalWords) * 100) 
        : 0;
    document.getElementById('unit-progress-bar').style.width = `${progressPercentage}%`;
    document.getElementById('progress-percentage').textContent = `${progressPercentage}%`;
    
    // 更新困难词语列表
    const difficultWordsList = document.getElementById('difficult-words-list');
    difficultWordsList.innerHTML = '';
    
    // 获取错误率最高的5个词语
    const difficultWords = Object.entries(data.wordRecords)
        .filter(([_, record]) => record.attempts >= 2)
        .sort(([_, recordA], [__, recordB]) => {
            const errorRateA = 1 - (recordA.correctCount / recordA.attempts);
            const errorRateB = 1 - (recordB.correctCount / recordB.attempts);
            return errorRateB - errorRateA;
        })
        .slice(0, 5);
    
    difficultWords.forEach(([word, record]) => {
        const errorRate = 1 - (record.correctCount / record.attempts);
        const li = document.createElement('li');
        li.innerHTML = `
            <span>${word}</span>
            <span>错误率: ${Math.round(errorRate * 100)}%</span>
        `;
        difficultWordsList.appendChild(li);
    });
}

// 更新复习界面
function updateReviewUI() {
    const reviewWordsDiv = document.getElementById('review-words');
    reviewWordsDiv.innerHTML = '';
    
    const unitName = document.getElementById('unit-select').value;
    const todayWords = getTodayWords(unitName, 5, 5);
    
    // 显示需要复习的词语
    todayWords.reviewWords.forEach(word => {
        const wordData = unit3Data.words.find(w => w.word === word);
        if (wordData) {
            const wordCard = document.createElement('div');
            wordCard.className = 'review-word-card';
            wordCard.innerHTML = `
                <div class="review-word-pinyin">${wordData.pinyin}</div>
                <div class="review-word-text">${wordData.word}</div>
            `;
            wordCard.onclick = function() {
                // 点击词语卡片时播放读音（如果有音频功能）
                // playWordAudio(wordData.word);
            };
            reviewWordsDiv.appendChild(wordCard);
        }
    });
    
    // 显示新词语
    todayWords.newWords.forEach(word => {
        const wordData = unit3Data.words.find(w => w.word === word);
        if (wordData) {
            const wordCard = document.createElement('div');
            wordCard.className = 'review-word-card new-word';
            wordCard.innerHTML = `
                <div class="review-word-pinyin">${wordData.pinyin}</div>
                <div class="review-word-text">${wordData.word}</div>
                <div class="new-word-badge">新词</div>
            `;
            wordCard.onclick = function() {
                // 点击词语卡片时播放读音（如果有音频功能）
                // playWordAudio(wordData.word);
            };
            reviewWordsDiv.appendChild(wordCard);
        }
    });
    
    // 如果没有词语需要学习，显示提示信息
    if (todayWords.reviewWords.length === 0 && todayWords.newWords.length === 0) {
        reviewWordsDiv.innerHTML = '<div class="no-words-message">今天没有需要学习的词语！</div>';
    }
}

// 播放词语读音（如果有音频功能）
function playWordAudio(word) {
    // 这里可以实现音频播放功能
    // 如果没有音频文件，可以使用浏览器的语音合成 API
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = 'zh-CN';
        speechSynthesis.speak(utterance);
    } else {
        console.log('浏览器不支持语音合成');
    }
}