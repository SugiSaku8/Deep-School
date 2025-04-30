/**
 * 問題作成・例題管理・プレビュー・保存/読込などを行うクラス
 */
class QuestionCreator {
  /**
   * コンストラクタ
   * - 各種配列の初期化
   * - イベントリスナーの登録
   * - 保存済みデータの読込
   */
  constructor() {
    /** @type {Array<{id: string, text: string}>} 選択肢リスト */
    this.options = [];
    /** @type {Array<string>} 例題リスト */
    this.examples = []; // 例題を保存する配列
    this.initializeEventListeners();
    this.loadSavedQuestions();
    this.loadSavedExamples(); // 保存された例題を読み込む
  }

  /**
   * 各種ボタン・入力欄のイベントリスナーを登録
   */
  initializeEventListeners() {
    document
      .getElementById("add-option")
      .addEventListener("click", () => this.addOption());
    document
      .querySelectorAll("input, select, textarea")
      .forEach((element) => {
        element.addEventListener("input", () => this.updatePreview());
      });
    document
      .getElementById("save-question")
      .addEventListener("click", () => this.saveQuestion());
    document
      .getElementById("load-question")
      .addEventListener("click", () => this.loadQuestion());
    document
      .getElementById("export-json")
      .addEventListener("click", () => this.exportJSON());
    document
      .getElementById("add-example") // 例題追加ボタンのイベントリスナー
      .addEventListener("click", () => this.addExample());
  }

  /**
   * 例題を追加する
   */
  addExample() {
    const exampleText = document.getElementById("example-text").value;
    if (exampleText) {
      this.examples.push(exampleText);
      this.renderExamples();
      document.getElementById("example-text").value = ""; // 入力フィールドをクリア
    } else {
      alert("例題を入力してください。");
    }
  }

  /**
   * 例題リストを画面に表示
   */
  renderExamples() {
    const examplesContainer = document.getElementById("examples-container");
    examplesContainer.innerHTML = ""; // 既存の内容をクリア

    this.examples.forEach((example, index) => {
      const div = document.createElement("div");
      div.className = "example-item";
      div.innerHTML = `
                <p>${example}</p>
                <button onclick="questionCreator.removeExample(${index})">削除</button>
            `;
      examplesContainer.appendChild(div);
    });
  }

  /**
   * 指定したインデックスの例題を削除
   * @param {number} index 削除する例題のインデックス
   */
  removeExample(index) {
    this.examples.splice(index, 1);
    this.renderExamples();
  }

  /**
   * 保存された例題をlocalStorageから読み込む
   */
  loadSavedExamples() {
    const savedExamples = localStorage.getItem("savedExamples");
    if (savedExamples) {
      try {
        this.examples = JSON.parse(savedExamples);
        this.renderExamples();
      } catch (error) {
        console.error("保存された例題の読み込みに失敗しました:", error);
        alert("保存された例題の読み込みに失敗しました。");
      }
    }
  }

  /**
   * 例題をlocalStorageに保存
   */
  saveExamples() {
    localStorage.setItem("savedExamples", JSON.stringify(this.examples));
    alert("例題が保存されました。");
  }

  /**
   * 例題保存ボタンのイベントリスナーを登録
   */
  initializeExampleSaveListener() {
    document
      .getElementById("save-examples")
      .addEventListener("click", () => this.saveExamples());
  }

  /**
   * 新しい選択肢IDを生成
   * @returns {string} 新しいID
   */
  generateOptionId() {
    const prefix = "option_";
    const existingIds = this.options.map((option) =>
      parseInt(option.id.replace(prefix, ""))
    );
    const nextId = Math.max(...existingIds, 0) + 1;
    return `${prefix}${nextId}`;
  }

  /**
   * 選択肢を追加
   */
  addOption() {
    const id = this.generateOptionId();
    this.options.push({
      id,
      text: `選択肢${this.options.length + 1}`,
    });
    this.renderOptions();
    this.updatePreview();
  }

  /**
   * 選択肢リストを画面に表示
   */
  renderOptions() {
    const container = document.getElementById("options-container");
    container.innerHTML = "";

    this.options.forEach((option, index) => {
      const div = document.createElement("div");
      div.className = "option-item";
      div.innerHTML = `
                  <input type="text" 
                         placeholder="選択肢のテキスト" 
                         value="${option.text}"
                         onchange="questionCreator.updateOption(${index}, this.value)">
                  <input type="text" 
                         placeholder="ID" 
                         value="${option.id}"
                         onchange="questionCreator.updateOptionId(${index}, this.value)">
                  <button onclick="questionCreator.removeOption(${index})">削除</button>
              `;
      container.appendChild(div);
    });
  }

