// DOMとすべてのスクリプトの読み込みを待つ
window.addEventListener("load", () => {
  if (!window.chatManager) {
    console.error("チャットマネージャーの初期化に失敗しました。");
    return;
  }

  const chatManager = window.chatManager;
  chatManager.loadChat();

  // チャット送信ボタン
  document
    .getElementById("chat-submit-btn")
    .addEventListener("click", async () => {
      const input = document.getElementById("chat-input");
      const message = input.value.trim();

      if (message && !chatManager.isTyping()) {
        input.value = "";
        await chatManager.handleNewMessage(message);
      }
    });

  // チャット入力のEnterキー
  document
    .getElementById("chat-input")
    .addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && e.ctrlKey && !e.shiftKey) {
        e.preventDefault();
        const input = e.target;
        const message = input.value.trim();

        if (message && !chatManager.isTyping()) {
          input.value = "";
          await chatManager.handleNewMessage(message);
        }
      }
    });

  // 新規チャットボタン
  document.getElementById("new-chat-btn").addEventListener("click", () => {
    if (confirm("チャットをクリアしますか？")) {
      chatManager.clearChat();
      UIManager.showSplash();
    }
  });

  // スプラッシュ画面の送信ボタン
  document.getElementById("submit-btn").addEventListener("click", async () => {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message && !chatManager.isTyping()) {
      input.value = "";
      UIManager.showChat();
      await chatManager.handleNewMessage(message);
    }
  });

  // スプラッシュ画面の入力欄のEnterキー
  document
    .getElementById("user-input")
    .addEventListener("keydown", async (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const input = e.target;
        const message = input.value.trim();

        if (message && !chatManager.isTyping()) {
          input.value = "";
          UIManager.showChat();
          await chatManager.handleNewMessage(message);
        }
      }
    });

  // イベントリスナーの設定
  UIManager.elements.submitBtn.addEventListener("click", () => {
    const text = UIManager.elements.userInput.value.trim();
    if (!text) return;

    UIManager.showChat();
    chatManager.handleNewMessage(text);
    UIManager.elements.userInput.value = "";
  });

  UIManager.elements.chatSubmitBtn.addEventListener("click", () => {
    const text = UIManager.elements.chatInput.value.trim();
    if (!text) return;

    chatManager.handleNewMessage(text);
    UIManager.elements.chatInput.value = "";
  });

  UIManager.elements.newChatBtn.addEventListener("click", () => {
    UIManager.clearMessages();
    UIManager.showSplash();
    chatManager.clearChat();
  });

  // Enterキーのイベント処理
  UIManager.elements.userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      UIManager.elements.submitBtn.click();
    }
  });

  UIManager.elements.chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      UIManager.elements.chatSubmitBtn.click();
    }
  });
});
