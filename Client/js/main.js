// DOMとすべてのスクリプトの読み込みを待つ
window.addEventListener("load", () => {
  // 初期化チェック
  if (!window.chatManager) {
    console.error("チャットマネージャーの初期化に失敗しました。");
    return;
  }

  if (!window.UIManager) {
    console.error("UIManagerの初期化に失敗しました。");
    return;
  }

  const chatManager = window.chatManager;
  const UIManager = window.UIManager;

  // チャットの初期化
  chatManager.loadChat();

  // 要素の取得と存在チェック
  const elements = {
    chatSubmitBtn: document.getElementById("chat-submit-btn"),
    chatInput: document.getElementById("chat-input"),
    newChatBtn: document.getElementById("new-chat-btn"),
    submitBtn: document.getElementById("submit-btn"),
    userInput: document.getElementById("user-input")
  };

  // 要素の存在チェック
  for (const [key, element] of Object.entries(elements)) {
    if (!element) {
      console.error(`要素 "${key}" が見つかりません。`);
      return;
    }
  }

  // チャット関連のイベントリスナー
  elements.chatSubmitBtn.addEventListener("click", async () => {
    const message = elements.chatInput.value.trim();
    if (message && !chatManager.isTyping()) {
      elements.chatInput.value = "";
      await chatManager.handleNewMessage(message);
    }
  });

  elements.chatInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = e.target.value.trim();
      if (message && !chatManager.isTyping()) {
        e.target.value = "";
        await chatManager.handleNewMessage(message);
      }
    }
  });

  // 新規チャットボタン
  elements.newChatBtn.addEventListener("click", () => {
    if (confirm("チャットをクリアしますか？")) {
      chatManager.clearChat();
      UIManager.showSplash();
      UIManager.clearMessages();
    }
  });

  // スプラッシュ画面関連のイベントリスナー
  elements.submitBtn.addEventListener("click", async () => {
    const message = elements.userInput.value.trim();
    if (message && !chatManager.isTyping()) {
      elements.userInput.value = "";
      UIManager.showChat();
      await chatManager.handleNewMessage(message);
    }
  });

  elements.userInput.addEventListener("keydown", async (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      const message = e.target.value.trim();
      if (message && !chatManager.isTyping()) {
        e.target.value = "";
        UIManager.showChat();
        await chatManager.handleNewMessage(message);
      }
    }
  });
});