  /**
   * 選択肢のテキストを更新
   * @param {number} index 選択肢のインデックス
   * @param {string} text 新しいテキスト
   */
  updateOption(index, text) {
    this.options[index].text = text;
    this.updatePreview();
  }

  /**
   * 選択肢のIDを更新
   * @param {number} index 選択肢のインデックス
   * @param {string} id 新しいID
   */
  updateOptionId(index, id) {
    if (this.validateOptionId(id)) {
      this.options[index].id = id;
      this.updatePreview();
    } else {
      alert("無効なIDです。別のIDを指定してください。");
    }
  }

  /**
   * 選択肢IDの重複チェック
   * @param {string} id チェックするID
   * @returns {boolean} 有効なIDならtrue
   */
  validateOptionId(id) {
    if (!id) return false;
    const existingIds = this.options
      .filter((_, idx) => idx !== index)
      .map((option) => option.id);
    return !existingIds.includes(id);
  }

  /**
   * 選択肢を削除
   * @param {number} index 削除する選択肢のインデックス
   */
  removeOption(index) {
    this.options.splice(index, 1);
    this.renderOptions();
    this.updatePreview();
  }

  /**
   * プレビューを更新
   */
  updatePreview() {
    const preview = document.getElementById("preview");
    const questionType = document.getElementById("question-type").value;
    const questionText = document.getElementById("question-text").value;

    preview.innerHTML = `
              <div class="preview-question">
                  <h3>${questionText}</h3>
                  <div class="preview-options">
                      ${this.getPreviewOptions(questionType)}
                  </div>
              </div>
          `;

    this.applyCustomSettings();
    this.loadWorkData(); // 例題と解説を読み込む
  }

  /**
   * プレビュー用の選択肢HTMLを生成
   * @param {string} questionType 問題タイプ
   * @returns {string} HTML文字列
   */
  getPreviewOptions(questionType) {
    switch (questionType) {
      case "選択式":
        return this.options
          .map(
            (option) => `
                      <div class="preview-option">
                          <input type="radio" name="answer" id="${option.id}">
                          <label for="${option.id}">${option.text}</label>
                      </div>
                  `
          )
          .join("");
      case "複数選択式":
        return this.options
          .map(
            (option) => `
                      <div class="preview-option">
                          <input type="checkbox" id="${option.id}">
                          <label for="${option.id}">${option.text}</label>
                      </div>
                  `
          )
          .join("");
      case "短文記述式":
        return '<textarea rows="2" placeholder="答えを入力してください"></textarea>';
      case "長文記述式":
        return '<textarea rows="4" placeholder="答えを入力してください"></textarea>';
      case "記述式":
        return '<textarea rows="6" placeholder="詳細な答えを入力してください"></textarea>';
      default:
        return "";
    }
  }

  /**
   * プレビューにカスタム設定（フォント・色など）を適用
   */
  applyCustomSettings() {
    const preview = document.querySelector(".preview-question");
    if (!preview) return;

    const settings = {
      fontFamily: document.getElementById("font-family").value,
      fontSize: `${document.getElementById("font-size").value}px`,
      textColor: document.getElementById("text-color").value,
      backgroundColor: document.getElementById("background-color").value,
      buttonColor: document.getElementById("button-color").value,
      buttonText: document.getElementById("button-text-color").value,
    };

    preview.style.fontFamily = settings.fontFamily;
    preview.style.fontSize = settings.fontSize;
    preview.style.color = settings.textColor;
    preview.style.backgroundColor = settings.backgroundColor;
  }

  /**
   * 問題を保存
   */
  saveQuestion() {
    const question = this.exportQuestion();
    const questions = this.getSavedQuestions();
    questions.push(question);
    localStorage.setItem("savedQuestions", JSON.stringify(questions));
    alert("問題が保存されました。");
  }

  /**
   * 問題を読み込み
   */
  loadQuestion() {
    const questions = this.getSavedQuestions();
    if (questions.length === 0) {
      alert("保存された問題はありません。");
      return;
    }

    const index = prompt(
      "読み込む問題の番号を入力してください（1-" +
        questions.length +
        "）："
    );
    if (index && index >= 1 && index <= questions.length) {
      this.importQuestion(questions[index - 1]);
    }
  }

