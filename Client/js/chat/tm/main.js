// DOMとすべてのスクリプトの読み込みを待つ
window.addEventListener("load", () => {
  /**
   * ChatManagerの初期化チェック
   */
  if (!window.chatManager) {
    console.error("チャットマネージャーの初期化に失敗しました。");
    return;
  }

  /** @type {ChatManager} */
  const chatManager = window.chatManager;
  chatManager.loadChat();

  /**
   * チャット送信ボタンのクリックイベント
   */
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

  /**
   * チャット入力欄のCtrl+Enterで送信
   */
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

  /**
   * 新規チャットボタンのクリックイベント
   * チャット履歴をクリアし、スプラッシュ画面を表示
   */
  document.getElementById("new-chat-btn").addEventListener("click", () => {
    if (confirm("チャットをクリアしますか？")) {
      chatManager.clearChat();
      UIManager.showSplash();
    }
  });

  /**
   * スプラッシュ画面の送信ボタンのクリックイベント
   */
  document.getElementById("submit-btn").addEventListener("click", async () => {
    const input = document.getElementById("user-input");
    const message = input.value.trim();

    if (message && !chatManager.isTyping()) {
      input.value = "";
      UIManager.showChat();
      await chatManager.handleNewMessage(message);
    }
  });

  /**
   * スプラッシュ画面の入力欄のEnterキーで送信
   */
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

  /**
   * UIManager経由の送信ボタンイベント
   */
  UIManager.elements.submitBtn.addEventListener("click", () => {
    const text = UIManager.elements.userInput.value.trim();
    if (!text) return;

    UIManager.showChat();
    chatManager.handleNewMessage(text);
    UIManager.elements.userInput.value = "";
  });

  /**
   * UIManager経由のチャット送信ボタンイベント
   */
  UIManager.elements.chatSubmitBtn.addEventListener("click", () => {
    const text = UIManager.elements.chatInput.value.trim();
    if (!text) return;

    chatManager.handleNewMessage(text);
    UIManager.elements.chatInput.value = "";
  });

  /**
   * UIManager経由の新規チャットボタンイベント
   */
  UIManager.elements.newChatBtn.addEventListener("click", () => {
    UIManager.clearMessages();
    UIManager.showSplash();
    chatManager.clearChat();
  });

  /**
   * UIManager経由のユーザー入力欄Enterキーイベント
   */
  UIManager.elements.userInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      UIManager.elements.submitBtn.click();
    }
  });

  /**
   * UIManager経由のチャット入力欄Enterキーイベント
   */
  UIManager.elements.chatInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      UIManager.elements.chatSubmitBtn.click();
    }
  });
});