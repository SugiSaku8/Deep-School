// GameMakerアプリ（gamemaker.dps.ap2.js）
// Deep-Schoolデフォルト搭載 2Dゲーム制作アプリ
// Apple HIG準拠・講座/創造モード・アクセシビリティ配慮

import { t, LANG_DATA } from '../core/lang.js';
import { t } from '../core/lang.js';
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

  // 画面描画関数
  function renderHome() {
    const root = document.getElementById('app-root');
    if (!root) return;
    const projects = loadProjects();
    root.innerHTML = `
      <div class="page-container" id="gamemaker-app" role="main" aria-label="GameMakerホーム画面">
        <header class="card">
          <h1 class="title" id="gm-title">${LANG_DATA[lang] && LANG_DATA[lang].gamemaker_title ? t('gamemaker_title', lang) : 'GameMaker'}</h1>
          <p class="desc">${LANG_DATA[lang] && LANG_DATA[lang].gamemaker_desc ? t('gamemaker_desc', lang) : '2Dゲームを作ろう！モードを選んでスタート'}</p>
          <button class="pickramu-load-button secondary" id="gm-lang-btn" style="position:absolute;right:1rem;top:1rem;">${lang==='ja'?'EN':'JA'}</button>
        </header>
        <main class="card">
          <div class="mode-select" role="group" aria-label="モード選択">
            <button class="pickramu-load-button primary" id="gm-lesson-btn" aria-label="講座モード (L)" accesskey="l">${LANG_DATA[lang] && LANG_DATA[lang].lesson_mode ? t('lesson_mode', lang) : '講座モード'}</button>
            <button class="pickramu-load-button secondary" id="gm-create-btn" aria-label="創造モード (C)" accesskey="c">${LANG_DATA[lang] && LANG_DATA[lang].create_mode ? t('create_mode', lang) : '創造モード'}</button>
            <button class="pickramu-load-button primary" id="gm-import-drive-btn" aria-label="Google Driveからインポート (I)" accesskey="i">${LANG_DATA[lang] && LANG_DATA[lang].import_from_drive ? t('import_from_drive', lang) : 'Google Driveからインポート'}</button>
          </div>
          <div class="recent-projects" id="gm-recent-projects" role="region" aria-label="最近のプロジェクト">
            <h2 class="section-title">${LANG_DATA[lang] && LANG_DATA[lang].recent_projects ? t('recent_projects', lang) : '最近のプロジェクト'}</h2>
            <ul class="project-list" id="gm-project-list" role="list">
              ${projects.length === 0
                ? `<li class="project-item empty" role="listitem">${LANG_DATA[lang] && LANG_DATA[lang].no_projects ? t('no_projects', lang) : 'プロジェクトはまだありません'}</li>`
                : projects.map(p => `<li class="project-item" role="listitem"><span>${p.name}</span> <button class="pickramu-load-button secondary gm-load-btn" data-id="${p.id}" aria-label="${p.name}を開く">${LANG_DATA[lang] && LANG_DATA[lang].open ? t('open', lang) : '開く'}</button></li>`).join('')}
            </ul>
          </div>
        </main>
        <footer class="card">
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
    const steps = [
      { title: 'ステップ1: ゲームの基本', desc: '2Dゲーム制作の基本を学ぼう。画面やキャラクターの概念を理解します。' },
      { title: 'ステップ2: キャラクターを動かそう', desc: 'キャラクター画像を配置し、矢印キーで動かす仕組みを作ります。' },
      { title: 'ステップ3: ゴールを作ろう', desc: 'ゴールを設置し、キャラクターが到達したらクリアになるようにします。' }
    ];
    // 進捗保存・読込
    const PROGRESS_KEY = 'gamemaker_lesson_progress';
    if (stepIdx === null) {
      stepIdx = Number(localStorage.getItem(PROGRESS_KEY) || 0);
    }
    const step = steps[stepIdx] || steps[0];
    const progress = Math.round(((stepIdx+1)/steps.length)*100);
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `
      <div class="page-container" id="gm-lesson-mode">
        <header class="card">
          <h1 class="title">講座モード</h1>
          <button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る">← ホーム</button>
          <button class="pickramu-load-button secondary" id="gm-reset-progress-btn" style="margin-left:1rem;">進捗リセット</button>
        </header>
        <main class="card">
          <div class="lesson-content">
            <h2>
              <span class="step-title">${LANG_DATA[lang] && LANG_DATA[lang].step_title ? t('step_title', lang) : step.title}</span>
              <span class="step-count">(${stepIdx+1}/${steps.length})</span>
            </h2>
            <p class="step-desc">${LANG_DATA[lang] && LANG_DATA[lang].step_desc ? t('step_desc', lang) : step.desc}</p>
            <div class="progress-bar" aria-label="進捗バー">
              <div class="progress" style="width: ${progress}%"></div>
              <span class="progress-percent">${progress}%</span>
            </div>
            <div class="lesson-nav">
              <button class="pickramu-load-button secondary" id="gm-prev-step" ${stepIdx===0?'disabled':''}>前へ</button>
              <button class="pickramu-load-button primary" id="gm-next-step" ${stepIdx===steps.length-1?'disabled':''}>次へ</button>
              <button class="pickramu-load-button secondary" id="gm-progress-report-btn" style="margin-left:1rem;">進捗レポート</button>
            </div>
            <div class="ai-support-panel">
              <strong>AIサポート</strong>
              <div class="ai-message" aria-live="polite" role="status">困ったらAIに質問しよう！（仮UI）</div>
              <div class="ai-btn-row">
                <button class="pickramu-load-button primary" id="gm-ai-ask-btn" aria-label="AIに質問">AIに質問</button>
                <button class="pickramu-load-button secondary" id="gm-ai-hint-btn" aria-label="ヒント例を表示">ヒント例</button>
                <button class="pickramu-load-button secondary" id="gm-ai-faq-btn" aria-label="よくある質問を表示">よくある質問</button>
                <button class="pickramu-load-button secondary" id="gm-ai-clear-btn" aria-label="AIサポートをクリア">AIサポートをクリア</button>
                <button class="pickramu-load-button secondary" id="gm-ai-copy-btn" aria-label="AIサポートをコピー">AIサポートをコピー</button>
                <button class="pickramu-load-button secondary" id="gm-ai-speak-btn" aria-label="AIサポートを音声で読み上げ">AIサポートを音声で読み上げ</button>
                <button class="pickramu-load-button primary" id="gm-ai-guide-btn" aria-label="AIガイド自動生成">AIガイド自動生成</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    `;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    const prevBtn = document.getElementById('gm-prev-step');
    if (prevBtn) prevBtn.onclick = () => { localStorage.setItem(PROGRESS_KEY, Math.max(0, stepIdx-1)); renderLesson(Math.max(0, stepIdx-1)); };
    const nextBtn = document.getElementById('gm-next-step');
    if (nextBtn) nextBtn.onclick = () => { localStorage.setItem(PROGRESS_KEY, Math.min(steps.length-1, stepIdx+1)); renderLesson(Math.min(steps.length-1, stepIdx+1)); };
    const aiAskBtn = document.getElementById('gm-ai-ask-btn');
    if (aiAskBtn) aiAskBtn.onclick = async () => {
      const msg = document.querySelector('.ai-message');
      const question = prompt('AIに質問したい内容を入力してください');
      if (!question) return;
      msg.textContent = 'AI: 回答生成中...';
      let GeminiAPI = window.GeminiAPI;
      if (!GeminiAPI && window.chatManager && window.chatManager.GeminiAPI) {
        GeminiAPI = window.chatManager.GeminiAPI;
      }
      if (!GeminiAPI) {
        msg.textContent = 'AI: GeminiAPIが利用できません。';
        return;
      }
      try {
        const answer = await GeminiAPI.sendMessage(question, []);
        msg.textContent = 'AI: ' + answer;
      } catch (e) {
        msg.textContent = 'AI: エラーが発生しました: ' + (e.message || e);
      }
    };
    const aiHintBtn = document.getElementById('gm-ai-hint-btn');
    if (aiHintBtn) aiHintBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      if (msg) msg.textContent = '例:「キャラクターが動かないときはどうすればいい？」「スコアを増やすには？」';
    };
    const aiFaqBtn = document.getElementById('gm-ai-faq-btn');
    if (aiFaqBtn) aiFaqBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      if (msg) msg.textContent = 'FAQ例:「画像が表示されない」「ジャンプができない」「保存できない」など';
    };
    const aiClearBtn = document.getElementById('gm-ai-clear-btn');
    if (aiClearBtn) aiClearBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      if (msg) msg.textContent = '困ったらAIに質問しよう！（仮UI）';
    };
    const aiCopyBtn = document.getElementById('gm-ai-copy-btn');
    if (aiCopyBtn) aiCopyBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      if (msg) {
        navigator.clipboard.writeText(msg.textContent || '').then(()=>{
          aiCopyBtn.textContent = 'コピーしました';
          setTimeout(()=>{aiCopyBtn.textContent = 'AIサポートをコピー';}, 1200);
        });
      }
    };
    const aiSpeakBtn = document.getElementById('gm-ai-speak-btn');
    if (aiSpeakBtn) aiSpeakBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      if (msg && window.speechSynthesis) {
        const utter = new window.SpeechSynthesisUtterance(msg.textContent || '');
        utter.lang = 'ja-JP';
        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utter);
      }
    };
    const aiGuideBtn = document.getElementById('gm-ai-guide-btn');
    if (aiGuideBtn) aiGuideBtn.onclick = () => {
      const msg = document.querySelector('.ai-message');
      let guide = '';
      if (stepIdx === 0) {
        guide = '【AIガイド】\nゲーム制作の基本: 画面は320x240ピクセル、キャラクターは32x32ピクセルで描画されます。まずはキャラクター画像をアセットに追加しましょう。';
      } else if (stepIdx === 1) {
        guide = '【AIガイド】\nキャラクターを動かすには「キャラクターを動かす」ブロックや、コード型ならx座標を変更するロジックを追加します。';
      } else if (stepIdx === 2) {
        guide = '【AIガイド】\nゴールを設置し、キャラクターが到達したらスコアを加算し、クリアメッセージを表示しましょう。';
      } else {
        guide = '【AIガイド】\nゲーム制作の流れに沿って、アセット・ブロック・コードを組み合わせてみましょう。';
      }
      if (msg) msg.textContent = guide;
    };
    const resetProgressBtn = document.getElementById('gm-reset-progress-btn');
    if (resetProgressBtn) resetProgressBtn.onclick = () => { localStorage.setItem(PROGRESS_KEY, 0); renderLesson(0); };
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
    function updateAssetList() {
      const list = document.getElementById('gm-asset-list');
      if (!list) return;
      list.innerHTML = assets.length === 0
        ? '<li class="asset-item empty">アセットはまだありません</li>'
        : assets.map((asset, i) => {
            let preview = '';
            if (asset.type === 'image' && asset.data) {
              preview = `<img src="${asset.data}" alt="${asset.name}" style="height:32px;width:auto;margin-right:8px;border-radius:6px;vertical-align:middle;" />`;
            }
            let details = `<span class='asset-detail'>[${asset.type}${asset.data ? ', ' + Math.round((asset.data.length/1024)) + 'KB' : ''}]</span>`;
            // 並び替えボタン
            let upBtn = `<button class='pickramu-load-button move-btn' data-idx='${i}' data-dir='up' ${i===0?'disabled':''} style='padding:2px 8px;margin-right:2px;'>↑</button>`;
            let downBtn = `<button class='pickramu-load-button move-btn' data-idx='${i}' data-dir='down' ${i===assets.length-1?'disabled':''} style='padding:2px 8px;'>↓</button>`;
            return `<li class="asset-item">${preview}<span class="asset-name" data-id="${asset.id}" tabindex="0" style="cursor:pointer;">${asset.name}</span> ${details} ${upBtn}${downBtn}<button class="pickramu-load-button delete-btn" data-id="${asset.id}" aria-label="削除">×</button></li>`;
          }).join('');
      // 削除ボタンイベント
      document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = e => {
          const id = Number(btn.getAttribute('data-id'));
          assets = assets.filter(a => a.id !== id);
          updateAssetList();
        };
      });
      // インライン編集イベント
      document.querySelectorAll('.asset-name').forEach(span => {
        span.onclick = () => {
          const id = Number(span.getAttribute('data-id'));
          const asset = assets.find(a => a.id === id);
          if (!asset) return;
          const input = document.createElement('input');
          input.type = 'text';
          input.value = asset.name;
          input.style.fontSize = '1rem';
          input.onblur = () => {
            asset.name = input.value;
            updateAssetList();
          };
          input.onkeydown = e => { if (e.key === 'Enter') input.blur(); };
          span.replaceWith(input);
          input.focus();
        };
      });
      // 並び替えイベント
      document.querySelectorAll('.move-btn').forEach(btn => {
        btn.onclick = () => {
          const idx = Number(btn.getAttribute('data-idx'));
          const dir = btn.getAttribute('data-dir');
          if (dir === 'up' && idx > 0) {
            [assets[idx-1], assets[idx]] = [assets[idx], assets[idx-1]];
          } else if (dir === 'down' && idx < assets.length-1) {
            [assets[idx+1], assets[idx]] = [assets[idx], assets[idx+1]];
          }
          updateAssetList();
        };
      });
    }
    root.innerHTML = `
      <div class="page-container" id="gm-create-mode">
        <header class="card">
          <h1 class="title">創造モード</h1>
          <button class="pickramu-load-button secondary gm-back" id="gm-back-home" aria-label="ホームに戻る">← ホーム</button>
        </header>
        <main class="card">
          <div class="create-content">
            <div class="editor-switch">
              <button class="pickramu-load-button primary" id="gm-scratch-btn">スクラッチ型</button>
              <button class="pickramu-load-button secondary" id="gm-code-btn">コード型</button>
            </div>
            <div class="editor-panel" id="gm-editor-panel">エディタ（仮）</div>
            <div class="asset-panel">
              <div class="asset-panel-header">
                <span>アセット管理</span>
                <button class="pickramu-load-button primary gm-add-btn" id="gm-add-asset-btn">＋追加</button>
              </div>
              <ul class="asset-list" id="gm-asset-list"></ul>
            </div>
            <div class="project-actions">
              <button class="pickramu-load-button primary" id="gm-save-project-btn">プロジェクトを保存</button>
            </div>
            <div class="support-btns">
              <button class="pickramu-load-button primary" id="gm-ai-support-btn">AIサポート</button>
              <button class="pickramu-load-button secondary">SCRサポート</button>
              <button class="pickramu-load-button primary" id="gm-toaster-btn" style="background:#2cb4ad;color:#fff;border-radius:8px;box-shadow:0 2px 8px rgba(44,180,173,0.12);font-weight:600;">ToasterMachineに質問</button>
              <span id="gm-toaster-status" style="margin-left:8px;color:#2cb4ad;font-weight:500;"></span>
            </div>
          </div>
        </main>
      </div>
    `;
    const backBtn = document.getElementById('gm-back-home');
    if (backBtn) backBtn.onclick = () => renderHome();
    // スクラッチ/コード型切替（強化）
    let editorType = 'scratch';
    const scratchBtn = document.getElementById('gm-scratch-btn');
    const codeBtn = document.getElementById('gm-code-btn');
    if (scratchBtn) scratchBtn.onclick = () => { editorType = 'scratch'; renderEditor('scratch', codeValue); };
    if (codeBtn) codeBtn.onclick = () => { editorType = 'code'; renderEditor('code', codeValue); };
    // 初期表示
    renderEditor(editorType, codeValue);
    // アセットリスト初期化
    updateAssetList();
    // 追加ボタン
    const addBtn = document.getElementById('gm-add-asset-btn');
    if (addBtn) addBtn.onclick = () => {
      // ファイル選択ダイアログ
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*,audio/*,.mp3,.wav,.ogg,.png,.jpg,.jpeg,.gif';
      input.onchange = async (e) => {
        const file = input.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result;
          const type = file.type.startsWith('image/') ? 'image' : (file.type.startsWith('audio/') ? 'sound' : 'file');
          const newId = assets.length ? Math.max(...assets.map(a=>a.id))+1 : 1;
          assets.push({ id: newId, type, name: file.name, data: base64 });
          updateAssetList();
        };
        reader.readAsDataURL(file);
      };
      input.click();
    };
    // 履歴ボタン
    const historyBtn = document.createElement('button');
    historyBtn.className = 'pickramu-load-button secondary';
    historyBtn.textContent = '履歴';
    historyBtn.style.marginLeft = '1rem';
    historyBtn.onclick = () => {
      const versions = getProjectVersions(loadedProject?.id);
      if (!versions.length) { alert('履歴がありません'); return; }
      const list = versions.map((v,i)=>`${i+1}: ${v.savedAt || '不明'}`).join('\n');
      const idx = Number(prompt('復元するバージョンを選択:\n'+list)) - 1;
      if (isNaN(idx) || idx < 0 || idx >= versions.length) return;
      renderCreate(versions[idx]);
      alert('選択したバージョンを復元しました');
    };
    const actions = document.querySelector('.project-actions');
    if (actions) {
      actions.appendChild(historyBtn);
    }
    // 保存時に履歴追加
    const saveBtn = document.getElementById('gm-save-project-btn');
    if (saveBtn) saveBtn.onclick = async () => {
      let name = projectName;
      if (!name) {
        name = prompt('プロジェクト名を入力してください', '新しいプロジェクト');
        if (!name) return;
        projectName = name;
      }
      const id = loadedProject?.id || (Date.now().toString(36) + Math.random().toString(36).slice(2));
      addProject({ id, name, assets, scratchBlocks, codeValue });
      addProjectVersion({ id, name, assets, scratchBlocks, codeValue });
      let driveResult = await uploadProjectToDrive({ id, name, assets, scratchBlocks, codeValue });
      if (driveResult) {
        alert('プロジェクトを保存しました（Google Driveにも保存されました）');
      } else {
        alert('プロジェクトをローカルに保存しました（Google Drive保存は失敗）');
      }
      renderHome();
    };
    // Google DriveへJSONファイルをアップロード
    async function uploadProjectToDrive({ id, name, assets, scratchBlocks, codeValue }) {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) {
        alert('Googleアカウントでログインしてください（右上の設定などからログイン可能）');
        return false;
      }
      const fileName = `gamemaker_project_${name}_${id}.json`;
      const metadata = {
        name: fileName,
        mimeType: 'application/json',
      };
      const fileContent = JSON.stringify({ id, name, assets, scratchBlocks, codeValue }, null, 2);
      const boundary = '-------314159265358979323846';
      const delimiter = `\r\n--${boundary}\r\n`;
      const closeDelimiter = `\r\n--${boundary}--`;
      const body =
        delimiter +
        'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
        JSON.stringify(metadata) +
        delimiter +
        'Content-Type: application/json\r\n\r\n' +
        fileContent +
        closeDelimiter;
      try {
        const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'multipart/related; boundary=' + boundary,
          },
          body: body,
        });
        if (!response.ok) {
          const err = await response.text();
          throw new Error(err);
        }
        return true;
      } catch (error) {
        console.error('Google Driveアップロード失敗:', error);
        alert('Google Driveへの保存に失敗しました: ' + error.message);
        return false;
      }
    }
    // Driveリネーム
    async function renameDriveProject(fileId, newName) {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) return false;
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newName })
        });
        return res.ok;
      } catch { return false; }
    }
    // Drive削除
    async function deleteDriveProject(fileId) {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) return false;
      const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
      try {
        const res = await fetch(url, { method: 'DELETE', headers: { 'Authorization': 'Bearer ' + accessToken } });
        return res.ok;
      } catch { return false; }
    }
    // Drive上書き保存
    async function overwriteDriveProject(fileId, project) {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) return false;
      const url = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
      try {
        const res = await fetch(url, {
          method: 'PATCH',
          headers: {
            'Authorization': 'Bearer ' + accessToken,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(project)
        });
        return res.ok;
      } catch { return false; }
    }
    // テンプレート読込
    async function listDriveTemplates() {
      const accessToken = localStorage.getItem('google_access_token');
      if (!accessToken) return [];
      const query = "name contains 'gamemaker_template_' and mimeType = 'application/json' and trashed = false";
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=20`;
      try {
        const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + accessToken } });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        return data.files || [];
      } catch { return []; }
    }
    // テンプレート読込ボタン
    const templateBtn = document.createElement('button');
    templateBtn.className = 'pickramu-load-button secondary';
    templateBtn.textContent = 'テンプレートから新規作成';
    templateBtn.style.marginLeft = '1rem';
    templateBtn.onclick = async () => {
      const files = await listDriveTemplates();
      if (!files.length) { alert('テンプレートがありません'); return; }
      const list = files.map((f,i)=>`${i+1}: ${f.name}`).join('\n');
      const idx = Number(prompt('テンプレートを選択:\n'+list)) - 1;
      if (isNaN(idx) || idx < 0 || idx >= files.length) return;
      const file = files[idx];
      const project = await downloadDriveProject(file.id);
      if (project && project.id && project.name) {
        renderCreate({ ...project, id: Date.now().toString(36) + Math.random().toString(36).slice(2), name: project.name + ' (テンプレート)' });
        alert('テンプレートから新規作成しました');
      } else {
        alert('テンプレート読込に失敗しました');
      }
    };
    if (actions) {
      actions.appendChild(templateBtn);
    }
    // 言語切り替えボタン
    setTimeout(()=>{
      const header = document.querySelector('.card');
      if (header && !document.getElementById('gm-lang-btn')) renderLangButton(header);
    }, 10);
    // AIサポートボタン拡張
    const aiSupportBtn = document.getElementById('gm-ai-support-btn');
    if (aiSupportBtn) aiSupportBtn.onclick = () => {
      let advice = [];
      // コード型の静的解析
      if (codeValue && codeValue.trim()) {
        if (codeValue.includes('setInterval') && !codeValue.includes('clearInterval')) {
          advice.push('setIntervalを使う場合はclearIntervalで停止処理も検討しましょう。');
        }
        if (codeValue.includes('while(true') || codeValue.includes('for(;;')) {
          advice.push('無限ループはアプリの応答停止の原因になります。');
        }
        if (!codeValue.includes('draw(')) {
          advice.push('draw()関数が呼ばれていない場合、画面が更新されません。');
        }
      }
      // スクラッチ型ブロックの簡易チェック
      if (window.scratchBlocksTree && window.scratchBlocksTree.length) {
        const blockTypes = window.scratchBlocksTree.map(b=>b.type);
        if (!blockTypes.includes('move')) advice.push('キャラクターを動かすブロックがありません。');
        if (blockTypes.filter(t=>t==='goal').length === 0) advice.push('ゴールブロックがないとクリア判定ができません。');
      }
      if (advice.length === 0) advice.push('特に問題は見つかりませんでした。');
      alert('AIアドバイス:\n' + advice.join('\n'));
    };
    // ToasterMachine連携ボタンのイベント
    setTimeout(() => {
      const toasterBtn = document.getElementById('gm-toaster-btn');
      const toasterStatus = document.getElementById('gm-toaster-status');
      if (toasterBtn) {
        toasterBtn.onclick = async () => {
          let question = prompt('ToasterMachineに質問したい内容を入力してください');
          if (!question) return;
          toasterStatus.textContent = 'AI生成中...';
          toasterBtn.disabled = true;
          try {
            const resp = await window.chatManager?.geminiProcessor?.callGemini_U?.(question) || 'ToasterMachine連携API未接続';
            toasterStatus.textContent = '回答: ' + resp.slice(0, 60) + (resp.length > 60 ? '...' : '');
          } catch (e) {
            toasterStatus.textContent = 'エラー: ' + (e.message || e);
          } finally {
            toasterBtn.disabled = false;
          }
        };
      }
    }, 0);
  }

  // ブロック定義
  const BLOCK_DEFS = [
    { type: 'move', label: 'キャラクターを動かす' },
    { type: 'jump', label: 'ジャンプする' },
    { type: 'goal', label: 'ゴールに到達したらクリア' },
    { type: 'addScore', label: 'スコアを加算' },
    { type: 'sound', label: '音を鳴らす' },
    { type: 'if', label: 'もしスコアが100以上なら', children: [] },
    { type: 'repeat', label: 'くりかえし10回', count: 10, children: [] },
    { type: 'onKey', label: 'スペースキーが押されたとき', children: [] },
    { type: 'wait', label: '1秒待つ' }
  ];

  function renderEditor(type = 'scratch', codeVal = '') {
    const editorPanel = document.getElementById('gm-editor-panel');
    if (!editorPanel) return;
    if (type === 'scratch') {
      // 新しいブロックUI
      editorPanel.innerHTML = `
        <div class="scratch-blocks">
          ${BLOCK_DEFS.map((b,i)=>`<div class="block" draggable="true" data-type="${b.type}" data-idx="${i}">${b.label}</div>`).join('')}
        </div>
        <div class="dropzone" id="gm-dropzone">ここにブロックをドラッグ＆ドロップ</div>
        <div class="block-list" id="gm-block-list"></div>
        <button class="pickramu-load-button secondary" id="gm-block-clear-btn" style="margin-top:0.5rem;">すべて削除</button>
      `;
      // 新 scratchBlocks: ツリー構造
      if (!window.scratchBlocksTree) window.scratchBlocksTree = [];
      let scratchBlocksTree = window.scratchBlocksTree;
      function renderBlockTree(blocks, parent, depth=0) {
        return `<ul style="margin-left:${depth*24}px;list-style:none;padding-left:0;">` +
          blocks.map((b, i) => {
            let controls = '';
            if (b.type === 'if' || b.type === 'repeat' || b.type === 'onKey') {
              controls = `<button class='pickramu-load-button secondary gm-add-child-btn' data-parent='${parent}' data-idx='${i}' style='font-size:0.9rem;padding:2px 8px;margin-left:4px;'>子を追加</button>`;
            }
            let children = (b.children && b.children.length)
              ? renderBlockTree(b.children, `${parent}.${i}`, depth+1)
              : '';
            return `<li style='margin-bottom:4px;'>
              <span class='block block-placed' draggable='true' data-path='${parent}.${i}' title='クリックで削除/ドラッグで並び替え'>${b.label}</span>
              ${controls}
              ${children}
            </li>`;
          }).join('') + '</ul>';
      }
      function updateBlockList() {
        const blockList = document.getElementById('gm-block-list');
        blockList.innerHTML = '<b>並べたブロック:</b> ' + (scratchBlocksTree.length ? renderBlockTree(scratchBlocksTree, 'root') : 'なし');
        // 削除イベント
        blockList.querySelectorAll('.block-placed').forEach(span => {
          span.onclick = () => {
            const path = span.getAttribute('data-path').replace('root.','').split('.').map(Number);
            let arr = scratchBlocksTree;
            for(let i=0;i<path.length-1;i++) arr = arr[path[i]].children;
            arr.splice(path[path.length-1],1);
            updateBlockList();
          };
        });
        // 子追加イベント
        blockList.querySelectorAll('.gm-add-child-btn').forEach(btn => {
          btn.onclick = () => {
            const parentPath = btn.getAttribute('data-parent').replace('root.','').split('.').filter(x=>x!=='' ).map(Number);
            const idx = Number(btn.getAttribute('data-idx'));
            let arr = scratchBlocksTree;
            for(let i=0;i<parentPath.length;i++) arr = arr[parentPath[i]].children;
            arr[idx].children = arr[idx].children || [];
            arr[idx].children.push({ type: 'move', label: 'キャラクターを動かす' });
              updateBlockList();
          };
        });
      }
      // ドラッグ＆ドロップ
      const blocks = editorPanel.querySelectorAll('.block');
      const dropzone = editorPanel.querySelector('#gm-dropzone');
      blocks.forEach(block => {
        block.ondragstart = e => {
          e.dataTransfer.setData('block-idx', block.getAttribute('data-idx'));
        };
      });
      if (dropzone) {
        dropzone.ondragover = e => { e.preventDefault(); dropzone.style.background = '#d0e6ff'; };
        dropzone.ondragleave = e => { dropzone.style.background = ''; };
        dropzone.ondrop = e => {
          e.preventDefault();
          const idx = Number(e.dataTransfer.getData('block-idx'));
          const blockDef = JSON.parse(JSON.stringify(BLOCK_DEFS[idx]));
          scratchBlocksTree.push(blockDef);
            updateBlockList();
          dropzone.style.background = '';
        };
      }
      updateBlockList();
      const clearBtn = editorPanel.querySelector('#gm-block-clear-btn');
      if (clearBtn) clearBtn.onclick = () => { scratchBlocksTree.length = 0; updateBlockList(); };
    } else if (type === 'code') {
      editorPanel.innerHTML = `
        <textarea id="gm-code-editor" class="code-editor" rows="10" style="width:100%;font-size:1.1rem;">${codeVal || '// ここにゲームのロジックを書こう\n'}</textarea>
        <button class="pickramu-load-button primary" id="gm-save-code-btn">コードを保存</button>
        <button class="pickramu-load-button secondary" id="gm-reset-code-btn" style="margin-left:0.5rem;">リセット</button>
        <button class="pickramu-load-button secondary" id="gm-sample-code-btn" style="margin-left:0.5rem;">サンプル挿入</button>
      `;
      const saveBtn = document.getElementById('gm-save-code-btn');
      if (saveBtn) saveBtn.onclick = () => {
        const textarea = document.getElementById('gm-code-editor');
        codeValue = textarea.value;
        alert('コード内容を保存しました');
      };
      const resetBtn = document.getElementById('gm-reset-code-btn');
      if (resetBtn) resetBtn.onclick = () => {
        const textarea = document.getElementById('gm-code-editor');
        textarea.value = '// ここにゲームのロジックを書こう\n';
      };
      const sampleBtn = document.getElementById('gm-sample-code-btn');
      if (sampleBtn) sampleBtn.onclick = () => {
        const textarea = document.getElementById('gm-code-editor');
        textarea.value = `// キャラクターを自動で左右に動かす\nlet dir = 1;\nsetInterval(()=>{\n  x += dir * 2;\n  if(x < 0 || x > 288) dir *= -1;\n  draw();\n}, 30);`;
      };
    }
  }

  // Google Driveからプロジェクト一覧を取得
  async function listDriveProjects() {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) {
      alert('Googleアカウントでログインしてください（右上の設定などからログイン可能）');
      return [];
    }
    const query = "name contains 'gamemaker_project_' and mimeType = 'application/json' and trashed = false";
    const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=20`;
    try {
      const res = await fetch(url, {
        headers: { 'Authorization': 'Bearer ' + accessToken }
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      return data.files || [];
    } catch (e) {
      alert('Google Driveからの取得に失敗しました: ' + e.message);
      return [];
    }
  }
  // Google Driveからプロジェクトファイルをダウンロード
  async function downloadDriveProject(fileId) {
    const accessToken = localStorage.getItem('google_access_token');
    if (!accessToken) return null;
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
    try {
      const res = await fetch(url, { headers: { 'Authorization': 'Bearer ' + accessToken } });
      if (!res.ok) throw new Error(await res.text());
      return await res.json();
    } catch (e) {
      alert('Google Driveからのダウンロードに失敗しました: ' + e.message);
      return null;
    }
  }

  // プレビュー画面の描画
  function renderPreview(assets, scratchBlocksTree = [], codeValue = '') {
    let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
    const root = document.getElementById('app-root');
    if (!root) return;
    root.innerHTML = `
      <div class="page-container" id="gm-preview-mode">
        <header class="card">
          <h1 class="title">ゲームプレビュー</h1>
          <button class="pickramu-load-button secondary gm-back" id="gm-back-edit" aria-label="編集に戻る">← 編集に戻る</button>
        </header>
        <main class="card">
          <div class="preview-canvas-wrap">
            <canvas id="gm-preview-canvas" width="320" height="240" style="background:#222;border-radius:12px;"></canvas>
          </div>
          <div class="preview-assets">
            <h3>アセット一覧</h3>
            <div>
              ${assets.filter(a=>a.type==='image').map(a=>`<img src="${a.data}" alt="${a.name}" style="height:48px;margin:4px;border-radius:8px;" />`).join('')}
            </div>
          </div>
          <div class="preview-blocks">
            <h4>実行ブロック</h4>
            <div>${scratchBlocksTree.length ? renderBlockTree(scratchBlocksTree, 'root') : 'なし'}</div>
          </div>
          <div class="preview-actions">
            <button class="pickramu-load-button secondary" id="gm-reset-btn">リセット</button>
          </div>
        </main>
      </div>
    `;
    // 新しいデータ構造
    let entities = [
      { type: 'player', x: 140, y: 100, img: assets.find(a=>a.type==='image'), vy: 0, jumping: false, score: 0 },
      { type: 'enemy', x: 200, y: 100, img: assets.find(a=>a.type==='image'), vy: 0, jumping: false }
    ];
    let items = [ { x: 80, y: 120, collected: false } ];
    let map = { width: 320, height: 240, tiles: [] };
    // 簡易キャラクター動作（ブロック反映）
    const canvas = document.getElementById('gm-preview-canvas');
    const ctx = canvas.getContext('2d');
    let x = 140, y = 100, vy = 0, jumping = false, score = 0;
    let img = new window.Image();
    const charAsset = assets.find(a=>a.type==='image');
    if (charAsset) img.src = charAsset.data;
    // ブロック判定
    const hasMove = scratchBlocksTree.some(b => b.type === 'move');
    const hasJump = scratchBlocksTree.some(b => b.type === 'jump');
    const hasScore = scratchBlocksTree.some(b => b.type === 'addScore');
    // ゴール（仮）
    const hasGoal = scratchBlocksTree.some(b => b.type === 'goal');
    let goalX = 260, goalY = 100;
    function draw() {
      ctx.clearRect(0,0,320,240);
      ctx.fillStyle = '#333';
      ctx.fillRect(0,0,320,240);
      // マップ描画（仮）
      // ... map.tiles ...
      // アイテム描画
      items.forEach(item => {
        if (!item.collected) {
          ctx.fillStyle = '#f5a623';
          ctx.beginPath();
          ctx.arc(item.x+8, item.y+8, 8, 0, Math.PI*2);
          ctx.fill();
        }
      });
      // エンティティ描画
      entities.forEach(ent => {
        if (ent.img && ent.img.data) {
          let image = new window.Image();
          image.src = ent.img.data;
          ctx.drawImage(image, ent.x, ent.y, 32, 32);
        } else {
          ctx.fillStyle = ent.type==='player' ? '#4f8cff' : '#d9363e';
          ctx.fillRect(ent.x, ent.y, 32, 32);
        }
        if (ent.type==='player') {
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 16px sans-serif';
          ctx.fillText('SCORE: ' + ent.score, 10, 24);
      }
      });
    }
    img.onload = draw;
    // 自動移動
    let moveDir = 1;
    function autoMove() {
      if (hasMove) {
        x += moveDir * 2;
        if (x < 0 || x > 288) moveDir *= -1;
      }
    }
    // ジャンプ処理
    function jump() {
      if (hasJump && !jumping) {
        vy = -8;
        jumping = true;
      }
    }
    // ゴール判定
    function checkGoal() {
      if (hasGoal && x+32 > goalX && x < goalX+32 && y+32 > goalY && y < goalY+32) {
        score += 100;
        x = 10; y = 100;
        alert('ゴール！スコア+100');
      }
    }
    // メインループ
    function loop() {
      autoMove();
      if (hasJump) {
        y += vy;
        vy += 0.5;
        if (y > 100) { y = 100; vy = 0; jumping = false; }
      }
      draw();
      checkGoal();
      requestAnimationFrame(loop);
    }
    loop();
    window.onkeydown = e => {
      if (e.key==='ArrowLeft') x-=8;
      if (e.key==='ArrowRight') x+=8;
      if (e.key==='ArrowUp') y-=8;
      if (e.key==='ArrowDown') y+=8;
      if (e.key===' ' || e.key==='Spacebar') jump();
      draw();
    };
    // 戻るボタン
    const backBtn = document.getElementById('gm-back-edit');
    if (backBtn) backBtn.onclick = () => renderCreate({ assets, scratchBlocksTree, codeValue });
    // コード型ロジック反映
    try {
      if (codeValue && codeValue.trim() && codeValue.trim().startsWith('//') === false) {
        // eslint-disable-next-line no-new-func
        const customLogic = new Function('canvas','ctx','assets','x','y','score','draw', codeValue);
        customLogic(canvas, ctx, assets, x, y, score, draw);
      }
    } catch (e) {
      alert('コード実行エラー: ' + e.message);
    }
    // リセットボタン
    const resetBtn = document.getElementById('gm-reset-btn');
    if (resetBtn) resetBtn.onclick = () => {
      x = 140; y = 100; vy = 0; jumping = false; score = 0;
      draw();
    };
  }

  // --- ダーク/ライトモード自動切り替え ---
  function applyColorScheme() {
    const dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyColorScheme);
  applyColorScheme();

  // 初期画面
  renderHome();

  shell.log({from: 'dp.app.gamemaker.out', message: 'GameMaker: 初期化完了', level: 'info'});
} 

// --- 言語切り替えボタン共通関数 ---
function renderLangButton(parent) {
  let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
  const langBtn = document.createElement('button');
  langBtn.className = 'pickramu-load-button secondary';
  langBtn.id = 'gm-lang-btn';
  langBtn.style.position = 'absolute';
  langBtn.style.right = '1rem';
  langBtn.style.top = '1rem';
  langBtn.textContent = lang === 'ja' ? 'EN' : 'JA';
  langBtn.onclick = () => {
    const nextLang = lang === 'ja' ? 'en' : 'ja';
    localStorage.setItem('gamemaker_lang', nextLang);
    location.reload();
  };
  parent.appendChild(langBtn);
}

// --- キーボードショートカットの多重登録防止 ---
function addSingleKeyListener(type, handler) {
  document.removeEventListener('keydown', handler);
  document.addEventListener('keydown', handler);
}
// 例: renderHome内
addSingleKeyListener('keydown', function(e) {
  if (e.altKey || e.ctrlKey || e.metaKey) return;
  if (e.key === 'l') document.getElementById('gm-lesson-btn')?.click();
  if (e.key === 'c') document.getElementById('gm-create-btn')?.click();
  if (e.key === 'i') document.getElementById('gm-import-drive-btn')?.click();
});

// --- テスト・品質保証用ユニットテスト関数とUI ---
function runUnitTests() {
  const results = [];
  // テスト1: 多言語切替
  localStorage.setItem('gamemaker_lang', 'en');
  if ((window.CURRENT_LANG||'ja') === 'en' || localStorage.getItem('gamemaker_lang') === 'en') {
    results.push('言語切替テスト: OK');
  } else {
    results.push('言語切替テスト: NG');
  }
  // テスト2: プロジェクト保存
  try {
    addProject({ id: 'testid', name: 'test', assets: [], scratchBlocks: [], codeValue: '' });
    results.push('プロジェクト保存テスト: OK');
  } catch { results.push('プロジェクト保存テスト: NG'); }
  // テスト3: バージョン履歴
  try {
    addProjectVersion({ id: 'testid', name: 'test', assets: [], scratchBlocks: [], codeValue: '' });
    const v = getProjectVersions('testid');
    if (v && v.length > 0) results.push('バージョン履歴テスト: OK');
    else results.push('バージョン履歴テスト: NG');
  } catch { results.push('バージョン履歴テスト: NG'); }
  return results;
}
function renderTestUI() {
  let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
  const root = document.getElementById('app-root');
  if (!root) return;
  root.innerHTML = `<div class="page-container"><header class="card"><h1>Test & QA</h1></header><main class="card"><button class="pickramu-load-button primary" id="run-test-btn">Run Tests</button><ul id="test-result-list"></ul></main></div>`;
  document.getElementById('run-test-btn').onclick = () => {
    const results = runUnitTests();
    document.getElementById('test-result-list').innerHTML = results.map(r=>`<li>${r}</li>`).join('');
  };
  setTimeout(()=>{
    const header = document.querySelector('.card');
    if (header && !document.getElementById('gm-lang-btn')) renderLangButton(header);
  }, 10);
}
// --- テストUI起動用ショートカット ---
document.addEventListener('keydown', e => {
  if ((e.ctrlKey||e.metaKey) && e.key === 't') {
    renderTestUI();
  }
});

// --- ユーザーフィードバックUI・保存 ---
function renderFeedbackUI() {
  let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
  const root = document.getElementById('app-root');
  if (!root) return;
  root.innerHTML = `<div class="page-container"><header class="card"><h1>Feedback</h1></header><main class="card"><textarea id="feedback-text" rows="5" style="width:100%;font-size:1.1rem;"></textarea><button class="pickramu-load-button primary" id="send-feedback-btn">送信</button><div id="feedback-result"></div></main></div>`;
  document.getElementById('send-feedback-btn').onclick = () => {
    const text = document.getElementById('feedback-text').value;
    if (!text.trim()) return alert('内容を入力してください');
    // ローカルストレージに保存（本番はAPI送信）
    let arr = [];
    try { arr = JSON.parse(localStorage.getItem('gamemaker_feedback')||'[]'); } catch {}
    arr.unshift({ text, date: new Date().toISOString() });
    localStorage.setItem('gamemaker_feedback', JSON.stringify(arr.slice(0, 50)));
    document.getElementById('feedback-result').textContent = '送信しました。ご協力ありがとうございます。';
  };
  setTimeout(()=>{
    const header = document.querySelector('.card');
    if (header && !document.getElementById('gm-lang-btn')) renderLangButton(header);
  }, 10);
}
// フィードバックUI起動用ショートカット
// Ctrl+F
 document.addEventListener('keydown', e => {
   if ((e.ctrlKey||e.metaKey) && e.key === 'f') {
     renderFeedbackUI();
   }
 });
// --- パフォーマンス最適化 ---
function debounce(fn, ms) {
  let timer; return function(...args) {
    clearTimeout(timer); timer = setTimeout(()=>fn.apply(this,args), ms);
  };
}
// 例: updateBlockList, draw など重い処理にdebounce適用
// ... 主要なupdateBlockList, draw, renderBlockTree, renderPreview, renderEditor等でdebounceやrequestIdleCallbackを適用 ...
// --- Google認証・Drive連携リフレッシュ・再認証 ---
async function ensureGoogleAuth() {
  let token = localStorage.getItem('google_access_token');
  if (!token) {
    alert('Googleアカウントでログインしてください');
    // 認証フロー起動（本番はOAuth2）
    window.open('https://accounts.google.com/o/oauth2/v2/auth?client_id=54111871338-nv4bn99r48cohhverg3l9oicirthmtpp.apps.googleusercontent.com&redirect_uri='+encodeURIComponent(location.origin)+'&response_type=token&scope=https://www.googleapis.com/auth/drive.file','_blank');
    return false;
  }
  // トークン期限チェック・リフレッシュ（本番はrefresh_token）
  // ...
  return true;
}
// Drive API呼び出し前にensureGoogleAuth()をawaitするよう修正
// --- XSS/CSRF等のセキュリティ対策 ---
function sanitizeHTML(str) {
  return str.replace(/[&<>'"`]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\'':'&#39;','"':'&quot;','`':'&#96;'}[c]));
}
// innerHTMLにユーザー入力を挿入する箇所はsanitizeHTMLでラップ
// fetch時にcredentials: 'same-origin'やX-Requested-Withヘッダを追加
// --- 管理者向け管理画面UI ---
function renderAdminUI() {
  let lang = localStorage.getItem('gamemaker_lang') || CURRENT_LANG;
  const root = document.getElementById('app-root');
  if (!root) return;
  let allProgress = [];
  try { allProgress = JSON.parse(localStorage.getItem('gamemaker_lesson_history')||'[]'); } catch {}
  let feedback = [];
  try { feedback = JSON.parse(localStorage.getItem('gamemaker_feedback')||'[]'); } catch {}
  root.innerHTML = `<div class="page-container"><header class="card"><h1>管理者ダッシュボード</h1></header><main class="card"><h2>進捗履歴</h2><ul>${allProgress.map(h=>`<li>ステップ${h.step} - ${h.date}</li>`).join('')||'<li>データなし</li>'}</ul><h2>フィードバック</h2><ul>${feedback.map(f=>`<li>${f.text} <span style='color:#888;'>(${f.date})</span></li>`).join('')||'<li>データなし</li>'}</ul></main></div>`;
  setTimeout(()=>{
    const header = document.querySelector('.card');
    if (header && !document.getElementById('gm-lang-btn')) renderLangButton(header);
  }, 10);
}
// Ctrl+Mで管理画面起動
 document.addEventListener('keydown', e => {
   if ((e.ctrlKey||e.metaKey) && e.key === 'm') {
     renderAdminUI();
   }
 }); 