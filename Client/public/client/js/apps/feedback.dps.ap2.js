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

    // Googleフォームの送信URLとフィールドIDを設定
    const googleFormUrl = 'https://docs.google.com/forms/d/e/1FAIpQLSd9_GO7Mdexh_lqZOcORCyACUR-Ng63DJ0Y42aOyUOvDDRs9A/viewform'; // YOUR_FORM_IDをGoogleフォームのIDに置き換えてください
    const formData = new FormData();
    formData.append('entry.2068037734', text); // YOUR_FIELD_IDをGoogleフォームのフィールドIDに置き換えてください

    // フォーム送信
    fetch(googleFormUrl, {
      method: 'POST',
      body: formData
    })
    .then(response => {
      if (response.ok) {
        resultDiv.textContent = 'フィードバックを送信しました。ご協力ありがとうございます！';
        document.getElementById('feedback-text').value = '';
      } else {
        resultDiv.textContent = 'フィードバックの送信に失敗しました。後でもう一度お試しください。';
      }
    })
    .catch(() => {
      resultDiv.textContent = 'フィードバックの送信に失敗しました。後でもう一度お試しください。';
    });
  };
}