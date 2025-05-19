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
        // 13限の授業シナリオを生成
        const lessons = [
            { title: '導入', content: `${unit}について、身近な例から学んでいきましょう。` },
            { title: '基本概念1', content: 'まずは基本的な考え方を理解していきましょう。' },
            { title: '基本概念2', content: 'もう少し詳しく見ていきましょう。' },
            { title: '例題1', content: '簡単な例題で理解を深めましょう。' },
            { title: '練習1', content: '一緒に解いてみましょう。' },
            { title: '応用1', content: '少し難しい問題に挑戦してみましょう。' },
            { title: '基本概念3', content: '新しい考え方を学びましょう。' },
            { title: '例題2', content: 'もう一つの例題を見てみましょう。' },
            { title: '練習2', content: '理解を確認しましょう。' },
            { title: '応用2', content: 'さらに難しい問題に挑戦しましょう。' },
            { title: 'まとめ1', content: 'ここまでの内容を整理しましょう。' },
            { title: '応用3', content: '総合的な問題に挑戦しましょう。' },
            { title: 'まとめ2', content: '全体の復習をしましょう。' }
        ];

        this.lessons = lessons;
        this.originalScenario = JSON.stringify(lessons);
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

        // 質問に対する回答を生成（実際の実装ではAIを使用）
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
        // 実際の実装ではAIを使用して回答を生成
        return "この質問に対する回答を生成中です...";
    }
}

// アプリケーションの初期化
document.addEventListener('DOMContentLoaded', () => {
    window.eguide = new EGuide();
}); 