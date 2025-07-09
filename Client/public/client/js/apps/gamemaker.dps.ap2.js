// --- Apple HIG風グローバルCSSを動的に挿入 ---
(function addAppleHIGStyle() {
  if (document.getElementById('apple-hig-style')) return;
  const style = document.createElement('style');
  style.id = 'apple-hig-style';
  style.textContent = `
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Noto Sans JP', 'Helvetica Neue', Arial, sans-serif;
      background: linear-gradient(120deg, #f8fafc 0%, #e9eff5 100%);
      min-height: 100vh;
      width: 100vw;
      overflow-x: hidden;
    }
    #app-root, .page-container {
      min-height: 100vh;
      width: 100vw;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      justify-content: flex-start;
      box-sizing: border-box;
    }
    .gm-main-layout {
      display: flex;
      flex-direction: row;
      gap: 2.5rem;
      width: 100vw;
      max-width: 100vw;
      min-height: 70vh;
      align-items: flex-start;
      justify-content: center;
      margin: 0 auto;
      padding: 2.5rem 2vw 2.5rem 2vw;
      box-sizing: border-box;
    }
    .gm-main-col {
      background: rgba(255,255,255,0.97);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(60,60,60,0.10), 0 1.5px 4px rgba(0,0,0,0.04);
      padding: 2.2rem 2rem 2rem 2rem;
      flex: 1 1 0;
      min-width: 320px;
      max-width: 600px;
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
      position: relative;
    }
    .gm-main-col.preview {
      max-width: 520px;
      min-width: 320px;
      align-items: center;
      justify-content: flex-start;
    }
    .card {
      background: rgba(255,255,255,0.95);
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(60,60,60,0.10), 0 1.5px 4px rgba(0,0,0,0.04);
      padding: 2.5rem 2.5rem 2rem 2.5rem;
      margin: 1.5rem 0;
      max-width: 900px;
      width: 100%;
      position: relative;
      transition: box-shadow 0.2s;
    }
    .card:focus-within, .card:hover {
      box-shadow: 0 12px 40px rgba(60,60,60,0.16), 0 2px 8px rgba(0,0,0,0.06);
    }
    .title {
      font-size: 2.2rem;
      font-weight: 700;
      letter-spacing: -0.01em;
      margin-bottom: 0.5rem;
      color: #222;
      text-align: left;
    }
    .desc {
      font-size: 1.15rem;
      color: #555;
      text-align: left;
      margin-bottom: 1.5rem;
    }
    .mode-select {
      display: flex;
      gap: 1.2rem;
      justify-content: flex-start;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }
    .pickramu-load-button {
      font-size: 1.08rem;
      font-weight: 600;
      border: none;
      border-radius: 12px;
      padding: 0.7em 1.6em;
      margin: 0.2em 0;
      background: linear-gradient(90deg, #e0e7ef 0%, #f7fafc 100%);
      color: #222;
      box-shadow: 0 1.5px 4px rgba(0,0,0,0.04);
      cursor: pointer;
      transition: background 0.2s, box-shadow 0.2s;
      outline: none;
    }
    .pickramu-load-button.primary {
      background: linear-gradient(90deg, #4f8cff 0%, #2cb4ad 100%);
      color: #fff;
      box-shadow: 0 2px 8px rgba(44,180,173,0.10);
    }
    .pickramu-load-button.secondary {
      background: #f3f6fa;
      color: #2cb4ad;
      border: 1.5px solid #e0e7ef;
    }
    .pickramu-load-button:active {
      filter: brightness(0.97);
    }
    .section-title {
      font-size: 1.2rem;
      font-weight: 600;
      color: #2cb4ad;
      margin-bottom: 0.5rem;
      margin-top: 1.5rem;
      text-align: left;
    }
    .recent-projects {
      margin-top: 1.5rem;
      width: 100%;
    }
    .project-list {
      list-style: none;
      padding: 0;
      margin: 0;
      width: 100%;
    }
    .project-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.7em 1em;
      border-radius: 10px;
      background: #f7fafc;
      margin-bottom: 0.7em;
      font-size: 1.05rem;
      box-shadow: 0 1px 2px rgba(44,180,173,0.04);
      transition: background 0.2s;
    }
    .project-item.empty {
      background: none;
      color: #aaa;
      justify-content: center;
    }
    .copyright {
      font-size: 0.95rem;
      color: #aaa;
      text-align: center;
      margin-top: 1.5rem;
    }
    @media (max-width: 1100px) {
      .gm-main-layout {
        flex-direction: column;
        gap: 2rem;
        padding: 1.2rem 1vw 1.2rem 1vw;
      }
      .gm-main-col, .gm-main-col.preview {
        max-width: 98vw;
        min-width: 0;
        width: 100%;
      }
    }
    @media (max-width: 600px) {
      .card {
        padding: 1.2rem 0.7rem 1.2rem 0.7rem;
        max-width: 98vw;
      }
      .title {
        font-size: 1.3rem;
      }
      .desc {
        font-size: 1rem;
      }
      .gm-main-layout {
        flex-direction: column;
        gap: 1rem;
        padding: 0.5rem 0.2rem 0.5rem 0.2rem;
      }
      .gm-main-col, .gm-main-col.preview {
        padding: 1rem 0.5rem;
        border-radius: 14px;
      }
    }
  `;
  document.head.appendChild(style);
})();
// GameMakerアプリ（gamemaker.dps.ap2.js）
// Deep-Schoolデフォルト搭載 2Dゲーム制作アプリ
// Apple HIG準拠・講座/創造モード・アクセシビリティ配慮

