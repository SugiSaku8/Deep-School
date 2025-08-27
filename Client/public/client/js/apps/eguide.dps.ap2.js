export const appMeta = {
  name: "eguide",
  title: "eGuide",
  icon: "re/ico/eguide.svg"
};
import { showAlert } from './utils/dialog';


export const appHtml = `
  <div id="ai-teacher-app" style="max-width: 1200px; margin: 0 auto; padding: 20px;">
    <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <h1 class="page-title" style="margin: 0;">AI ティーチングアシスタント</h1>
      <div class="header-actions" style="display: flex; gap: 12px;">
        <button class="button-chalk" id="new-lesson-btn" style="background: #4CAF50; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-weight: 600;">新しいレッスン</button>
        <button class="button-chalk" id="eguide-back" style="background: #f5f5f5; color: #333; border: 1px solid #ddd; padding: 8px 16px; border-radius: 6px;">戻る</button>
      </div>
    </div>

    <div class="ai-teacher-container" style="display: grid; grid-template-columns: 300px 1fr; gap: 24px;">
      <!-- サイドバー -->
      <div class="sidebar" style="background: #f9f9f9; border-radius: 12px; padding: 20px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <h3 style="margin-top: 0; color: #333;">レッスン一覧</h3>
        <div id="lesson-list" style="margin-bottom: 20px;">
          <!-- 動的にレッスンが追加されます -->
        </div>
        <div class="ai-assistant">
          <h4 style="margin-bottom: 12px; color: #555;">AI アシスタント</h4>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <input type="text" id="user-question" placeholder="質問を入力..." style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 6px;">
            <button id="ask-ai-btn" style="background: #2cb4ad; color: white; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer;">質問する</button>
          </div>
          <div id="ai-response" style="background: white; padding: 12px; border-radius: 8px; min-height: 100px; border: 1px solid #eee;">
            AIの回答がここに表示されます...
          </div>
        </div>
      </div>

      <!-- メインコンテンツ -->
      <div class="main-content" style="background: white; border-radius: 12px; padding: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <div id="lesson-content" style="min-height: 500px; display: flex; flex-direction: column;">
          <div id="welcome-message" style="text-align: center; margin: auto; color: #666;">
            <div style="font-size: 24px; margin-bottom: 16px;">👋 ようこそ！</div>
            <p>左のメニューからレッスンを選択するか、新しいレッスンを作成してください。</p>
          </div>
          <div id="current-lesson" style="display: none;">
            <div id="lesson-header" style="margin-bottom: 20px; padding-bottom: 12px; border-bottom: 1px solid #eee;">
              <h2 id="lesson-title" style="margin: 0 0 8px 0; color: #333;"></h2>
              <div id="lesson-meta" style="display: flex; gap: 16px; color: #777; font-size: 14px;">
                <span id="lesson-date"></span>
                <span id="lesson-duration"></span>
              </div>
            </div>
            <div id="lesson-body" style="flex: 1; line-height: 1.6; color: #333;">
              <!-- レッスン内容が動的に挿入されます -->
            </div>
            <div class="lesson-actions" style="margin-top: 24px; display: flex; justify-content: space-between;">
              <button id="prev-lesson" class="button-chalk" style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px;">前へ</button>
              <div>
                <button id="take-quiz" class="button-chalk" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 6px; margin-right: 8px;">クイズを受ける</button>
                <button id="complete-lesson" class="button-chalk" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 6px;">レッスンを完了</button>
              </div>
              <button id="next-lesson" class="button-chalk" style="padding: 8px 16px; background: #f5f5f5; border: 1px solid #ddd; border-radius: 6px;">次へ</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- モーダル -->
  <div id="quiz-modal" class="modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; justify-content: center; align-items: center;">
    <div class="modal-content" style="background: white; padding: 24px; border-radius: 12px; width: 80%; max-width: 600px; max-height: 80vh; overflow-y: auto;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
        <h3 style="margin: 0;">理解度チェック</h3>
        <span id="close-quiz" style="font-size: 24px; cursor: pointer;">&times;</span>
      </div>
      <div id="quiz-container">
        <!-- クイズの内容が動的に挿入されます -->
      </div>
      <div style="margin-top: 20px; text-align: right;">
        <button id="submit-quiz" class="button-chalk" style="padding: 8px 24px; background: #4CAF50; color: white; border: none; border-radius: 6px;">回答を提出</button>
      </div>
    </div>
  </div>
`;

