class EGuide {
    constructor() {
        this.currentStep = 0;
        this.lessons = [];
        this.questions = [];
        this.originalScenario = null;
        this.modifiedScenario = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    initializeElements() {
        this.setupSection = document.getElementById('setup-section');
        this.lessonSection = document.getElementById('lesson-section');
        this.subjectSelect = document.getElementById('subject');
        this.unitInput = document.getElementById('unit');
        this.startButton = document.getElementById('start-lesson');
        this.messageDisplay = document.getElementById('message-display');
        this.nextButton = document.getElementById('next-btn');
        this.prevButton = document.getElementById('prev-btn');
        this.questionInput = document.getElementById('question-input');
        this.questionText = document.getElementById('question-text');
        this.submitQuestion = document.getElementById('submit-question');
        this.progressBar = document.getElementById('progress');
        this.currentUnitTitle = document.getElementById('current-unit');
    }

    attachEventListeners() {
        this.startButton.addEventListener('click', () => this.startLesson());
        this.nextButton.addEventListener('click', () => this.nextStep());
        this.prevButton.addEventListener('click', () => this.previousStep());
        this.submitQuestion.addEventListener('click', () => this.handleQuestion());
    }

    async startLesson() {
        const subject = this.subjectSelect.value;
        const unit = this.unitInput.value.trim();
        
        if (!unit) {
            alert('単元名を入力してください。');
            return;
        }

        this.currentUnitTitle.textContent = unit;
        this.setupSection.classList.add('hidden');
        this.lessonSection.classList.remove('hidden');
        
        // シナリオ生成
        await this.generateScenario(subject, unit);
        this.displayCurrentStep();
    }

    async generateScenario(subject, unit) {
        const prompt = `
以下の条件に従って、${subject}の「${unit}」についての13限の授業シナリオを生成してください：

1. 単元を3-4つの大きなチャプターに分割し、各チャプターを3-4回の授業で完結させてください
2. 各チャプターの構成：
   - 導入（1回）：チャプターの概要と学習目標の説明
   - 基本概念（1-2回）：重要な概念の説明と基本的な例題
   - 応用（1回）：実践的な問題演習と応用例
3. 各限の内容は以下の形式で出力してください：
{
    "lessons": [
        {
            "title": "チャプター名：限のタイトル",
            "content": "具体的な内容",
            "chapter": "チャプター番号",
            "type": "導入/基本/応用"
        }
    ]
}

注意点：
- 各チャプターは3-4回の授業で完結するようにしてください
- 13限で全ての内容を網羅するのは難しいため、重要な部分に焦点を当ててください
- 各チャプターの最後には、そのチャプターの内容を確認する演習を含めてください
- 最後の授業は全体の復習とまとめにしてください

JSON形式で出力してください。`;

        try {
            const response = await this.callGemini(prompt);
            // レスポンスからJSON部分を抽出
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('No JSON found in response');
            }
            const scenario = JSON.parse(jsonMatch[0]);
            if (!scenario.lessons || !Array.isArray(scenario.lessons)) {
                throw new Error('Invalid scenario format');
            }
            this.lessons = scenario.lessons;
            this.originalScenario = JSON.stringify(scenario);
        } catch (error) {
            console.error('シナリオ生成エラー:', error);
            // エラー時のフォールバックシナリオ
            this.lessons = [
                { title: '第1章：導入', content: `${unit}について、全体像を把握しましょう。`, chapter: 1, type: '導入' },
                { title: '第1章：基本概念1', content: '第1章の重要な概念を学びましょう。', chapter: 1, type: '基本' },
                { title: '第1章：基本概念2', content: 'さらに詳しく見ていきましょう。', chapter: 1, type: '基本' },
                { title: '第1章：応用', content: '第1章の内容を実践的に活用しましょう。', chapter: 1, type: '応用' },
                { title: '第2章：導入', content: '第2章の概要を理解しましょう。', chapter: 2, type: '導入' },
                { title: '第2章：基本概念1', content: '第2章の重要な概念を学びましょう。', chapter: 2, type: '基本' },
                { title: '第2章：基本概念2', content: 'さらに詳しく見ていきましょう。', chapter: 2, type: '基本' },
                { title: '第2章：応用', content: '第2章の内容を実践的に活用しましょう。', chapter: 2, type: '応用' },
                { title: '第3章：導入', content: '第3章の概要を理解しましょう。', chapter: 3, type: '導入' },
                { title: '第3章：基本概念1', content: '第3章の重要な概念を学びましょう。', chapter: 3, type: '基本' },
                { title: '第3章：基本概念2', content: 'さらに詳しく見ていきましょう。', chapter: 3, type: '基本' },
                { title: '第3章：応用', content: '第3章の内容を実践的に活用しましょう。', chapter: 3, type: '応用' },
                { title: '総まとめ', content: 'これまでの学習内容を整理し、全体を復習しましょう。', chapter: 4, type: 'まとめ' }
            ];
            this.originalScenario = JSON.stringify({ lessons: this.lessons });
        }
    }

