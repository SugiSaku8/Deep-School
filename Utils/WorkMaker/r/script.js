class QuestionCreator {
    constructor() {
      this.options = [];
      this.initializeEventListeners();
      this.loadSavedQuestions();
    }

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
    }

    generateOptionId() {
      const prefix = "option_";
      const existingIds = this.options.map((option) =>
        parseInt(option.id.replace(prefix, ""))
      );
      const nextId = Math.max(...existingIds, 0) + 1;
      return `${prefix}${nextId}`;
    }

    addOption() {
      const id = this.generateOptionId();
      this.options.push({
        id,
        text: `選択肢${this.options.length + 1}`,
      });
      this.renderOptions();
      this.updatePreview();
    }

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

    updateOption(index, text) {
      this.options[index].text = text;
      this.updatePreview();
    }

    updateOptionId(index, id) {
      if (this.validateOptionId(id)) {
        this.options[index].id = id;
        this.updatePreview();
      } else {
        alert("無効なIDです。別のIDを指定してください。");
      }
    }

    validateOptionId(id) {
      if (!id) return false;
      const existingIds = this.options
        .filter((_, idx) => idx !== index)
        .map((option) => option.id);
      return !existingIds.includes(id);
    }

    removeOption(index) {
      this.options.splice(index, 1);
      this.renderOptions();
      this.updatePreview();
    }

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
    }

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

    saveQuestion() {
      const question = this.exportQuestion();
      const questions = this.getSavedQuestions();
      questions.push(question);
      localStorage.setItem("savedQuestions", JSON.stringify(questions));
      alert("問題が保存されました。");
    }

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

    getSavedQuestions() {
      return JSON.parse(localStorage.getItem("savedQuestions") || "[]");
    }

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

    loadSavedQuestions() {
      // ローカルストレージから保存された質問を読み込むロジックをここに実装します。
      const savedQuestions = localStorage.getItem("savedQuestions");
      if (savedQuestions) {
        try {
          const questions = JSON.parse(savedQuestions);
          // 読み込んだ質問を処理する
          // 例：最初の質問を読み込む
          if (questions.length > 0) {
            this.importQuestion(questions[0]);
          }
        } catch (error) {
          console.error("保存された質問の読み込みに失敗しました:", error);
          alert("保存された質問の読み込みに失敗しました。");
        }
      }
    }
  }

  const questionCreator = new QuestionCreator();
  window.questionCreator = questionCreator;