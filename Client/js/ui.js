class UIManager {
    static elements = {
        splash: document.getElementById('splash'),
        chatContainer: document.getElementById('chat-container'),
        messagesContainer: document.getElementById('messages-container'),
        userInput: document.getElementById('user-input'),
        chatInput: document.getElementById('chat-input'),
        submitBtn: document.getElementById('submit-btn'),
        chatSubmitBtn: document.getElementById('chat-submit-btn'),
        newChatBtn: document.getElementById('new-chat-btn')
    };

    static displayMessage(message, role) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        messageDiv.textContent = message;
        this.elements.messagesContainer.appendChild(messageDiv);
        messageDiv.scrollIntoView({ behavior: 'smooth' });
    }

    static showChat() {
        this.elements.splash.style.display = 'none';
        this.elements.chatContainer.style.display = 'flex';
    }

    static showSplash() {
        this.elements.splash.style.display = 'flex';
        this.elements.chatContainer.style.display = 'none';
    }

    static clearMessages() {
        this.elements.messagesContainer.innerHTML = '';
    }

    static scrollToBottom() {
        this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
    }
}

window.UIManager = UIManager; 