import { t, LANG_DATA } from '../core/lang.js';
import { CURRENT_LANG } from '../core/config.js';

export const appMeta = {
  name: "gamemaker",
  title: "GameMaker",
  icon: "re/icon/game.svg" // 仮アイコン
};

// プロジェクト管理（ローカルストレージ）
const PROJECTS_KEY = 'gamemaker_projects_v1';
function loadProjects() {
  try {
    return JSON.parse(localStorage.getItem(PROJECTS_KEY) || '[]');
  } catch { return []; }
}
function saveProjects(projects) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
}
function addProject(project) {
  const projects = loadProjects();
  projects.unshift(project);
  saveProjects(projects.slice(0, 10)); // 最大10件
}

// --- バージョン管理・履歴 ---
function addProjectVersion(project) {
  const versionsKey = `gamemaker_versions_${project.id}`;
  let versions = [];
  try { versions = JSON.parse(localStorage.getItem(versionsKey) || '[]'); } catch {}
  const now = new Date().toISOString();
  versions.unshift({ ...project, savedAt: now });
  localStorage.setItem(versionsKey, JSON.stringify(versions.slice(0, 20)));
}
function getProjectVersions(projectId) {
  const versionsKey = `gamemaker_versions_${projectId}`;
  try { return JSON.parse(localStorage.getItem(versionsKey) || '[]'); } catch { return []; }
}