  /**
   * 問題をJSONファイルとしてエクスポート
   */
  exportJSON() {
    const question = this.exportQuestion();
    const blob = new Blob([JSON.stringify(question, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "question.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * 保存済みの問題リストを取得
   * @returns {Array<Object>} 問題リスト
   */
  getSavedQuestions() {
    return JSON.parse(localStorage.getItem("savedQuestions") || "[]");
  }

  /**
   * 現在のフォーム内容を問題データとしてエクスポート
   * @returns {Object} 問題データ
   */
  exportQuestion() {
    return {
      questionId: document.getElementById("question-id").value,
      title: {
        mode: "custom",
        config: {
          title: document.getElementById("question-title").value,
          font: document.getElementById("font-family").value,
          "font-size": document.getElementById("font-size").value,
          "font-color": document.getElementById("text-color").value,
        },
      },
      qMode: {
        config: {
          mode: document.getElementById("question-type").value,
          thema: {
            "background-color":
              document.getElementById("background-color").value,
            "background-color_permit_gradation": false,
            "background-color_label":
              document.getElementById("background-color").value,
            "text-color": document.getElementById("text-color").value,
            "button-background-color":
              document.getElementById("button-color").value,
            "button-label-color":
              document.getElementById("button-text-color").value,
          },
        },
      },
      qData: {
        label: document.getElementById("question-text").value,
        options: this.options.reduce((acc, option) => {
          acc[option.id] = {
            id: option.id,
            label: option.text,
            IsCorrect:
              option.id ===
              document.getElementById("correct-answer").value,
          };
          return acc;
        }, {}),
        answer: {
          id: document.getElementById("correct-answer").value,
          exampleAnswer: document.getElementById("example-answer").value,
          explanation: document.getElementById("explanation").value,
        },
      },
    };
  }

  /**
   * 問題データをフォームにインポート
   * @param {Object} questionData インポートする問題データ
   */
  importQuestion(questionData) {
    document.getElementById("question-id").value =
      questionData.questionId;
    document.getElementById("question-type").value =
      questionData.qMode.config.mode;
    document.getElementById("question-title").value =
      questionData.title.config.title;
    document.getElementById("question-text").value =
      questionData.qData.label;
    document.getElementById("correct-answer").value =
      questionData.qData.answer.id;
    document.getElementById("example-answer").value =
      questionData.qData.answer.exampleAnswer || "";
    document.getElementById("explanation").value =
      questionData.qData.answer.explanation || "";

    this.options = Object.entries(questionData.qData.options).map(
      ([id, option]) => ({
        id,
        text: option.label,
      })
    );

    this.renderOptions();
    this.updatePreview();
  }

  /**
   * 保存済みの問題をlocalStorageから読み込む
   */
  loadSavedQuestions() {
    const savedQuestions = localStorage.getItem("savedQuestions");
    if (savedQuestions) {
      try {
        const questions = JSON.parse(savedQuestions);
        if (questions.length > 0) {
          this.importQuestion(questions[0]);
        }
      } catch (error) {
        console.error("保存された質問の読み込みに失敗しました:", error);
        alert("保存された質問の読み込みに失敗しました。");
      }
    }
  }

  /**
   * 例題と解説を外部JSONから読み込んで表示
   * ※パスやデータ構造は用途に応じて修正してください
   */
  async loadWorkData() {
    const response = await fetch('path/to/your/work-data.json'); // JSONファイルのパスを指定
    const workData = await response.json();

    // 例題と解説を表示
    const work = workData.works[0]; // 最初のワークを取得（必要に応じて変更）
    document.getElementById('work-example').innerText = work.example;
    document.getElementById('work-explanation').innerText = work.explanation;

    // ワークに関連する問題を表示
    const questionsContainer = document.getElementById('work-questions');
    questionsContainer.innerHTML = ''; // 既存の内容をクリア
    work.questions.forEach(question => {
      const questionElement = document.createElement('div');
      questionElement.innerText = question.title;
      questionsContainer.appendChild(questionElement);
    });
  }
}

// グローバルにインスタンスを公開
const questionCreator = new QuestionCreator();
window.questionCreator = questionCreator;