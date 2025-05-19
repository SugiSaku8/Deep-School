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
        // 文字列をサニタイズする関数
        const sanitizeString = (str) => {
            return str
                // 制御文字を除去
                .replace(/[\x00-\x1F\x7F-\x9F]/g, '')
                // 改行を適切に処理
                .replace(/\n/g, '\\n')
                // 数式のエスケープ
                .replace(/\\\(/g, '\\\\(')
                .replace(/\\\)/g, '\\\\)')
                .replace(/\\\[/g, '\\\\[')
                .replace(/\\\]/g, '\\\\]')
                // その他の特殊文字をエスケープ
                .replace(/\\/g, '\\\\')
                .replace(/"/g, '\\"')
                .replace(/\t/g, '\\t')
                .replace(/\r/g, '\\r')
                .replace(/\f/g, '\\f')
                .replace(/\b/g, '\\b');
        };

        // 文字列をデサニタイズする関数
        const desanitizeString = (str) => {
            return str
                // 改行を復元
                .replace(/\\n/g, '\n')
                // 数式のエスケープを復元
                .replace(/\\\\\(/g, '\\(')
                .replace(/\\\\\)/g, '\\)')
                .replace(/\\\\\[/g, '\\[')
                .replace(/\\\\\]/g, '\\]')
                // その他の特殊文字を復元
                .replace(/\\\\/g, '\\')
                .replace(/\\"/g, '"')
                .replace(/\\t/g, '\t')
                .replace(/\\r/g, '\r')
                .replace(/\\f/g, '\f')
                .replace(/\\b/g, '\b');
        };

        // JSONの検証関数
        const validateJSON = (jsonStr) => {
            try {
                // 制御文字を除去
                const cleanStr = jsonStr.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
                // プロパティ名の検証
                if (cleanStr.includes('\\b')) {
                    throw new Error('プロパティ名に制御文字が含まれています');
                }
                // JSONとしてパース
                const parsed = JSON.parse(cleanStr);
                return { valid: true, data: parsed };
            } catch (error) {
                return { valid: false, error: error.message };
            }
        };

        // まずチャプター構造を生成
        const chapterPrompt = `
以下の条件に従って、${subject}の「${unit}」についてのチャプター構成を生成してください：

1. 各セクション（導入、本題、具体例、演習、まとめ）を独立したチャプターとして分割してください。

2. 各チャプターは以下の情報を含めてください：
   - チャプターのタイトル（具体的で魅力的なタイトル）
   - 学習目標（具体的な到達目標）
   - 必要な授業回数（各チャプターの内容に応じて適切な回数を設定）
   - 重要な学習項目（具体的な項目）

3. チャプターの構成例：
   - 導入：概念の導入と興味喚起（1回）
   - 本題：基本的な概念の説明（2-3回）
   - 具体例：実例を通じた理解（2-3回）
   - 演習：実践的な問題解決（3-4回）
   - まとめ：知識の確認と統合（1-2回）

以下の形式で出力してください：
{
    "chapters": [
        {
            "title": "チャプターのタイトル",
            "objectives": ["具体的な学習目標1", "具体的な学習目標2"],
            "lessons": 2,
            "keyPoints": ["具体的な項目1", "具体的な項目2"]
        }
    ]
}

注意点：
- 各チャプターは独立した完結した内容を持つようにしてください
- チャプター間の関連性と学習の流れを考慮してください
- 全授業回数の合計が13回になるように調整してください
- 各チャプターのタイトルは具体的で魅力的なものにしてください
- 導入チャプターは生徒の興味を引く内容にしてください
- 本題チャプターは段階的に理解を深められるようにしてください
- 具体例チャプターは実践的な例を含めてください
- 演習チャプターは適切な難易度の問題を含めてください
- まとめチャプターは重要ポイントを整理してください
- プロパティ名には制御文字を使用しないでください
- 数式は以下の形式で記述してください：
  - インライン数式: \\(数式\\)
  - ディスプレイ数式: \\[数式\\]

JSON形式で出力してください。`;

        try {
            // チャプター構造の生成
            const chapterResponse = await this.callGemini(chapterPrompt);
            const chapterMatch = chapterResponse.match(/\{[\s\S]*\}/);
            if (!chapterMatch) {
                throw new Error('チャプター構造の生成に失敗しました。AIからの応答が不正な形式です。');
            }

            // JSONの検証
            const validation = validateJSON(chapterMatch[0]);
            if (!validation.valid) {
                throw new Error(`チャプター構造のJSONが不正です: ${validation.error}`);
            }
            const chapterStructure = validation.data;
            
            if (!chapterStructure.chapters || !Array.isArray(chapterStructure.chapters)) {
                throw new Error('チャプター構造の形式が不正です。chapters配列が見つかりません。');
            }

            // 授業回数の合計を確認
            const totalLessons = chapterStructure.chapters.reduce((sum, chapter) => sum + chapter.lessons, 0);
            if (totalLessons !== 13) {
                throw new Error(`授業回数の合計（${totalLessons}回）が要件（13回）と一致しません。`);
            }

            // 各チャプターの授業内容を生成
            const lessons = [];
            for (const chapter of chapterStructure.chapters) {
                const lessonPrompt = `
以下の条件に従って、${subject}の「${unit}」の「${chapter.title}」についての${chapter.lessons}回分の授業内容を生成してください：

学習目標：
${chapter.objectives.map(obj => `- ${obj}`).join('\\n')}

重要な学習項目：
${chapter.keyPoints.map(point => `- ${point}`).join('\\n')}

以下の形式で出力してください：
{
    "lessons": [
        {
            "title": "チャプター名：限のタイトル",
            "content": {
                "introduction": "導入部分の具体的な文章（生徒の興味を引く具体的な例や問いかけを含める）",
                "mainContent": "本題の具体的な説明（具体例を交えながら分かりやすく説明）",
                "examples": ["具体例1（実際の数値や図を含む）", "具体例2（実際の数値や図を含む）"],
                "exercises": ["演習問題1（具体的な数値や条件を含む）", "演習問題2（具体的な数値や条件を含む）"],
                "summary": "まとめの文章（その授業の重要なポイントを簡潔にまとめる）",
                "nextPreview": "次回の予告（生徒の興味を引くような形で次の授業の内容を紹介）"
            },
            "chapter": "チャプター番号",
            "type": "導入/基本/応用"
        }
    ]
}

注意点：
- 各セクションは実際の授業でそのまま使える具体的な文章を生成してください
- 導入部分は生徒の興味を引くような具体的な例や問いかけを含めてください
- 本題の説明は、具体例を交えながら分かりやすく説明してください
- 演習問題は、その授業で学んだ内容を確認できる適切な難易度のものを含めてください
- まとめは、その授業の重要なポイントを簡潔にまとめてください
- 次回の予告は、生徒の興味を引くような形で次の授業の内容を紹介してください
- 数式は以下の形式で記述してください：
  - インライン数式: \\(数式\\)
  - ディスプレイ数式: \\[数式\\]
- 改行は "\\n" を使用してください
- 特殊文字は適切にエスケープしてください
- 各チャプターは独立した完結した内容を持つようにしてください
- チャプター間の関連性と学習の流れを考慮してください
- プロパティ名には制御文字を使用しないでください
- JSONの形式を厳密に守ってください

JSON形式で出力してください。`;

                try {
                    const lessonResponse = await this.callGemini(lessonPrompt);
                    const lessonMatch = lessonResponse.match(/\{[\s\S]*\}/);
                    if (!lessonMatch) {
                        throw new Error(`「${chapter.title}」の授業内容生成に失敗しました。AIからの応答が不正な形式です。`);
                    }

                    // 文字列のサニタイズ
                    let jsonStr = lessonMatch[0];
                    
                    // 数式の部分を一時的に置換
                    const mathExpressions = [];
                    jsonStr = jsonStr.replace(/\\\(.*?\\\)|\\\[.*?\\\]/g, (match) => {
                        mathExpressions.push(match);
                        return `__MATH_${mathExpressions.length - 1}__`;
                    });

                    // 基本的なサニタイズ
                    jsonStr = sanitizeString(jsonStr);

                    // 数式を元に戻す
                    jsonStr = jsonStr.replace(/__MATH_(\d+)__/g, (_, index) => {
                        return mathExpressions[parseInt(index)];
                    });

                    // JSONの検証
                    const validation = validateJSON(jsonStr);
                    if (!validation.valid) {
                        throw new Error(`「${chapter.title}」の授業内容のJSONが不正です: ${validation.error}`);
                    }
                    const lessonContent = validation.data;

                    if (!lessonContent.lessons || !Array.isArray(lessonContent.lessons)) {
                        throw new Error(`「${chapter.title}」の授業内容の形式が不正です。lessons配列が見つかりません。`);
                    }

                    // 文字列のデサニタイズ
                    lessonContent.lessons.forEach(lesson => {
                        if (lesson.content) {
                            Object.keys(lesson.content).forEach(key => {
                                if (typeof lesson.content[key] === 'string') {
                                    lesson.content[key] = desanitizeString(lesson.content[key]);
                                }
                            });
                        }
                    });

                    lessons.push(...lessonContent.lessons);
                } catch (error) {
                    console.error(`「${chapter.title}」の授業内容生成エラー:`, error);
                    throw new Error(`「${chapter.title}」の授業内容生成中にエラーが発生しました: ${error.message}`);
                }
            }

            this.lessons = lessons;
            this.originalScenario = JSON.stringify({ 
                chapters: chapterStructure.chapters,
                lessons: lessons 
            });
        } catch (error) {
            console.error('シナリオ生成エラー:', error);
            alert(`シナリオ生成中にエラーが発生しました: ${error.message}`);
            // エラー時のフォールバックシナリオ
            this.lessons = [
                {
                    title: '導入：二次関数の世界へ',
                    content: {
                        introduction: 'みなさん、ジェットコースターに乗ったことはありますか？\n\n（ジェットコースターの写真を表示）\n\nこのジェットコースターの軌跡、どんな形をしていると思いますか？\n\n実は、この曲線は「放物線」と呼ばれる特別な形をしています。今日は、この放物線を数学的に理解していきましょう。',
                        mainContent: '放物線は、自然界や人工物の中によく見られる形です。\n\n例えば：\n- 橋のアーチ\n- 噴水の水の軌跡\n- ボールを投げた時の軌道\n\nこれらの共通点は何でしょうか？',
                        examples: [
                            '橋の写真を見て、放物線の形を確認する',
                            'ボールを投げる様子を動画で見る',
                            '噴水の写真で放物線を観察する'
                        ],
                        exercises: [
                            '身の回りにある放物線の形を探してみよう',
                            '放物線の特徴を3つ挙げてみよう'
                        ],
                        summary: '今日は、放物線が身の回りにたくさんあることを学びました。次回は、この放物線を数学的に表現する方法を学びます。',
                        nextPreview: '次回は、放物線を数式で表す方法を学びます。実は、この美しい曲線は、とてもシンプルな数式で表すことができるんですよ！'
                    },
                    chapter: 1,
                    type: '導入'
                }
            ];
            this.originalScenario = JSON.stringify({ 
                chapters: [
                    {
                        title: "導入：放物線との出会い",
                        objectives: ["放物線の概念の理解", "身近な例の認識"],
                        lessons: 1,
                        keyPoints: ["放物線の定義", "身近な例"]
                    },
                    {
                        title: "本題：二次関数の基本",
                        objectives: ["二次関数の定義の理解", "基本的な形の把握"],
                        lessons: 3,
                        keyPoints: ["二次関数の定義", "基本的な形", "係数の意味"]
                    },
                    {
                        title: "具体例：放物線の特徴",
                        objectives: ["具体例を通じた理解", "特徴の把握"],
                        lessons: 3,
                        keyPoints: ["具体例", "特徴", "応用例"]
                    },
                    {
                        title: "演習：実践的な問題",
                        objectives: ["問題解決能力の向上", "理解度の確認"],
                        lessons: 4,
                        keyPoints: ["基礎問題", "応用問題", "実践問題"]
                    },
                    {
                        title: "まとめ：知識の確認",
                        objectives: ["重要項目の確認", "理解度の確認"],
                        lessons: 2,
                        keyPoints: ["重要ポイント", "理解度確認"]
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
            <div class="lesson-content">
                <div class="introduction">
                    <h4>導入</h4>
                    <p>${this.formatContent(lesson.content.introduction)}</p>
                </div>
                <div class="main-content">
                    <h4>本題</h4>
                    <p>${this.formatContent(lesson.content.mainContent)}</p>
                </div>
                <div class="examples">
                    <h4>具体例</h4>
                    <ul>
                        ${lesson.content.examples.map(example => `<li>${this.formatContent(example)}</li>`).join('')}
                    </ul>
                </div>
                <div class="exercises">
                    <h4>演習</h4>
                    <ul>
                        ${lesson.content.exercises.map(exercise => `<li>${this.formatContent(exercise)}</li>`).join('')}
                    </ul>
                </div>
                <div class="summary">
                    <h4>まとめ</h4>
                    <p>${this.formatContent(lesson.content.summary)}</p>
                </div>
                <div class="next-preview">
                    <h4>次回予告</h4>
                    <p>${this.formatContent(lesson.content.nextPreview)}</p>
                </div>
            </div>
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