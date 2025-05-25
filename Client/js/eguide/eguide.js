/**
 * EGuide - 教育用ガイドクラス。レッスンの生成・進行・表示・質問応答などを管理する。
 */
class EGuide {
    /**
     * EGuideのインスタンスを初期化する。
     */
    constructor() {
        this.currentStep = 0;
        this.lessons = [];
        this.questions = [];
        this.originalScenario = null;
        this.modifiedScenario = null;
        
        this.initializeElements();
        this.attachEventListeners();
    }

    /**
     * 画面上の主要なDOM要素を初期化する。
     */
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

    /**
     * イベントリスナーを各ボタンに設定する。
     */
    attachEventListeners() {
        this.startButton.addEventListener('click', () => this.startLesson());
        this.nextButton.addEventListener('click', () => this.nextStep());
        this.prevButton.addEventListener('click', () => this.previousStep());
        this.submitQuestion.addEventListener('click', () => this.handleQuestion());
    }

    /**
     * レッスンを開始し、シナリオを生成する。
     * @returns {Promise<void>}
     */
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

    /**
     * Gemini APIを使ってシナリオを生成する。
     * @param {string} subject - 科目名
     * @param {string} unit - 単元名
     * @returns {Promise<void>}
     */
    async generateScenario(subject, unit) {
        // 文字列をサニタイズする関数
        const sanitizeString = (str) => {
            if (!str) return '';
            return str.replace(/[\x00-\x1F\x7F-\x9F]/g, '');
        };

        try {
            // まずチャプター構造を生成
            const chapterPrompt = `
以下の条件に従って、${subject}の「${unit}」についてのチャプター構成を生成してください：

1. 各セクション（導入、本題、具体例、演習、まとめ）を独立したチャプターとして分割してください。
2. 各チャプターは以下の情報を含めてください：
   - タイトル（具体的で魅力的なタイトル）
   - 学習目標（具体的な到達目標）
   - 授業回数（各チャプターの内容に応じて適切な回数を設定）
   - 重要な学習項目（具体的な項目）

以下の形式で出力してください：

タイトル: チャプターのタイトル
目標:
- 具体的な学習目標1
- 具体的な学習目標2
授業回数: 2
重要項目:
- 具体的な項目1
- 具体的な項目2

注意点：
- 各チャプターは独立した完結した内容を持つようにしてください
- チャプター間の関連性と学習の流れを考慮してください
- 全授業回数の合計が13回になるように調整してください
- 各チャプターのタイトルは具体的で魅力的なものにしてください
- 必ず上記の形式で出力してください
- 各セクションは必ず存在するようにしてください
- 授業回数は必ず数値で指定してください
- 授業回数の配分例：
  - 導入：2回
  - 本題：4回
  - 具体例：3回
  - 演習：3回
  - まとめ：1回`;

            // チャプター構造の生成
            const chapterResponse = await this.callGemini(chapterPrompt);
            if (!chapterResponse) {
                throw new Error('チャプター構造の生成に失敗しました。');
            }

            let chapters = this.parseChapters(chapterResponse);
            if (!chapters || !Array.isArray(chapters) || chapters.length === 0) {
                throw new Error('チャプター構造の解析に失敗しました。');
            }

            // 授業回数の合計を確認し、必要に応じて調整
            const totalLessons = chapters.reduce((sum, chapter) => sum + (chapter.lessons || 0), 0);
            if (totalLessons !== 13) {
                // 授業回数を調整
                chapters = this.adjustLessonCount(chapters, totalLessons);
            }

            // 各チャプターの必須フィールドを確認
            for (const chapter of chapters) {
                if (!this.isValidChapter(chapter)) {
                    throw new Error('チャプター構造に必須フィールドが不足しています。');
                }
            }

            // 各チャプターの授業内容を生成
            const lessons = [];
            for (const chapter of chapters) {
                // 各セクションを個別に生成
                const sections = ['導入', '本題', '具体例', '演習', 'まとめ', '次回予告'];
                const lessonContent = {};

                for (const section of sections) {
                    const sectionPrompt = `
以下の条件に従って、${subject}の「${unit}」の「${chapter.title}」の「${section}」セクションの内容を生成してください：

学習目標：
${chapter.objectives.map(obj => `- ${obj}`).join('\n')}

重要な学習項目：
${chapter.keyPoints.map(point => `- ${point}`).join('\n')}

セクションの種類：${section}
授業回数：${chapter.lessons}回

以下の形式で出力してください：

${section}:
${section === '具体例' || section === '演習' ? '- 項目1<br>- 項目2' : 'セクションの内容<br>改行は<br>タグを使用してください'}

注意点：
- 具体的で分かりやすい説明を心がけてください
- 生徒の興味を引くような例や問いかけを含めてください
- そのセクションの目的に合った内容を生成してください
- 数式は以下の形式で記述してください：
  - インライン数式: \\(数式\\)
  - ディスプレイ数式: \\[数式\\]
- 必ず上記の形式で出力してください
- セクションの内容は必ず存在するようにしてください
- 具体例と演習は必ずリスト形式で出力してください
- 授業回数に応じた適切な量の内容を生成してください
- 改行は必ず<br>タグを使用してください
- 段落を分ける場合は<br><br>を使用してください`;

                    try {
                        const sectionResponse = await this.callGemini(sectionPrompt);
                        if (!sectionResponse) {
                            throw new Error(`${section}セクションの生成に失敗しました。`);
                        }

                        const content = this.parseSection(sectionResponse, section);
                        if (section === '具体例' || section === '演習') {
                            if (!Array.isArray(content) || content.length === 0) {
                                throw new Error(`${section}セクションの内容が不正です。`);
                            }
                        } else if (!content || typeof content !== 'string') {
                            throw new Error(`${section}セクションの内容が不正です。`);
                        }
                        lessonContent[section] = content;
                    } catch (error) {
                        console.error(`${section}セクションの生成エラー:`, error);
                        throw new Error(`${section}セクションの生成中にエラーが発生しました: ${error.message}`);
                    }
                }

                // レッスンオブジェクトを作成
                const lesson = {
                    title: chapter.title,
                    content: lessonContent,
                    chapter: chapter.title,
                    type: '導入'
                };

                lessons.push(lesson);
            }

            if (!lessons || lessons.length === 0) {
                throw new Error('授業内容の生成に失敗しました。');
            }

            this.lessons = lessons;
            this.originalScenario = JSON.stringify({ 
                chapters: chapters,
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
                        '導入': 'みなさん、ジェットコースターに乗ったことはありますか？<br><br>（ジェットコースターの写真を表示）<br><br>このジェットコースターの軌跡、どんな形をしていると思いますか？<br><br>実は、この曲線は「放物線」と呼ばれる特別な形をしています。今日は、この放物線を数学的に理解していきましょう。',
                        '本題': '放物線は、自然界や人工物の中によく見られる形です。<br><br>例えば：<br>- 橋のアーチ<br>- 噴水の水の軌跡<br>- ボールを投げた時の軌道<br><br>これらの共通点は何でしょうか？',
                        '具体例': [
                            '橋の写真を見て、放物線の形を確認する',
                            'ボールを投げる様子を動画で見る',
                            '噴水の写真で放物線を観察する'
                        ],
                        '演習': [
                            '身の回りにある放物線の形を探してみよう',
                            '放物線の特徴を3つ挙げてみよう'
                        ],
                        'まとめ': '今日は、放物線が身の回りにたくさんあることを学びました。<br>次回は、この放物線を数学的に表現する方法を学びます。',
                        '次回予告': '次回は、放物線を数式で表す方法を学びます。<br>実は、この美しい曲線は、とてもシンプルな数式で表すことができるんですよ！'
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
                    }
                ],
                lessons: this.lessons 
            });
        }
    }

    /**
     * チャプター構造テキストをパースして配列に変換する。
     * @param {string} text - チャプター構造テキスト
     * @returns {Array<Object>} パース結果
     */
    parseChapters(text) {
        if (!text) return [];
        
        const chapters = [];
        const lines = text.split('\n');
        let currentChapter = null;
        let currentSection = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // タイトル行の処理
            if (line.startsWith('タイトル:') || line.startsWith('タイトル：')) {
                if (currentChapter) {
                    // 必須フィールドの確認
                    if (this.isValidChapter(currentChapter)) {
                        chapters.push(currentChapter);
                    }
                }
                currentChapter = {
                    title: line.substring(line.indexOf(':') + 1).trim(),
                    objectives: [],
                    lessons: 0,
                    keyPoints: []
                };
                currentSection = null;
            }
            // 目標セクションの処理
            else if (line === '目標:' || line === '目標：') {
                if (!currentChapter) continue;
                currentSection = 'objectives';
            }
            // 授業回数の処理
            else if (line.startsWith('授業回数:') || line.startsWith('授業回数：')) {
                if (!currentChapter) continue;
                const lessons = parseInt(line.substring(line.indexOf(':') + 1).trim());
                if (!isNaN(lessons) && lessons > 0) {
                    currentChapter.lessons = lessons;
                }
            }
            // 重要項目セクションの処理
            else if (line === '重要項目:' || line === '重要項目：') {
                if (!currentChapter) continue;
                currentSection = 'keyPoints';
            }
            // リストアイテムの処理
            else if (line.startsWith('- ')) {
                if (!currentChapter || !currentSection) continue;
                const item = line.substring(2).trim();
                if (item) {
                    if (currentSection === 'objectives') {
                        currentChapter.objectives.push(item);
                    } else if (currentSection === 'keyPoints') {
                        currentChapter.keyPoints.push(item);
                    }
                }
            }
        }

        // 最後のチャプターを追加
        if (currentChapter && this.isValidChapter(currentChapter)) {
            chapters.push(currentChapter);
        }

        // チャプターが存在しない場合、デフォルトのチャプターを生成
        if (chapters.length === 0) {
            chapters.push({
                title: "導入：基本概念の理解",
                objectives: ["基本的な概念の理解", "重要な用語の習得"],
                lessons: 1,
                keyPoints: ["基本概念", "重要用語"]
            });
        }

        return chapters;
    }

    // チャプターの妥当性をチェックする関数
    isValidChapter(chapter) {
        return (
            chapter &&
            typeof chapter === 'object' &&
            typeof chapter.title === 'string' &&
            chapter.title.length > 0 &&
            Array.isArray(chapter.objectives) &&
            chapter.objectives.length > 0 &&
            typeof chapter.lessons === 'number' &&
            chapter.lessons > 0 &&
            Array.isArray(chapter.keyPoints) &&
            chapter.keyPoints.length > 0
        );
    }

    // セクションをパースする関数
    parseSection(text, sectionType) {
        if (!text || !sectionType) {
            return sectionType === '具体例' || sectionType === '演習' ? [] : '';
        }

        const lines = text.split('\n');
        let content = '';
        let items = [];
        let currentSection = null;

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            // セクション開始の検出
            if (line.startsWith(`${sectionType}:`) || line.startsWith(`${sectionType}：`)) {
                currentSection = sectionType;
                continue;
            }

            // セクション内容の処理
            if (currentSection === sectionType) {
                if (sectionType === '具体例' || sectionType === '演習') {
                    if (line.startsWith('- ')) {
                        const item = line.substring(2).trim();
                        if (item) {
                            items.push(item);
                        }
                    }
                } else {
                    content += line + '\n';
                }
            }
        }

        // 結果の返却
        if (sectionType === '具体例' || sectionType === '演習') {
            return items.length > 0 ? items : ['デフォルトの例'];
        } else {
            return content.trim() || 'デフォルトの内容';
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
        if (!lesson || !lesson.content) {
            console.error('Invalid lesson data:', lesson);
            return;
        }

        // 各セクションの内容を安全に取得
        const getContent = (section) => {
            const content = lesson.content[section];
            if (!content) return '';
            if (Array.isArray(content)) {
                return content.map(item => this.formatContent(item)).join('');
            }
            return this.formatContent(content);
        };

        // リストアイテムを安全に取得
        const getListItems = (section) => {
            const content = lesson.content[section];
            if (!Array.isArray(content) || content.length === 0) return '';
            return content.map(item => `<li>${this.formatContent(item)}</li>`).join('');
        };

        this.messageDisplay.innerHTML = `
            <h3>${lesson.title || ''}</h3>
            <div class="lesson-content">
                <div class="introduction">
                    <h4>導入</h4>
                    <p>${getContent('導入')}</p>
                </div>
                <div class="main-content">
                    <h4>本題</h4>
                    <p>${getContent('本題')}</p>
                </div>
                <div class="examples">
                    <h4>具体例</h4>
                    <ul>
                        ${getListItems('具体例')}
                    </ul>
                </div>
                <div class="exercises">
                    <h4>演習</h4>
                    <ul>
                        ${getListItems('演習')}
                    </ul>
                </div>
                <div class="summary">
                    <h4>まとめ</h4>
                    <p>${getContent('まとめ')}</p>
                </div>
                <div class="next-preview">
                    <h4>次回予告</h4>
                    <p>${getContent('次回予告')}</p>
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
        // 入力値の検証
        if (content === null || content === undefined) {
            return '';
        }

        // 文字列に変換
        let formattedContent = String(content).trim();
        if (!formattedContent) {
            return '';
        }

        // 科目に応じた処理
        const subject = this.subjectSelect?.value || 'math';
        
        try {
            // Markdownの処理
            formattedContent = marked.parse(formattedContent);

            if (subject === 'math') {
                // MathJaxの数式を処理（Markdownの後に処理）
                formattedContent = formattedContent.replace(/\$(.*?)\$/g, '\\\\($1\\\\)');
            } else if (subject === 'japanese') {
                // 国語の文章を明朝体で表示
                formattedContent = `<span class="japanese-content">${formattedContent}</span>`;
            }
        } catch (error) {
            console.error('Content formatting error:', error);
            return formattedContent; // エラー時は元の内容を返す
        }

        return formattedContent;
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

    // 授業回数を調整する関数
    adjustLessonCount(chapters, currentTotal) {
        const targetTotal = 13;
        const defaultDistribution = {
            '導入': 2,
            '本題': 4,
            '具体例': 3,
            '演習': 3,
            'まとめ': 1
        };

        // 各チャプターのタイプを判定
        const chapterTypes = chapters.map(chapter => {
            const title = chapter.title.toLowerCase();
            if (title.includes('導入')) return '導入';
            if (title.includes('本題')) return '本題';
            if (title.includes('具体例')) return '具体例';
            if (title.includes('演習')) return '演習';
            if (title.includes('まとめ')) return 'まとめ';
            return null;
        });

        // タイプごとのチャプターをグループ化
        const groupedChapters = {};
        chapterTypes.forEach((type, index) => {
            if (type) {
                if (!groupedChapters[type]) {
                    groupedChapters[type] = [];
                }
                groupedChapters[type].push(chapters[index]);
            }
        });

        // 各タイプの授業回数を調整
        const adjustedChapters = [];
        Object.entries(defaultDistribution).forEach(([type, targetCount]) => {
            const typeChapters = groupedChapters[type] || [];
            if (typeChapters.length > 0) {
                // 既存のチャプターの授業回数を調整
                typeChapters.forEach(chapter => {
                    chapter.lessons = Math.max(1, Math.floor(targetCount / typeChapters.length));
                    adjustedChapters.push(chapter);
                });
            } else {
                // 新しいチャプターを作成
                adjustedChapters.push({
                    title: `${type}：${unit}の理解を深める`,
                    objectives: [`${type}の基本的な理解`, `${type}の応用`],
                    lessons: targetCount,
                    keyPoints: [`${type}の基本概念`, `${type}の重要ポイント`]
                });
            }
        });

        // 合計が13になるように微調整
        const finalTotal = adjustedChapters.reduce((sum, chapter) => sum + chapter.lessons, 0);
        if (finalTotal !== targetTotal) {
            const diff = targetTotal - finalTotal;
            if (diff > 0) {
                // 本題の授業回数を増やす
                const mainChapter = adjustedChapters.find(ch => ch.title.includes('本題'));
                if (mainChapter) {
                    mainChapter.lessons += diff;
                }
            } else if (diff < 0) {
                // 本題の授業回数を減らす
                const mainChapter = adjustedChapters.find(ch => ch.title.includes('本題'));
                if (mainChapter) {
                    mainChapter.lessons = Math.max(1, mainChapter.lessons + diff);
                }
            }
        }

        return adjustedChapters;
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.eguide = new EGuide();
}); 