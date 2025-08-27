import Dialog from '../dialog.js';

export function showDialog(options) {
  const defaultOptions = {
    title: 'お知らせ',
    message: '',
    buttons: [
      {
        text: 'OK',
        onClick: () => {}
      }
    ]
  };

  const dialogOptions = { ...defaultOptions, ...options };
  new Dialog(dialogOptions).show();
}

export function showAlert(message, title = 'お知らせ') {
  showDialog({
    title,
    message,
    buttons: [
      {
        text: 'OK',
        onClick: () => {}
      }
    ]
  });
}

export function showConfirm(message, onConfirm, title = '確認') {
  showDialog({
    title,
    message,
    buttons: [
      {
        text: 'キャンセル',
        onClick: () => {}
      },
      {
        text: 'OK',
        onClick: onConfirm
      }
    ]
  });
}