    async callGemini(message) {
        const systemPrompt = `あなたは教育の専門家として、効果的な授業シナリオを作成するAIアシスタントです。
以下の点に注意してシナリオを作成してください：
- 生徒の理解を深めるための段階的なアプローチ
- 具体的な例や実践的な演習の組み込み
- 生徒の興味を引く導入部
- 明確な学習目標の設定
- 適切な難易度の設定`;

        const requestBody = {
            contents: [{
                parts: [{
                    text: systemPrompt + "\n\n" + message
                }]
            }]
        };

        try {
            const response = await fetch(
                `${CONFIG.API_URL}?key=${CONFIG.API_KEY}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(requestBody),
                }
            );

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API Error: ${response.status} - ${errorText}`);
            }

            const data = await response.json();
            if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
                throw new Error('Invalid API response structure');
            }

            return data.candidates[0].content.parts[0].text;
        } catch (error) {
            console.error("Gemini API Error:", error);
            throw error;
        }
    }

    displayCurrentStep() {
        const lesson = this.lessons[this.currentStep];
        this.messageDisplay.innerHTML = `
            <h3>${lesson.title}</h3>
            <p>${this.formatContent(lesson.content)}</p>
        `;
        
        // 進捗バーの更新
        const progress = ((this.currentStep + 1) / this.lessons.length) * 100;
        this.progressBar.style.width = `${progress}%`;
        
        // ボタンの状態更新
        this.prevButton.disabled = this.currentStep === 0;
        this.nextButton.disabled = this.currentStep === this.lessons.length - 1;
        
        // 科目に応じたスタイル適用
        this.applySubjectStyle();
    }

    formatContent(content) {
        const subject = this.subjectSelect.value;
        if (subject === 'math') {
            // MathJaxの数式を処理
            return content.replace(/\$(.*?)\$/g, '\\\\($1\\\\)');
        } else if (subject === 'japanese') {
            // 国語の文章を明朝体で表示
            return `<span class="japanese-content">${content}</span>`;
        }
        return content;
    }

    applySubjectStyle() {
        const subject = this.subjectSelect.value;
        this.messageDisplay.className = '';
        if (subject === 'math') {
            this.messageDisplay.classList.add('math-content');
        } else if (subject === 'japanese') {
            this.messageDisplay.classList.add('japanese-content');
        }
        
        // MathJaxの再レンダリング
        if (window.MathJax) {
            MathJax.typesetPromise([this.messageDisplay]);
        }
    }

    nextStep() {
        if (this.currentStep < this.lessons.length - 1) {
            this.currentStep++;
            this.displayCurrentStep();
        }
    }

    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.displayCurrentStep();
        }
    }

    async handleQuestion() {
        const question = this.questionText.value.trim();
        if (!question) return;

        // 質問を保存
        this.questions.push({
            step: this.currentStep,
            question: question,
            timestamp: new Date().toISOString()
        });

        // 質問入力欄をクリア
        this.questionText.value = '';
        this.questionInput.classList.add('hidden');

        // 質問に対する回答を生成
        const answer = await this.generateAnswer(question);
        
        // 回答を表示
        this.messageDisplay.innerHTML += `
            <div class="question-answer">
                <p><strong>質問:</strong> ${question}</p>
                <p><strong>回答:</strong> ${answer}</p>
            </div>
        `;
    }

    async generateAnswer(question) {
        const prompt = `
現在の授業内容：${this.lessons[this.currentStep].content}

以下の質問に対する回答を生成してください：
${question}

回答は以下の点に注意して生成してください：
- 現在の授業内容に関連付けて回答する
- 具体的な例を含める
- 生徒の理解を深めるための説明を心がける
- 必要に応じて、関連する概念や応用例も含める`;

        try {
            return await this.callGemini(prompt);
        } catch (error) {
            console.error('回答生成エラー:', error);
            return '申し訳ありません。回答の生成に失敗しました。もう一度お試しください。';
        }
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.eguide = new EGuide();
}); 