document.addEventListener("DOMContentLoaded", function () {
  class UIManager {
    static elements = {
      splash: document.getElementById("splash"),
      chatContainer: document.getElementById("chat-container"),
      messagesContainer: document.getElementById("messages-container"),
      userInput: document.getElementById("user-input"),
      chatInput: document.getElementById("chat-input"),
      submitBtn: document.getElementById("submit-btn"),
      chatSubmitBtn: document.getElementById("chat-submit-btn"),
      newChatBtn: document.getElementById("new-chat-btn"),
    };

    static displayMessage(message, role) {
      const messageDiv = document.createElement("div");
      messageDiv.className = `message ${role} chalk-text`;
      messageDiv.textContent = message;
      this.elements.messagesContainer.appendChild(messageDiv);
      messageDiv.scrollIntoView({ behavior: "smooth" });
    }

    static showChat() {
      this.elements.splash.style.display = "none";
      this.elements.chatContainer.style.display = "flex";
    }

    static showSplash() {
      this.elements.splash.style.display = "flex";
      this.elements.chatContainer.style.display = "none";
    }

    static clearMessages() {
      this.elements.messagesContainer.innerHTML = "";
    }

    static scrollToBottom() {
      this.elements.messagesContainer.scrollTop =
        this.elements.messagesContainer.scrollHeight;
    }
  }

  window.UIManager = UIManager;

  // APPLE風の洗練されたアニメーション例
  const actionBtn = document.querySelector('.action-btn');
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      actionBtn.animate([
        { transform: 'scale(1)', background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)' },
        { transform: 'scale(1.12)', background: 'linear-gradient(90deg, #00cec9 0%, #00b894 100%)' },
        { transform: 'scale(1)', background: 'linear-gradient(90deg, #00b894 0%, #00cec9 100%)' }
      ], {
        duration: 420,
        easing: 'cubic-bezier(.23,1.01,.32,1)'
      });
    });
  }

  // アイコン起点の動きデモ（全アイコンに適用）
  document.querySelectorAll('.menu-icon').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.animate([
        { transform: 'scale(1)', boxShadow: '0 2px 8px #0004' },
        { transform: 'scale(1.18)', boxShadow: '0 4px 16px #00b89488' },
        { transform: 'scale(1)', boxShadow: '0 2px 8px #0004' }
      ], {
        duration: 320,
        easing: 'cubic-bezier(.23,1.01,.32,1)'
      });
    });
  });
});
