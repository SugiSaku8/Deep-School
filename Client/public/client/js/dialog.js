// Import styles
import '../css/dialog.css';

class Dialog {
  constructor(options) {
    this.options = options;
    this.createDialog();
  }

  createDialog() {
    // Create dialog container
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'dialog-container';
    
    // Create dialog content
    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';
    
    // Add dialog title if provided
    if (this.options.title) {
      const title = document.createElement('h2');
      title.textContent = this.options.title;
      dialogContent.appendChild(title);
    }
    
    // Add dialog message
    const message = document.createElement('div');
    message.className = 'dialog-message';
    message.innerHTML = this.options.message;
    dialogContent.appendChild(message);
    
    // Add buttons
    const actions = document.createElement('div');
    actions.className = 'actions';
    
    const buttons = this.options.buttons || [
      { text: 'OK', onClick: () => {} }
    ];
    
    buttons.forEach((button, index) => {
      const btn = document.createElement('button');
      btn.className = `button ${index === buttons.length - 1 ? 'primary' : ''}`;
      btn.textContent = button.text;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        if (typeof button.onClick === 'function') {
          button.onClick();
        }
        this.hide();
      });
      actions.appendChild(btn);
    });
    
    dialogContent.appendChild(actions);
    dialogContainer.appendChild(dialogContent);
    document.body.appendChild(dialogContainer);
    
    // Close on escape key
    this.handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        this.hide();
      }
    };
    
    document.addEventListener('keydown', this.handleKeyDown);
    
    this.dialogContainer = dialogContainer;
    this.dialogContent = dialogContent;
    
    // Focus the first button for better accessibility
    const firstButton = this.dialogContent.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  }
  
  show() {
    if (this.dialogContainer) {
      this.dialogContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  }
  
  hide() {
    if (this.dialogContainer) {
      this.dialogContainer.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
  
  destroy() {
    if (this.dialogContainer) {
      document.removeEventListener('keydown', this.handleKeyDown);
      this.dialogContainer.parentNode.removeChild(this.dialogContainer);
      this.dialogContainer = null;
      document.body.style.overflow = '';
    }
  }
}

export default Dialog;