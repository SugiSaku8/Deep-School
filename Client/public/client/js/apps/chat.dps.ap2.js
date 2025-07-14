import { GeminiProcessor, CoachingSession, ChatHistoryManager } from "../chat/tm/model.mjs";

export const appMeta = {
  name: "chat",
  title: "ToasterMachine",
  icon: "re/ico/tm.png",
};

export function appInit(shell) {
  const processor = new GeminiProcessor();
  let session = null;
  const historyManager = new ChatHistoryManager("tm_chat_history");
  const root = document.getElementById("app-root");
  if (!root) {
    console.error("ChatApp: #app-rootが見つかりません");
    return;
  }
  root.innerHTML = `
    ...existing code...
  `;

  // 戻るボタン
  document.getElementById("chat-back-btn").onclick = () =>
    shell.loadApp("menu");

  // メッセージ表示 & 履歴保存
  function addMessage(text, sender) {
    const container = document.getElementById("messages-container");
    if (!container) return;
    const msg = document.createElement("div");
    msg.className = "message " + sender;
    msg.innerHTML =
      sender === "bot"
        ? marked.parse(text, { gfm: true, breaks: true, sanitize: true })
        : text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    // 履歴保存
    historyManager.addMessage(sender === "bot" ? "model" : "user", text);
  }

  // 履歴からメッセージを復元
  function restoreHistory() {
    const container = document.getElementById("messages-container");
    if (!container) return;
    container.innerHTML = "";
    const history = historyManager.getHistory(100);
    history.forEach(msg => {
      addMessage(msg.content, msg.role === "model" ? "bot" : "user");
    });
  }

  // スプラッシュ→チャット画面切替
  function showChat() {
    document.getElementById("splash").style.display = "none";
    document.getElementById("chat-container").style.display = "";
    restoreHistory();
  }
  function showSplash() {
    document.getElementById("splash").style.display = "";
    document.getElementById("chat-container").style.display = "none";
    document.getElementById("messages-container").innerHTML = "";
    historyManager.clear();
  }

  // 新規チャット
  document.getElementById("new-chat-btn").onclick = () => {
    if (confirm("チャットをクリアしますか？")) {
      session = null;
      showSplash();
    }
  };

  // スプラッシュ画面で質問送信
  document.getElementById("submit-btn").onclick = async () => {
    const input = document.getElementById("user-input");
    const question = input.value.trim();
    if (!question) return;
    input.value = "";
    showChat();
    addMessage(question, "user");
    addMessage("考え中...", "bot");
    session = new CoachingSession(processor);
    try {
      const firstReply = await session.startSession(question);
      document.querySelector(".message.bot").textContent = ""; // remove "考え中..."
      addMessage(firstReply, "bot");
    } catch (e) {
      addMessage("エラーが発生しました。もう一度お試しください。", "bot");
    }
  };

  // チャット画面でメッセージ送信
  document.getElementById("chat-submit-btn").onclick = async () => {
    const input = document.getElementById("chat-input");
    const msg = input.value.trim();
    if (!msg || !session) return;
    input.value = "";
    addMessage(msg, "user");
    addMessage("考え中...", "bot");
    try {
      const reply = await session.handleResponse(msg);
      document.querySelector(".message.bot:last-child").textContent = "";
      addMessage(reply, "bot");
    } catch (e) {
      addMessage("エラーが発生しました。もう一度お試しください。", "bot");
    }
  };

  // Enterキー送信
  document.getElementById("user-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("submit-btn").click();
    }
  });
  document.getElementById("chat-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      document.getElementById("chat-submit-btn").click();
    }
  });
}