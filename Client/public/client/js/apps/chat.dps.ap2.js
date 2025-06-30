import { GeminiProcessor, CoachingSession } from "../chat/tm/model.mjs";

export const appMeta = {
  name: "chat",
  title: "ToasterMachine",
  icon: "re/ico/tm.png"
};

export function appInit(shell) {
  const processor = new GeminiProcessor();
  const root = document.getElementById('app-root');
  if (!root) {
    console.error('ChatApp: #app-rootが見つかりません');
    return;
  }
  root.innerHTML = `
    <div class="splash-container" id="splash">
      <div class="card">
        <img src="re/ico/tm.cb.png" alt="ToasterMachine ロゴ" class="logo-img center-logo" />
        <div class="title_t chalk-text" data-lang-key="menu_toaster">ToasterMachine</div>
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
    
    <style>
    /* Enhanced chat styles */
    .splash-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }
    
    .splash-container::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
      opacity: 0.3;
      animation: float 20s ease-in-out infinite;
    }
    
    @keyframes float {
      0%, 100% { transform: translateY(0px) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(180deg); }
    }
    
    .card {
      background: rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      border: 1px solid rgba(255, 255, 255, 0.2);
      padding: 3rem;
      text-align: center;
      position: relative;
      z-index: 1;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      max-width: 500px;
      width: 90%;
    }
    
    .card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
      border-color: rgba(255, 255, 255, 0.3);
    }
    
    .title_t {
      font-size: 2.5rem;
      font-weight: 700;
      color: #fff;
      text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
      margin-bottom: 1.5rem;
      animation: titleGlow 3s ease-in-out infinite alternate;
    }
    
    @keyframes titleGlow {
      0% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.5); }
      100% { text-shadow: 0 4px 8px rgba(0, 0, 0, 0.3), 0 0 40px rgba(255, 255, 255, 0.8); }
    }
    
    .logo-img {
      width: 80px;
      height: 80px;
      margin: 1rem 0;
      border-radius: 16px;
      transition: all 0.3s ease;
    }
    
    .card:hover .logo-img {
      transform: scale(1.1) rotate(5deg);
      filter: brightness(1.1) contrast(1.1);
    }
    
    .version {
      font-size: 0.9rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 2rem;
    }
    
    .input-group {
      display: flex;
      gap: 12px;
      margin-top: 1.5rem;
    }
    
    .input-group input {
      flex: 1;
      padding: 12px 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 12px;
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-size: 1rem;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }
    
    .input-group input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
    
    .input-group input:focus {
      outline: none;
      border-color: rgba(255, 255, 255, 0.8);
      box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
      transform: scale(1.02);
    }
    
    .button-chalk {
      padding: 12px 24px;
      background: #ced8eb;
      border: none;
      border-radius: 12px;
      color: #222;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      position: relative;
      overflow: hidden;
    }
    
    .button-chalk:hover {
      background: #b7c6e0;
      color: #222;
    }
    
    .button-chalk:active {
      background: #a2b3d1;
      color: #222;
    }
    
    .chat-container {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      position: relative;
      padding-top: 80px;
    }
    
    .new-chat-btn {
      margin: 0 20px 20px 20px;
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.1);
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
    }
    
    .new-chat-btn:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
    }
    
    .messages-container {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
    
    .chat-input-container {
      padding: 20px;
      backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }
    
    .go-back-button {
      position: fixed;
      top: 20px;
      left: 20px;
      z-index: 1000;
      border: 2px solid rgba(255, 255, 255, 0.3);
      backdrop-filter: blur(10px);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }
    
    .go-back-button:hover {
      background: rgba(255, 255, 255, 0.2);
      border-color: rgba(255, 255, 255, 0.5);
      transform: translateY(-2px) scale(1.1);
    }
    
    .center-logo {
      display: block;
      margin: 0 auto 1.5rem auto;
      width: 100px;
      height: 100px;
    }
    
    /* Dark mode adjustments */
    @media (prefers-color-scheme: dark) {
      .card {
        background: rgba(0, 0, 0, 0.2);
        border-color: rgba(255, 255, 255, 0.1);
      }
      
      .card:hover {
        background: rgba(0, 0, 0, 0.3);
        border-color: rgba(255, 255, 255, 0.2);
      }
    }
    </style>
  `;

  // 戻るボタン
  document.getElementById('chat-back-btn').onclick = () => shell.loadApp('menu');

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