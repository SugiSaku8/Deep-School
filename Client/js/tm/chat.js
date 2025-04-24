class ChatManager {
  constructor() {
    this.conversationHistory = [];
    this.isProcessing = false;
  }

  saveChat() {
    localStorage.setItem(
      "chatHistory",
      JSON.stringify(this.conversationHistory)
    );
  }

  loadChat() {
    const saved = localStorage.getItem("chatHistory");
    if (saved) {
      this.conversationHistory = JSON.parse(saved);
      this.conversationHistory.forEach((msg) => {
        this.displayMessage(msg.content, msg.role);
      });
    }
  }

  displayMessage(message, role) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `message ${role}`;

    if (role === "bot") {
      // マークダウンをHTMLに変換
      messageDiv.innerHTML = marked.parse(message, {
        gfm: true, // GitHub Flavored Markdown を有効化
        breaks: true, // 改行を <br> に変換
        sanitize: true, // XSS対策
        smartLists: true, // よりスマートなリスト出力
        smartypants: true, // スマートな句読点
      });

      // リンクを新しいタブで開くように設定
      messageDiv.querySelectorAll("a").forEach((link) => {
        link.setAttribute("target", "_blank");
        link.setAttribute("rel", "noopener noreferrer");
      });

      // コードブロックにコピーボタンを追加
      messageDiv.querySelectorAll("pre code").forEach((block) => {
        const copyButton = document.createElement("button");
        copyButton.className = "copy-code-btn";
        copyButton.textContent = "コピー";
        copyButton.onclick = () => {
          navigator.clipboard.writeText(block.textContent);
          copyButton.textContent = "コピー完了!";
          setTimeout(() => {
            copyButton.textContent = "コピー";
          }, 2000);
        };
        block.parentNode.insertBefore(copyButton, block);
      });
    } else {
      messageDiv.textContent = message;
    }

    document.getElementById("messages-container").appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: "smooth" });
  }

  displayLoadingIndicator() {
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "message bot typing-indicator";
    loadingDiv.innerHTML = "<span></span><span></span><span></span>";
    document.getElementById("messages-container").appendChild(loadingDiv);
    loadingDiv.scrollIntoView({ behavior: "smooth" });
    return loadingDiv;
  }

  async handleNewMessage(message) {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      this.displayMessage(message, "user");
      this.conversationHistory.push({ role: "user", content: message });

      const loadingIndicator = this.displayLoadingIndicator();

      // 会話履歴を含めてAPIを呼び出し
      const response = await GeminiAPI.sendMessage(
        message,
        this.conversationHistory.slice(-5) // 直近5件の会話履歴のみを使用
      );

      loadingIndicator.remove();

      this.displayMessage(response, "bot");
      this.conversationHistory.push({ role: "bot", content: response });
      this.saveChat();
    } catch (error) {
      console.error("Chat error:", error);
      this.displayMessage(
        "申し訳ありません。エラーが発生しました。もう一度お試しください。",
        "bot"
      );
    } finally {
      this.isProcessing = false;
    }
  }

  clearChat() {
    this.conversationHistory = [];
    GeminiAPI.remove();
    document.getElementById("messages-container").innerHTML = "";
    this.saveChat();
  }

  exportChat() {
    const exportData = {
      timestamp: new Date().toISOString(),
      history: this.conversationHistory,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `chat-history-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async importChat(file) {
    try {
      const text = await file.text();
      const importData = JSON.parse(text);

      if (importData.history && Array.isArray(importData.history)) {
        this.clearChat();
        this.conversationHistory = importData.history;
        this.conversationHistory.forEach((msg) => {
          this.displayMessage(msg.content, msg.role);
        });
        this.saveChat();
        return true;
      }
    } catch (error) {
      console.error("Import error:", error);
      return false;
    }
  }

  isTyping() {
    return this.isProcessing;
  }

  getConversationHistory() {
    return this.conversationHistory;
  }

  displayError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "message bot error";
    errorDiv.textContent = message;
    document.getElementById("messages-container").appendChild(errorDiv);
    errorDiv.scrollIntoView({ behavior: "smooth" });

    // エラーメッセージを3秒後に消す
    setTimeout(() => {
      errorDiv.remove();
    }, 3000);
  }
}

window.chatManager = new ChatManager();
