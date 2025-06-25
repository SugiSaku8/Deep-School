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
        <div class="version">v0.0.1-Demo</div>
        <div class="input-group">
          <input id="user-input" type="text" placeholder="ここに質問を入力" data-lang-key="ask_placeholder" />
          <button id="submit-btn" class="button-chalk" data-lang-key="send">送信</button>
        </div>
      </div>
    </div>
    <div id="chat-container" class="chat-container">
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

  // チャット送信イベント
  document.getElementById('submit-btn').onclick = () => {
    const input = document.getElementById('user-input');
    if (input && input.value.trim()) {
      addMessage(input.value, 'user');
      input.value = '';
    }
  };
  document.getElementById('chat-submit-btn').onclick = () => {
    const input = document.getElementById('chat-input');
    if (input && input.value.trim()) {
      addMessage(input.value, 'user');
      input.value = '';
    }
  };
  document.getElementById('new-chat-btn').onclick = () => {
    document.getElementById('messages-container').innerHTML = '';
  };

  function addMessage(text, sender) {
    const container = document.getElementById('messages-container');
    if (!container) return;
    const msg = document.createElement('div');
    msg.className = 'message ' + sender;
    msg.textContent = text;
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
  }
} 