export function appInit(shell) {
  shell.log({from: 'dp.app.gamemaker.out', message: 'GameMaker: 初期化開始', level: 'info'});

  // 初期化時にCURRENT_LANGをlocalStorageから取得
  let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
  if (lang !== CURRENT_LANG) {
    window.CURRENT_LANG = lang;
  }

  // レッスンデータを外部JSONから読み込む
  window.LESSONS = null;
  fetch('lessons.json')
    .then(res => res.json())
    .then(data => {
      window.LESSONS = data;
      renderHome();
      shell.log({from: 'dp.app.gamemaker.out', message: 'LESSONS loaded', level: 'info'});
    })
    .catch(e => {
      shell.log({from: 'dp.app.gamemaker.out', message: 'LESSONS load failed: '+e, level: 'error'});
      window.LESSONS = [];
      renderHome();
    });

  // 画面描画関数
  function renderHome() {
    const root = document.getElementById('app-root');
    if (!root) return;
    const projects = loadProjects();
    root.innerHTML = `
      <div class="page-container" id="gamemaker-app" role="main" aria-label="GameMakerホーム画面" style="min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;">
        <header class="card" style="width:100%;max-width:480px;">
          <h1 class="title" id="gm-title">${LANG_DATA[lang] && LANG_DATA[lang].gamemaker_title ? t('gamemaker_title', lang) : 'GameMaker'}</h1>
          <p class="desc">${LANG_DATA[lang] && LANG_DATA[lang].gamemaker_desc ? t('gamemaker_desc', lang) : '2Dゲームを作ろう！モードを選んでスタート'}</p>
          <button class="pickramu-load-button secondary" id="gm-lang-btn" style="position:absolute;right:1.5rem;top:1.5rem;z-index:2;">${lang==='ja'?'EN':'JA'}</button>
        </header>
        <main class="card" style="width:100%;max-width:480px;display:flex;flex-direction:column;align-items:center;">
          <div class="mode-select" role="group" aria-label="モード選択" style="width:100%;justify-content:space-between;gap:1.5rem;margin-bottom:2.5rem;">
            <button class="pickramu-load-button primary" id="gm-lesson-btn" aria-label="講座モード (L)" accesskey="l" style="flex:1;min-width:120px;">${LANG_DATA[lang] && LANG_DATA[lang].lesson_mode ? t('lesson_mode', lang) : '講座モード'}</button>
            <button class="pickramu-load-button secondary" id="gm-create-btn" aria-label="創造モード (C)" accesskey="c" style="flex:1;min-width:120px;">${LANG_DATA[lang] && LANG_DATA[lang].create_mode ? t('create_mode', lang) : '創造モード'}</button>
          </div>
          <button class="pickramu-load-button primary" id="gm-import-drive-btn" aria-label="Google Driveからインポート (I)" accesskey="i" style="width:100%;margin-bottom:2rem;">${LANG_DATA[lang] && LANG_DATA[lang].import_from_drive ? t('import_from_drive', lang) : 'Google Driveからインポート'}</button>
          <div class="recent-projects" id="gm-recent-projects" role="region" aria-label="最近のプロジェクト" style="width:100%;">
            <h2 class="section-title" style="margin-bottom:0.7rem;">${LANG_DATA[lang] && LANG_DATA[lang].recent_projects ? t('recent_projects', lang) : '最近のプロジェクト'}</h2>
            <ul class="project-list" id="gm-project-list" role="list">
              ${projects.length === 0
                ? `<li class="project-item empty" role="listitem">${LANG_DATA[lang] && LANG_DATA[lang].no_projects ? t('no_projects', lang) : 'プロジェクトはまだありません'}</li>`
                : projects.map(p => `<li class="project-item" role="listitem"><span style="font-weight:500;">${p.name}</span> <button class="pickramu-load-button secondary gm-load-btn" data-id="${p.id}" aria-label="${p.name}を開く" style="margin-left:1.2rem;">${LANG_DATA[lang] && LANG_DATA[lang].open ? t('open', lang) : '開く'}</button></li>`).join('')}
            </ul>
          </div>
        </main>
        <footer class="card" style="width:100%;max-width:480px;background:transparent;box-shadow:none;margin-top:0.5rem;">
          <p class="copyright">${LANG_DATA[lang] && LANG_DATA[lang].copyright ? t('copyright', lang) : 'Copyright ©2024 Deep-School. All rights reserved.'}</p>
        </footer>
      </div>
    `;
    // 言語切替ボタン
    const langBtn = document.getElementById('gm-lang-btn');
    if (langBtn) langBtn.onclick = () => {
      const nextLang = lang === 'ja' ? 'en' : 'ja';
      localStorage.setItem('gamemaker_lang', nextLang);
      location.reload();
    };
    // イベント: 講座モード
    const lessonBtn = document.getElementById('gm-lesson-btn');
    if (lessonBtn) lessonBtn.onclick = () => renderLesson();
    // イベント: 創造モード
    const createBtn = document.getElementById('gm-create-btn');
    if (createBtn) createBtn.onclick = () => renderCreate();
    // プロジェクト読み込み
    document.querySelectorAll('.gm-load-btn').forEach(btn => {
      btn.onclick = () => {
        const id = btn.getAttribute('data-id');
        const project = loadProjects().find(p => p.id === id);
        if (project) renderCreate(project);
      };
    });
    // Google Driveからインポート
    const importBtn = document.getElementById('gm-import-drive-btn');
    if (importBtn) importBtn.onclick = async () => {
      importBtn.disabled = true;
      importBtn.textContent = '取得中...';
      const files = await listDriveProjects();
      importBtn.disabled = false;
      importBtn.textContent = 'Google Driveからインポート';
      if (!files.length) {
        alert('Google Drive上にインポート可能なプロジェクトが見つかりませんでした');
        return;
      }
      // 選択ダイアログ
      const fileName = prompt('インポートするプロジェクトを選択してください:\n' + files.map((f,i)=>`${i+1}: ${f.name}`).join('\n'));
      const idx = Number(fileName) - 1;
      if (isNaN(idx) || idx < 0 || idx >= files.length) return;
      const file = files[idx];
      const project = await downloadDriveProject(file.id);
      if (project && project.id && project.name) {
        addProject(project);
        alert('Google Driveからプロジェクトをインポートしました');
        renderHome();
      } else {
        alert('インポートに失敗しました');
      }
    };
    // キーボードショートカット
    addSingleKeyListener('keydown', function(e) {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === 'l') document.getElementById('gm-lesson-btn')?.click();
      if (e.key === 'c') document.getElementById('gm-create-btn')?.click();
      if (e.key === 'i') document.getElementById('gm-import-drive-btn')?.click();
    });
  }

  function renderLesson(stepIdx = null) {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    if (!window.LESSONS) {
      const root = document.getElementById('app-root');
      if (root) root.innerHTML = '<div class="page-container"><div class="card" style="text-align:center;">Loading lessons...</div></div>';
      return;
    }
    const steps = window.LESSONS;
    const root = document.getElementById('app-root');
    if (!Array.isArray(steps) || steps.length === 0) {
      if (root) root.innerHTML = '<div class="card">レッスンデータがありません</div>';
      return;
    }
    if (stepIdx === null) stepIdx = Number(localStorage.getItem('gamemaker_lesson_progress') || 0);
    if (stepIdx < 0 || stepIdx >= steps.length) stepIdx = 0;
    const step = steps[stepIdx];
    const progress = Math.round(((stepIdx+1)/steps.length)*100);
    root.innerHTML = `
      <div class="page-container" id="gm-lesson-mode">
        <header class="card" style="width:100%;max-width:900px;position:relative;">
          <button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る" style="position:absolute;left:1.2rem;top:1.2rem;z-index:2;">← ホーム</button>
          <h1 class="title" style="margin-top:0.5rem;">講座モード</h1>
        </header>
        <main class="card" style="width:100%;max-width:900px;">
          <div class="lesson-content">
            <h2 style="text-align:center;margin-bottom:1.2rem;">
              <span class="step-title" style="font-size:1.25rem;font-weight:600;">${step.title[lang] || step.title.ja}</span>
              <span class="step-count" style="font-size:1rem;color:#2cb4ad;margin-left:0.7em;">(${stepIdx+1}/${steps.length})</span>
            </h2>
            <p class="step-desc" style="text-align:center;color:#555;margin-bottom:1.5rem;">${step.desc[lang] || step.desc.ja}</p>
            <div class="progress-bar" aria-label="進捗バー" style="background:#e0e7ef;border-radius:8px;height:18px;position:relative;margin-bottom:1.5rem;">
              <div class="progress" style="width: ${progress}%;background:linear-gradient(90deg,#4f8cff,#2cb4ad);height:100%;border-radius:8px;"></div>
              <span class="progress-percent" style="position:absolute;right:12px;top:0;color:#222;font-size:0.98rem;line-height:18px;">${progress}%</span>
            </div>
            <div class="lesson-nav" style="display:flex;gap:1.2rem;justify-content:center;margin-bottom:2rem;">
              <button class="pickramu-load-button secondary" id="gm-prev-step" ${stepIdx===0?'disabled':''} style="display:flex;align-items:center;gap:0.5em;">
                <span style="font-size:1.2em;">⬅️</span> 前へ
              </button>
              <button class="pickramu-load-button primary" id="gm-next-step" ${stepIdx===steps.length-1?'disabled':''} style="display:flex;align-items:center;gap:0.5em;">
                次へ <span style="font-size:1.2em;">➡️</span>
              </button>
              <button class="pickramu-load-button secondary" id="gm-progress-report-btn" style="display:flex;align-items:center;gap:0.5em;">
                <span style="font-size:1.2em;">📈</span> 進捗レポート
              </button>
            </div>
            <div class="ai-support-panel" style="background:#f7fafc;border-radius:18px;box-shadow:0 2px 8px rgba(44,180,173,0.07);padding:1.2rem 1rem 1.5rem 1rem;margin-bottom:0.5rem;">
              <div style="display:flex;align-items:center;gap:0.7em;margin-bottom:1em;">
                <span style="font-size:1.5em;">🤖</span>
                <strong style="font-size:1.1em;">AIサポート</strong>
              </div>
              <div class="ai-message" aria-live="polite" role="status" style="background:#fff;border-radius:12px;padding:1em 1.2em;margin-bottom:1.2em;box-shadow:0 1px 4px rgba(44,180,173,0.06);display:flex;align-items:center;gap:0.7em;min-height:2.5em;">
                <span style="font-size:1.3em;">💡</span>
                <span id="ai-message-text">困ったらAIに質問しよう！</span>
              </div>
              <div class="ai-btn-row" style="display:flex;flex-wrap:wrap;gap:0.7em;justify-content:center;">
                <button class="pickramu-load-button primary" id="gm-ai-ask-btn" aria-label="AIに質問" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">💬</span> 質問
                </button>
                <button class="pickramu-load-button secondary" id="gm-ai-hint-btn" aria-label="ヒント例を表示" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">💡</span> ヒント
                </button>
                <button class="pickramu-load-button secondary" id="gm-ai-faq-btn" aria-label="よくある質問を表示" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">❓</span> FAQ
                </button>
                <button class="pickramu-load-button secondary" id="gm-ai-clear-btn" aria-label="AIサポートをクリア" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">🧹</span> クリア
                </button>
                <button class="pickramu-load-button secondary" id="gm-ai-copy-btn" aria-label="AIサポートをコピー" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">📋</span> コピー
                </button>
                <button class="pickramu-load-button secondary" id="gm-ai-speak-btn" aria-label="AIサポートを音声で読み上げ" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">🔊</span> 音声
                </button>
                <button class="pickramu-load-button primary" id="gm-ai-guide-btn" aria-label="AIガイド自動生成" style="display:flex;align-items:center;gap:0.5em;min-width:110px;">
                  <span style="font-size:1.2em;">📝</span> ガイド
                </button>
              </div>
            </div>
            <div class="lesson-hints-faqs" style="margin-top:1.2em;">
              <div style="display:flex;gap:1.5em;justify-content:center;flex-wrap:wrap;">
                <div style="min-width:120px;">
                  <div style="font-weight:600;color:#2cb4ad;margin-bottom:0.3em;">ヒント</div>
                  <ul style="padding-left:1.2em;margin:0;">
                    ${(step.hints||[]).map(h=>`<li style='font-size:0.98em;color:#555;'>${h[lang]||h.ja}</li>`).join('')}
                  </ul>
                </div>
                <div style="min-width:120px;">
                  <div style="font-weight:600;color:#2cb4ad;margin-bottom:0.3em;">FAQ</div>
                  <ul style="padding-left:1.2em;margin:0;">
                    ${(step.faqs||[]).map(f=>`<li style='font-size:0.98em;color:#555;'>${f[lang]||f.ja}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    const prevBtn = document.getElementById('gm-prev-step');
    if (prevBtn) prevBtn.onclick = () => { localStorage.setItem('gamemaker_lesson_progress', Math.max(0, stepIdx-1)); renderLesson(Math.max(0, stepIdx-1)); };
    const nextBtn = document.getElementById('gm-next-step');
    if (nextBtn) nextBtn.onclick = () => { localStorage.setItem('gamemaker_lesson_progress', Math.min(steps.length-1, stepIdx+1)); renderLesson(Math.min(steps.length-1, stepIdx+1)); };
    const aiAskBtn = document.getElementById('gm-ai-ask-btn');
    if (aiAskBtn) aiAskBtn.onclick = async () => {
      const question = prompt('AIに質問したい内容を入力してください');
      if (!question) return;
      aiMsg.textContent = 'AI: 回答生成中...';
      let GeminiAPI = window.GeminiAPI;
      if (!GeminiAPI && window.chatManager && window.chatManager.GeminiAPI) {
        GeminiAPI = window.chatManager.GeminiAPI;
      }
      if (!GeminiAPI) {
        aiMsg.textContent = 'AI: GeminiAPIが利用できません。';
        return;
      }
      try {
        const answer = await GeminiAPI.sendMessage(question, []);
        aiMsg.textContent = 'AI: ' + answer;
      } catch (e) {
        aiMsg.textContent = 'AI: エラーが発生しました: ' + (e.message || e);
      }
    };
    const aiHintBtn = document.getElementById('gm-ai-hint-btn');
    if (aiHintBtn) aiHintBtn.onclick = () => {
      aiMsg.textContent = (step.hints && step.hints.length) ? step.hints.map(h=>h[lang]||h.ja).join(' / ') : 'ヒントはありません';
    };
    const aiFaqBtn = document.getElementById('gm-ai-faq-btn');
    if (aiFaqBtn) aiFaqBtn.onclick = () => {
      aiMsg.textContent = (step.faqs && step.faqs.length) ? step.faqs.map(f=>f[lang]||f.ja).join(' / ') : 'FAQはありません';
    };
    const aiClearBtn = document.getElementById('gm-ai-clear-btn');
    if (aiClearBtn) aiClearBtn.onclick = () => {
      aiMsg.textContent = '困ったらAIに質問しよう！';
    };
    const aiCopyBtn = document.getElementById('gm-ai-copy-btn');
    if (aiCopyBtn) aiCopyBtn.onclick = () => {
      navigator.clipboard.writeText(aiMsg.textContent || '').then(()=>{
        aiCopyBtn.textContent = 'コピーしました';
        setTimeout(()=>{aiCopyBtn.textContent = '📋 コピー';}, 1200);
      });
    };
    const aiSpeakBtn = document.getElementById('gm-ai-speak-btn');
    if (aiSpeakBtn) aiSpeakBtn.onclick = () => {
      if (window.speechSynthesis) {
        const utter = new window.SpeechSynthesisUtterance(aiMsg.textContent || '');
        utter.lang = lang === 'en' ? 'en-US' : 'ja-JP';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    };
    const aiGuideBtn = document.getElementById('gm-ai-guide-btn');
    if (aiGuideBtn) aiGuideBtn.onclick = () => {
      aiMsg.textContent = step.aiGuide[lang] || step.aiGuide.ja;
    };
    const resetProgressBtn = document.getElementById('gm-reset-progress-btn');
    if (resetProgressBtn) resetProgressBtn.onclick = () => { localStorage.setItem('gamemaker_lesson_progress', 0); renderLesson(0); };
    const progressReportBtn = document.getElementById('gm-progress-report-btn');
    if (progressReportBtn) progressReportBtn.onclick = () => {
      const progress = Math.round(((stepIdx+1)/steps.length)*100);
      let history = [];
      try { history = JSON.parse(localStorage.getItem('gamemaker_lesson_history')||'[]'); } catch {}
      history.unshift({ step: stepIdx+1, date: new Date().toLocaleString() });
      localStorage.setItem('gamemaker_lesson_history', JSON.stringify(history.slice(0, 20)));
      let msg = `現在の進捗: ${progress}%\n\n履歴:`;
      msg += history.map(h=>`ステップ${h.step} - ${h.date}`).join('\n');
      alert(msg);
    };
    // キーボード操作サポート
    const aiBtns = document.querySelectorAll('.ai-btn-row .pickramu-load-button');
    aiBtns.forEach((btn, idx) => {
      btn.tabIndex = 0;
      btn.onkeydown = e => {
        if (e.key === 'Enter' || e.key === ' ') btn.click();
        if (e.key === 'ArrowRight' || (e.key === 'Tab' && !e.shiftKey)) {
          e.preventDefault();
          aiBtns[(idx+1)%aiBtns.length].focus();
        }
        if (e.key === 'ArrowLeft' || (e.key === 'Tab' && e.shiftKey)) {
          e.preventDefault();
          aiBtns[(idx-1+aiBtns.length)%aiBtns.length].focus();
        }
      };
    });
  }

  function renderCreate(loadedProject = null) {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    // 仮アセットデータ（今後は状態管理/保存と連携）
    let assets = loadedProject?.assets || [
      { id: 1, type: 'image', name: 'キャラクター画像1.png' },
      { id: 2, type: 'sound', name: 'ジャンプ音.mp3' }
    ];
    let projectName = loadedProject?.name || '';
    // スクラッチ型ブロック構造
    let scratchBlocks = loadedProject?.scratchBlocks || [];
    let codeValue = loadedProject?.codeValue || '';
    // 横分割レイアウト
    root.innerHTML = `
      <div class="page-container" id="gm-create-mode">
        <div class="gm-main-layout">
          <div class="gm-main-col" style="min-width:340px;max-width:600px;">
            <header style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.2rem;">
              <button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る">← ホーム</button>
              <h1 class="title" style="margin:0;">創造モード</h1>
            </header>
            <div class="editor-switch" style="display:flex;gap:1rem;margin-bottom:1.2rem;">
              <button class="pickramu-load-button primary" id="gm-scratch-btn">スクラッチ型</button>
              <button class="pickramu-load-button secondary" id="gm-code-btn">コード型</button>
            </div>
            <div class="editor-panel" id="gm-editor-panel">エディタ（仮）</div>
            <div class="asset-panel">
              <div class="asset-panel-header" style="display:flex;align-items:center;justify-content:space-between;">
                <span>アセット管理</span>
                <button class="pickramu-load-button primary gm-add-btn" id="gm-add-asset-btn">＋追加</button>
              </div>
              <ul class="asset-list" id="gm-asset-list"></ul>
            </div>
            <div class="project-actions" style="margin-top:1.2rem;display:flex;gap:1rem;align-items:center;">
              <button class="pickramu-load-button primary" id="gm-save-project-btn">プロジェクトを保存</button>
            </div>
          </div>
          <div class="gm-main-col preview" style="min-width:320px;max-width:520px;">
            <div style="display:flex;align-items:center;gap:1.2rem;margin-bottom:1.2rem;">
              <span style="font-size:1.5em;">🖥️</span>
              <span style="font-size:1.15em;font-weight:600;">プレビュー & サポート</span>
            </div>
            <div id="gm-preview-panel" style="width:100%;max-width:420px;"></div>
            <div class="support-btns" style="margin-top:1.5rem;display:flex;flex-wrap:wrap;gap:0.7em;">
              <button class="pickramu-load-button primary" id="gm-ai-support-btn">AIサポート</button>
              <button class="pickramu-load-button secondary">SCRサポート</button>
              <button class="pickramu-load-button primary" id="gm-toaster-btn" style="background:#2cb4ad;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(44,180,173,0.12);font-weight:600;">ToasterMachineに質問</button>
              <span id="gm-toaster-status" style="margin-left:8px;color:#2cb4ad;font-weight:500;"></span>
            </div>
          </div>
        </div>
      </div>
    `;
    // ...既存のイベント・エディタ描画・アセット管理・AIサポート・プレビュー描画はそのまま...
    // プレビュー描画を右カラムに反映
    function updatePreview() {
      const previewPanel = document.getElementById('gm-preview-panel');
      if (previewPanel) {
        previewPanel.innerHTML = '';
        // 既存のrenderPreviewのcanvas部分だけをここに描画
        const canvas = document.createElement('canvas');
        canvas.id = 'gm-preview-canvas';
        canvas.width = 320;
        canvas.height = 240;
        canvas.style.background = '#222';
        canvas.style.borderRadius = '12px';
        previewPanel.appendChild(canvas);
        // ...既存のプレビュー描画ロジックをここで呼ぶ...
      }
    }
    // ...既存のrenderEditor, updateAssetList, AIサポート, ToasterMachine連携なども同様に...
    // ... existing code ...
  }

  // renderPreview: 必ずホームボタンを表示
  function renderPreview(assets, scratchBlocksTree = [], codeValue = '') {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `
      <div class="page-container" id="gm-preview-mode">
        <header class="card" style="width:100%;max-width:900px;position:relative;">
          <button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る" style="position:absolute;left:1.2rem;top:1.2rem;z-index:2;">← ホーム</button>
          <h1 class="title" style="margin-top:0.5rem;">ゲームプレビュー</h1>
        </header>
        <main class="card" style="width:100%;max-width:900px;">
          <!-- ...rest of preview UI... -->
        </main>
      </div>
    `;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    // ...既存のプレビュー描画ロジック...
  }

  // renderTestUI: ホームボタン追加
  function renderTestUI() {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `<div class="page-container"><header class="card" style="position:relative;"><button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る" style="position:absolute;left:1.2rem;top:1.2rem;z-index:2;">← ホーム</button><h1>Test & QA</h1></header><main class="card"><button class="pickramu-load-button primary" id="run-test-btn">Run Tests</button><ul id="test-result-list"></ul></main></div>`;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    // ... existing code ...
  }

  // renderFeedbackUI: ホームボタン追加
  function renderFeedbackUI() {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `<div class="page-container"><header class="card" style="position:relative;"><button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る" style="position:absolute;left:1.2rem;top:1.2rem;z-index:2;">← ホーム</button><h1>Feedback</h1></header><main class="card"><textarea id="feedback-text" rows="5" style="width:100%;font-size:1.1rem;"></textarea><button class="pickramu-load-button primary" id="send-feedback-btn">送信</button><div id="feedback-result"></div></main></div>`;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    // ... existing code ...
  }

  // renderAdminUI: ホームボタン追加
  function renderAdminUI() {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    let allProgress = [];
    try { allProgress = JSON.parse(localStorage.getItem('gamemaker_lesson_history')||'[]'); } catch {}
    let feedback = [];
    try { feedback = JSON.parse(localStorage.getItem('gamemaker_feedback')||'[]'); } catch {}
    root.innerHTML = `<div class="page-container"><header class="card" style="position:relative;"><button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る" style="position:absolute;left:1.2rem;top:1.2rem;z-index:2;">← ホーム</button><h1>管理者ダッシュボード</h1></header><main class="card"><h2>進捗履歴</h2><ul>${allProgress.map(h=>`<li>ステップ${h.step} - ${h.date}</li>`).join('')||'<li>データなし</li>'}</ul><h2>フィードバック</h2><ul>${feedback.map(f=>`<li>${f.text} <span style='color:#888;'>(${f.date})</span></li>`).join('')||'<li>データなし</li>'}</ul></main></div>`;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    // ... existing code ...
  }
  // --- レッスンデータ（外部JSONで管理） ---
  // window.LESSONS = null; // グローバルで管理
} // ← appInitの閉じカッコ
// --- CodeMirror CDN動的ロード ---
function loadCodeMirrorIfNeeded(cb) {
  if (window.CodeMirror) return cb();
  // CSS
  if (!document.getElementById('cm-css')) {
    const link = document.createElement('link');
    link.id = 'cm-css';
    link.rel = 'stylesheet';
    link.href = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.css';
    document.head.appendChild(link);
  }
  // JS
  const jsUrls = [
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/codemirror.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/mode/javascript/javascript.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/edit/closebrackets.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.16/addon/display/placeholder.min.js'
  ];
  let loaded = 0;
  jsUrls.forEach(url => {
    if ([...document.scripts].some(s=>s.src===url)) { loaded++; if (loaded===jsUrls.length) cb(); return; }
    const script = document.createElement('script');
    script.src = url;
    script.onload = () => { loaded++; if (loaded===jsUrls.length) cb(); };
    document.body.appendChild(script);
  });
}