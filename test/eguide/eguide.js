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

1. 各限のタイトルと内容を含めてください
2. 身近な例から始めて、徐々に難しい内容に進んでください
3. 生徒がその単元について何も知らないと仮定してください
4. 各限の内容は具体的で、実践的な例を含めてください
5. 以下の形式で出力してください：
{
    "lessons": [
        {
            "title": "限のタイトル",
            "content": "具体的な内容"
        }
    ]
}

JSON形式で出力してください。`;

        try {
            const response = await this.callGemini(prompt);
            const scenario = JSON.parse(response);
            this.lessons = scenario.lessons;
            this.originalScenario = JSON.stringify(scenario);
        } catch (error) {
            console.error('シナリオ生成エラー:', error);
            alert('シナリオの生成に失敗しました。もう一度お試しください。');
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

        const fullMessage = `${systemPrompt}\n\nSystem: ${message}`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: fullMessage,
                        },
                    ],
                },
            ],
            generationConfig: CONFIG.GENERATION_CONFIG,
            safetySettings: CONFIG.SAFETY_SETTINGS,
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
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
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