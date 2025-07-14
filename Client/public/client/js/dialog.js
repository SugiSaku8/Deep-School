class Dialog {
  constructor(options) {
    this.options = options;
    this.createDialog();
  }

  createDialog() {
    const dialogContainer = document.createElement('div');
    dialogContainer.className = 'dialog-container';

    const dialogContent = document.createElement('div');
    dialogContent.className = 'dialog-content';

    const title = document.createElement('h2');
    title.textContent = this.options.title;

    const message = document.createElement('p');
    message.textContent = this.options.message;

    const actions = document.createElement('div');
    actions.className = 'actions';

    const buttons = this.options.buttons.map((button) => {
      const btn = document.createElement('button');
      btn.className = 'button';
      btn.textContent = button.text;
      btn.addEventListener('click', () => {
        button.onClick && button.onClick();
        this.hideDialog();
      });
      return btn;
    });

    buttons.forEach((button) => {
      actions.appendChild(button);
    });

    dialogContent.appendChild(title);
    dialogContent.appendChild(message);
    dialogContent.appendChild(actions);

    dialogContainer.appendChild(dialogContent);

    document.body.appendChild(dialogContainer);

    this.dialogContainer = dialogContainer;
  }

  show() {
    this.dialogContainer.style.display = 'flex';
  }

  hide() {
    this.dialogContainer.style.display = 'none';
  }

  destroy() {
    this.dialogContainer.parentNode.removeChild(this.dialogContainer);
  }
}

export default Dialog;