// Deep-School Feedback App
// フィードバック送信アプリ

export function appInit(shell) {
  const root = document.getElementById('app-root');
  if (!root) {
    shell.log({from: 'dp.app.feedback.err', message: 'FeedbackApp: #app-rootが見つかりません', level: 'error'});
    return;
  }
  root.innerHTML = `
    <div class="page-container">
      <button class="go-back-button" id="feedback-back-btn">←</button>
      <h1 class="page-title">フィードバック</h1>
      <div class="feedback-section">
        <label for="feedback-text">ご意見・ご要望・不具合報告などをお聞かせください</label>
        <textarea id="feedback-text" rows="6" style="width:100%;font-size:1.1rem;"></textarea>
        <button class="pickramu-load-button primary" id="feedback-send-btn">送信</button>
        <div id="feedback-result" style="margin-top:1em;color:#007aff;"></div>
      </div>
    </div>
  `;

  document.getElementById('feedback-back-btn').onclick = () => shell.loadApp('menu');

  document.getElementById('feedback-send-btn').onclick = () => {
    const text = document.getElementById('feedback-text').value.trim();
    const resultDiv = document.getElementById('feedback-result');
    if (!text) {
      resultDiv.textContent = 'フィードバック内容を入力してください。';
      return;
    }
    // ローカルストレージに保存（後でAPI送信に拡張可）
    const feedbacks = JSON.parse(localStorage.getItem('deep-school-feedbacks') || '[]');
    feedbacks.unshift({
      text,
      date: new Date().toISOString(),
      user: window.googleUserName || '匿名',
      userId: window.googleUserId || 'anonymous'
    });
    localStorage.setItem('deep-school-feedbacks', JSON.stringify(feedbacks));
    resultDiv.textContent = 'フィードバックを送信しました。ご協力ありがとうございます！';
    document.getElementById('feedback-text').value = '';
  };
} 