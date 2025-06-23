export const appMeta = {
  name: "chat",
  title: "ToasterMachine チャット",
  icon: "re/ico/tm.png"
};

export const appHtml = `
  <div id="chat-app" class="popup">
    <div class="splash-container" id="splash">
      <div class="card">
        <div class="title_t chalk-text">ToasterMachine</div>
        <img src="re/ico/tm.cb.png" alt="ロゴ" class="logo-img" />
        <div class="version">v0.0.1-Demo</div>
        <div class="input-group">
          <input id="user-input" type="text" placeholder="ここに質問を入力" />
          <button id="submit-btn" class="button-chalk">送信</button>
        </div>
      </div>
    </div>
    <div id="chat-container" class="chat-container">
      <button id="new-chat-btn" class="new-chat-btn button-chalk">新規チャット</button>
      <div id="messages-container" class="messages-container"></div>
      <div class="chat-input-container">
        <div class="input-group">
          <input id="chat-input" type="text" placeholder="メッセージを入力" />
          <button id="chat-submit-btn" class="button-chalk">送信</button>
        </div>
      </div>
    </div>
    <button class="go-back-button button-chalk" id="chat-back">←</button>
  </div>
`;

export function appInit(shell) {
  document.getElementById('chat-back').onclick = () => shell.loadApp('menu');
  document.getElementById('new-chat-btn').onclick = () => {
    document.getElementById('messages-container').innerHTML = '';
    document.getElementById('splash').style.display = 'block';
    document.getElementById('chat-container').style.display = 'none';
  };
  document.getElementById('submit-btn').onclick = () => {
    const input = document.getElementById('user-input');
    const message = input.value.trim();
    if (message) {
      addMessage('user', message);
      input.value = '';
      document.getElementById('splash').style.display = 'none';
      document.getElementById('chat-container').style.display = 'block';
    }
  };
  document.getElementById('chat-submit-btn').onclick = () => {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    if (message) {
      addMessage('user', message);
      input.value = '';
    }
  };
  function addMessage(sender, text) {
    const msgDiv = document.createElement('div');
    msgDiv.className = sender === 'user' ? 'user-message' : 'bot-message';
    msgDiv.textContent = text;
    document.getElementById('messages-container').appendChild(msgDiv);
  }
} 