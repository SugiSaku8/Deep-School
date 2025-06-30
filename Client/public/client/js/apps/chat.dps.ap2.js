import { GeminiProcessor, CoachingSession } from "../chat/tm/model.mjs";

export const appMeta = {
  name: "chat",
  title: "ToasterMachine",
  icon: "re/ico/tm.png"
};

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('ChatApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    <div class="splash-container" id="splash">
      <div class="card">
        <div class="title_t chalk-text" data-lang-key="menu_toaster">ToasterMachine</div>
        <img src="re/ico/tm.cb.png" alt="ロゴ" class="logo-img" />
        <div class="version">v0.1.2</div>
        <div class="input-group">
          <input id="user-input" type="text" placeholder="ここに質問を入力" data-lang-key="ask_placeholder" />
          <button id="submit-btn" class="button-chalk" data-lang-key="send">送信</button>
        </div>
      </div>
    </div>
    <div id="chat-container" class="chat-container" style="display:none;">
      <button id="new-chat-btn" class="new-chat-btn button-chalk" data-lang-key="new_chat">新規チャット</button>
      <div id="messages-container" class="messages-container"></div>
      <div class="chat-input-container">
        <div class="input-group">
          <input id="chat-input" type="text" placeholder="メッセージを入力" data-lang-key="chat_placeholder" />
          <button id="chat-submit-btn" class="button-chalk" data-lang-key="send">送信</button>
        </div>
      </div>
    </div>
    <button class="go-back-button button-chalk" id="chat-back-btn" data-lang-key="back">←</button>
  `;

  // 戻るボタン
  document.getElementById('chat-back-btn').onclick = () => shell.loadApp('menu');

  // --- ToasterMachine コーチングセッションの初期化 ---
  const processor = new GeminiProcessor(/* APIキーは内部で取得 or 設定 */);
  let session = null;

  // メッセージ表示
  function addMessage(text, sender) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.innerHTML = sender === 'bot'
      ? marked.parse(text, { gfm: true, breaks: true, sanitize: true })
      : text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }

  // スプラッシュ→チャット画面切替
  function showChat() {
    document.getElementById('splash').style.display = 'none';
    document.getElementById('chat-container').style.display = '';
  }
  function showSplash() {
    document.getElementById('splash').style.display = '';
    document.getElementById('chat-container').style.display = 'none';
    document.getElementById('messages-container').innerHTML = '';
  }

  // 新規チャット
  document.getElementById('new-chat-btn').onclick = () => {
    if (confirm("チャットをクリアしますか？")) {
      session = null;
      showSplash();
    }
  };

  // スプラッシュ画面で質問送信
  document.getElementById('submit-btn').onclick = async () => {
    const input = document.getElementById('user-input');
    const question = input.value.trim();
    if (!question) return;
    input.value = '';
    showChat();
    addMessage(question, 'user');
    addMessage("考え中...", 'bot');
    session = new CoachingSession(processor);
    try {
      const firstReply = await session.startSession(question);
      document.querySelector('.message.bot').textContent = ""; // remove "考え中..."
      addMessage(firstReply, 'bot');
    } catch (e) {
      addMessage("エラーが発生しました。もう一度お試しください。", 'bot');
    }
  };

  // チャット画面でメッセージ送信
  document.getElementById('chat-submit-btn').onclick = async () => {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg || !session) return;
    input.value = '';
    addMessage(msg, 'user');
    addMessage("考え中...", 'bot');
    try {
      const reply = await session.handleResponse(msg);
      document.querySelector('.message.bot:last-child').textContent = "";
      addMessage(reply, 'bot');
    } catch (e) {
      addMessage("エラーが発生しました。もう一度お試しください。", 'bot');
    }
  };

  // Enterキー送信
  document.getElementById('user-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('submit-btn').click();
    }
  });
  document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      document.getElementById('chat-submit-btn').click();
    }
  });
}