// サンプルレッスンデータ
const sampleLessons = [
  {
    id: 'intro-ai',
    title: 'AIの基本',
    date: '2023-11-01',
    duration: '15分',
    content: `
      <h3>AIとは？</h3>
      <p>人工知能（AI）は、人間の知的な振る舞いを模倣するコンピュータシステムです。機械学習や深層学習などの技術を活用して、複雑な問題を解決します。</p>
      
      <h3>AIの種類</h3>
      <ul>
        <li><strong>機械学習</strong>: データから学習して予測や判断を行う</li>
        <li><strong>ディープラーニング</strong>: ニューラルネットワークを使用した高度な機械学習</li>
        <li><strong>自然言語処理</strong>: 人間の言語を理解・生成する技術</li>
      </ul>
    `,
    quiz: [
      {
        question: 'AIとは何の略ですか？',
        options: ['Artificial Intelligence', 'Automated Information', 'Advanced Internet'],
        answer: 0
      }
    ]
  }
];

export function appInit(shell) {
  // 状態管理
  let currentLessonIndex = 0;
  let completedLessons = new Set();
  let lessons = [...sampleLessons];
  
  // DOM要素の取得
  const backBtn = document.getElementById('eguide-back');
  const newLessonBtn = document.getElementById('new-lesson-btn');
  const lessonList = document.getElementById('lesson-list');
  const askAiBtn = document.getElementById('ask-ai-btn');
  const userQuestionInput = document.getElementById('user-question');
  const aiResponse = document.getElementById('ai-response');

  // イベントリスナーの設定
  backBtn.onclick = () => shell.loadApp('menu');
  askAiBtn.onclick = askAI;
  
  // EnterキーでAIに質問
  userQuestionInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') askAI();
  });

  // レッスン一覧を表示
  function renderLessonList() {
    lessonList.innerHTML = '';
    lessons.forEach((lesson, index) => {
      const lessonItem = document.createElement('div');
      lessonItem.className = 'lesson-item';
      lessonItem.style.padding = '10px';
      lessonItem.style.margin = '5px 0';
      lessonItem.style.borderRadius = '6px';
      lessonItem.style.cursor = 'pointer';
      lessonItem.style.background = completedLessons.has(lesson.id) ? '#e8f5e9' : '#fff';
      lessonItem.style.border = `1px solid ${currentLessonIndex === index ? '#4CAF50' : '#e0e0e0'}`;
      
      lessonItem.innerHTML = `
        <div style="font-weight: 500; margin-bottom: 4px;">${lesson.title}</div>
        <div style="font-size: 12px; color: #666;">${lesson.duration} • ${completedLessons.has(lesson.id) ? '✅ 完了' : '進行中'}</div>
      `;
      
      lessonItem.onclick = () => showLesson(index);
      lessonList.appendChild(lessonItem);
    });
  }
  
  // レッスンを表示
  function showLesson(index) {
    if (index < 0 || index >= lessons.length) return;
    
    currentLessonIndex = index;
    const lesson = lessons[index];
    
    // レッスン情報を表示
    document.getElementById('lesson-title').textContent = lesson.title;
    document.getElementById('lesson-date').textContent = `作成日: ${lesson.date}`;
    document.getElementById('lesson-duration').textContent = `所要時間: ${lesson.duration}`;
    document.getElementById('lesson-body').innerHTML = lesson.content;
    
    // ナビゲーションボタンの状態を更新
    document.getElementById('prev-lesson').disabled = index === 0;
    document.getElementById('next-lesson').disabled = index === lessons.length - 1;
    
    // クイズボタンの状態を更新
    const takeQuizBtn = document.getElementById('take-quiz');
    takeQuizBtn.disabled = !lesson.quiz || lesson.quiz.length === 0;
    takeQuizBtn.textContent = lesson.quiz ? 'クイズを受ける' : 'クイズはありません';
    
    // 完了ボタンの状態を更新
    const completeBtn = document.getElementById('complete-lesson');
    completeBtn.textContent = completedLessons.has(lesson.id) ? '完了済み ✅' : 'レッスンを完了';
    completeBtn.disabled = completedLessons.has(lesson.id);
    
    // 表示を切り替え
    document.getElementById('welcome-message').style.display = 'none';
    document.getElementById('current-lesson').style.display = 'flex';
    
    // レッスン一覧を更新
    renderLessonList();
  }
  
  // AIに質問
  function askAI() {
    const question = userQuestionInput.value.trim();
    if (!question) return;
    
    // ローディング表示
    aiResponse.textContent = '考え中...';
    askAiBtn.disabled = true;
    
    // AIに質問を送信
    if (window.chatManager?.geminiProcessor?.callGemini_U) {
      window.chatManager.geminiProcessor.callGemini_U(question)
        .then(response => {
          aiResponse.textContent = response || '回答を生成できませんでした。';
        })
        .catch(error => {
          aiResponse.textContent = `エラーが発生しました: ${error.message || error}`;
        })
        .finally(() => {
          askAiBtn.disabled = false;
        });
    } else {
      // ダミーの応答（開発用）
      setTimeout(() => {
        aiResponse.textContent = `「${question}」についての回答です。AIはデータに基づいて学習し、パターンを見つけ出します。`;
        askAiBtn.disabled = false;
      }, 1000);
    }
  }
  
  // クイズモーダルのイベントリスナー
  document.getElementById('close-quiz').onclick = () => {
    document.getElementById('quiz-modal').style.display = 'none';
  };
  
  document.getElementById('submit-quiz').onclick = submitQuiz;
  document.getElementById('take-quiz').onclick = showQuiz;
  document.getElementById('prev-lesson').onclick = () => showLesson(currentLessonIndex - 1);
  document.getElementById('next-lesson').onclick = () => showLesson(currentLessonIndex + 1);
  document.getElementById('complete-lesson').onclick = completeCurrentLesson;
  document.getElementById('new-lesson-btn').onclick = createNewLesson;
  
  // 初期表示
  renderLessonList();
  
  // クイズを表示
  function showQuiz() {
    const lesson = lessons[currentLessonIndex];
    if (!lesson.quiz || lesson.quiz.length === 0) {
      showAlert('このレッスンにはクイズがありません。', 'eGuide');
      return;
    }
    
    const quizContainer = document.getElementById('quiz-container');
    quizContainer.innerHTML = '';
    
    lesson.quiz.forEach((q, qIndex) => {
      const questionDiv = document.createElement('div');
      questionDiv.style.marginBottom = '20px';
      questionDiv.innerHTML = `
        <p style="font-weight: 500; margin-bottom: 10px;">${qIndex + 1}. ${q.question}</p>
        <div id="quiz-options-${qIndex}" style="display: flex; flex-direction: column; gap: 8px;">
          ${q.options.map((opt, optIndex) => `
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="radio" name="quiz-${qIndex}" value="${optIndex}" style="width: 16px; height: 16px;">
              ${opt}
            </label>
          `).join('')}
        </div>
      `;
      quizContainer.appendChild(questionDiv);
    });
    
    document.getElementById('quiz-modal').style.display = 'flex';
  }
  
  // クイズを提出
  function submitQuiz() {
    const lesson = lessons[currentLessonIndex];
    let score = 0;
    
    lesson.quiz.forEach((q, qIndex) => {
      const selectedOption = document.querySelector(`input[name="quiz-${qIndex}"]:checked`);
      if (selectedOption && parseInt(selectedOption.value) === q.answer) {
        score++;
      }
    });
    
    const percentage = Math.round((score / lesson.quiz.length) * 100);
    let message = `クイズの結果: ${score}問中${lesson.quiz.length}問正解 (${percentage}%)`;
    
    if (percentage >= 70) {
      message += '\n\n素晴らしい！このレッスンを完了しました。';
      completeCurrentLesson();
    } else {
      message += '\n\nもう一度復習してみましょう。';
    }
    
    showAlert(message);
    document.getElementById('quiz-modal').style.display = 'none';
  }
  
  // レッスンを完了
  function completeCurrentLesson() {
    const lessonId = lessons[currentLessonIndex].id;
    completedLessons.add(lessonId);
    
    // UIを更新
    const completeBtn = document.getElementById('complete-lesson');
    completeBtn.textContent = '完了済み ✅';
    completeBtn.disabled = true;
    
    // レッスン一覧を更新
    renderLessonList();
    
    // 次のレッスンがあれば表示
    if (currentLessonIndex < lessons.length - 1) {
      setTimeout(() => {
        showLesson(currentLessonIndex + 1);
      }, 1000);
    }
  }
  
  // 新しいレッスンをAIで作成
  async function createNewLesson() {
    const title = prompt('新しいレッスンのタイトルを入力してください:');
    if (!title) return;
    
    // ローディング表示
    const loadingMessage = document.createElement('div');
    loadingMessage.textContent = 'AIがレッスンを作成中です...';
    loadingMessage.style.position = 'fixed';
    loadingMessage.style.top = '50%';
    loadingMessage.style.left = '50%';
    loadingMessage.style.transform = 'translate(-50%, -50%)';
    loadingMessage.style.background = 'white';
    loadingMessage.style.padding = '20px';
    loadingMessage.style.borderRadius = '8px';
    loadingMessage.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    loadingMessage.style.zIndex = '1000';
    document.body.appendChild(loadingMessage);
    
    try {
      // AIにレッスン内容を生成させるプロンプト
      const prompt = `以下の要件に基づいて、教育用のレッスンコンテンツを作成してください。
      
      タイトル: ${title}
      
      以下の形式で出力してください：
      
      1. 導入: トピックの概要を簡潔に説明
      2. 主な内容: 3-5つの重要なポイントを箇条書きで
      3. 詳細説明: 各ポイントについて詳細に説明
      4. 例: 具体的な例を2-3つ
      5. まとめ: 学んだことの要約
      
      また、以下の3つのクイズ問題も作成してください。各問題には3つの選択肢と正解の番号を含めてください。
      
      出力は以下のJSON形式でお願いします：
      
      {
        "content": "HTML形式のレッスンコンテンツ",
        "quiz": [
          {
            "question": "質問文",
            "options": ["選択肢1", "選択肢2", "選択肢3"],
            "answer": 0
          }
        ]
      }`;
      
      // AIにリクエストを送信
      let aiResponse;
      if (window.chatManager?.geminiProcessor?.callGemini_U) {
        aiResponse = await window.chatManager.geminiProcessor.callGemini_U(prompt);
      } else {
        // 開発用のダミーレスポンス
        aiResponse = `{
          "content": "<h3>${title}について</h3><p>これはAIによって生成されたサンプルレッスンです。</p>",
          "quiz": [
            {
              "question": "${title}に関する質問です。",
              "options": ["正解の選択肢", "不正解1", "不正解2"],
              "answer": 0
            }
          ]
        }`;
      }
      
      // レスポンスをパース
      let lessonData;
      try {
        // JSON形式でない場合に備えて、JSON部分を抽出
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          lessonData = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('無効なレスポンス形式です');
        }
      } catch (e) {
        console.error('AIレスポンスのパースエラー:', e);
        lessonData = {
          content: `<h3>${title}</h3><p>AIによるレッスン生成中にエラーが発生しました。後でもう一度お試しください。</p>`,
          quiz: []
        };
      }
      
      // 新しいレッスンを作成
      const newLesson = {
        id: `lesson-${Date.now()}`,
        title: title,
        date: new Date().toISOString().split('T')[0],
        duration: '10分',
        content: lessonData.content || '<p>AIがレッスンを作成しました。内容を確認してください。</p>',
        quiz: lessonData.quiz || []
      };
      
      lessons.push(newLesson);
      renderLessonList();
      showLesson(lessons.length - 1);
      
    } catch (error) {
      console.error('レッスン作成エラー:', error);
      showAlert('レッスンの作成中にエラーが発生しました: ' + error.message,"eGuide");
    } finally {
      // ローディングメッセージを削除
      if (document.body.contains(loadingMessage)) {
        document.body.removeChild(loadingMessage);
      }
    }
  }
} 