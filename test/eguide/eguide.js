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
        // まずチャプター構造を生成
        const chapterPrompt = `
以下の条件に従って、${subject}の「${unit}」についてのチャプター構成を生成してください：

1. 単元を自然な学習の流れに沿って、適切な数のチャプターに分割してください
2. 各チャプターは以下の情報を含めてください：
   - チャプターのタイトル
   - 学習目標
   - 必要な授業回数（各チャプターの内容に応じて適切な回数を設定）
   - 重要な学習項目

以下の形式で出力してください：
{
    "chapters": [
        {
            "title": "チャプターのタイトル",
            "objectives": ["学習目標1", "学習目標2", ...],
            "lessons": 3,
            "keyPoints": ["重要な項目1", "重要な項目2", ...]
        }
    ]
}

注意点：
- チャプター数は内容に応じて自然に決めてください（制限はありません）
- 各チャプターの授業回数は、その内容の重要度や複雑さに応じて適切に設定してください
- 全授業回数の合計が13回になるように調整してください
- 最後のチャプターは総まとめとして設定してください
- 学習の流れが自然になるように、チャプターの順序を考慮してください

JSON形式で出力してください。`;

        try {
            // チャプター構造の生成
            const chapterResponse = await this.callGemini(chapterPrompt);
            const chapterMatch = chapterResponse.match(/\{[\s\S]*\}/);
            if (!chapterMatch) {
                throw new Error('No chapter structure found in response');
            }
            const chapterStructure = JSON.parse(chapterMatch[0]);
            
            if (!chapterStructure.chapters || !Array.isArray(chapterStructure.chapters)) {
                throw new Error('Invalid chapter structure format');
            }

            // 授業回数の合計を確認
            const totalLessons = chapterStructure.chapters.reduce((sum, chapter) => sum + chapter.lessons, 0);
            if (totalLessons !== 13) {
                throw new Error(`Total lessons (${totalLessons}) does not match required count (13)`);
            }

            // 各チャプターの授業内容を生成
            const lessons = [];
            for (const chapter of chapterStructure.chapters) {
                const lessonPrompt = `
以下の条件に従って、${subject}の「${unit}」の「${chapter.title}」についての${chapter.lessons}回分の授業内容を生成してください：

学習目標：
${chapter.objectives.map(obj => `- ${obj}`).join('\n')}

重要な学習項目：
${chapter.keyPoints.map(point => `- ${point}`).join('\n')}

以下の形式で出力してください：
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
- 授業の構成は、チャプターの内容と重要度に応じて柔軟に設定してください
- 導入、基本概念、応用の配分は、チャプターの内容に応じて適切に調整してください
- 最後のチャプターの場合は、全体の復習とまとめを含めてください
- 各授業の内容は、前後の授業との関連性を考慮して設定してください

JSON形式で出力してください。`;

                const lessonResponse = await this.callGemini(lessonPrompt);
                const lessonMatch = lessonResponse.match(/\{[\s\S]*\}/);
                if (!lessonMatch) {
                    throw new Error('No lesson content found in response');
                }
                const lessonContent = JSON.parse(lessonMatch[0]);
                
                if (!lessonContent.lessons || !Array.isArray(lessonContent.lessons)) {
                    throw new Error('Invalid lesson content format');
                }

                lessons.push(...lessonContent.lessons);
            }

            this.lessons = lessons;
            this.originalScenario = JSON.stringify({ 
                chapters: chapterStructure.chapters,
                lessons: lessons 
            });
        } catch (error) {
            console.error('シナリオ生成エラー:', error);
            // エラー時のフォールバックシナリオ
            this.lessons = [
                { title: '導入：単元の概要', content: `${unit}について、全体像を把握しましょう。`, chapter: 1, type: '導入' },
                { title: '基礎概念1：重要な考え方', content: '基本的な概念を学びましょう。', chapter: 1, type: '基本' },
                { title: '基礎概念2：応用の準備', content: 'さらに詳しく見ていきましょう。', chapter: 1, type: '基本' },
                { title: '応用1：実践的な問題', content: '学んだ内容を実践的に活用しましょう。', chapter: 1, type: '応用' },
                { title: '発展1：新しい視点', content: 'より深い理解を目指しましょう。', chapter: 2, type: '導入' },
                { title: '発展2：応用力の向上', content: '応用力を高めていきましょう。', chapter: 2, type: '基本' },
                { title: '発展3：実践演習', content: '実践的な問題に挑戦しましょう。', chapter: 2, type: '応用' },
                { title: '総合1：知識の統合', content: 'これまでの内容を統合しましょう。', chapter: 3, type: '導入' },
                { title: '総合2：応用力の確認', content: '総合的な問題に取り組みましょう。', chapter: 3, type: '基本' },
                { title: '総合3：実践的な応用', content: '実践的な問題を解いてみましょう。', chapter: 3, type: '応用' },
                { title: 'まとめ1：重要項目の確認', content: '重要なポイントを確認しましょう。', chapter: 4, type: 'まとめ' },
                { title: 'まとめ2：理解度の確認', content: '理解度を確認しましょう。', chapter: 4, type: 'まとめ' },
                { title: '総まとめ：全体の復習', content: 'これまでの学習内容を整理し、全体を復習しましょう。', chapter: 4, type: 'まとめ' }
            ];
            this.originalScenario = JSON.stringify({ 
                chapters: [
                    {
                        title: "基礎編",
                        objectives: ["基本的な概念の理解", "基礎的な問題解決能力の習得"],
                        lessons: 4,
                        keyPoints: ["重要な概念", "基本的な解法"]
                    },
                    {
                        title: "発展編",
                        objectives: ["応用的な概念の理解", "実践的な問題解決能力の向上"],
                        lessons: 3,
                        keyPoints: ["応用概念", "実践的な解法"]
                    },
                    {
                        title: "総合編",
                        objectives: ["知識の統合", "総合的な問題解決能力の習得"],
                        lessons: 3,
                        keyPoints: ["知識の統合", "総合的な解法"]
                    },
                    {
                        title: "まとめ",
                        objectives: ["重要項目の確認", "理解度の確認", "全体の復習"],
                        lessons: 3,
                        keyPoints: ["重要ポイント", "理解度", "全体の復習"]
                    }
                ],
                lessons: this.lessons 
            });
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