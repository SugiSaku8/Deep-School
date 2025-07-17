/* 
Pickramu
The Pickramu is a language for creating teaching materials for Deep-School.
version:1.0.61
Development:Carnaion Studio
License:MPL-2.0
*/
/**
 * 指定ディレクトリ配下の教材ファイル一覧を取得（再帰的）
 * @param {string} basePath - ルートパス
 * @param {function} callback - (教材リスト) => void
 */
function fetchAllMaterials(basePath, callback) {
  // GitHub Pages上のAPIは使えないため、教材リストは手動で定義 or 別jsonで管理するのが理想
  // ここでは手動でリストアップ（今後自動化も可）
  const materials = [
    // 数学
    {
      subject: "数学",
      field: "式の計算",
      unit: "1.用語",
      file: "jla/math/式の計算/1節/1.用語/1.html",
      title: "数学: 式の計算・1節・用語 (1)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "1.用語",
      file: "jla/math/式の計算/1節/1.用語/2.html",
      title: "数学: 式の計算・1節・用語 (2)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "2.加法・減法",
      file: "jla/math/式の計算/1節/2.加法・減法/1.html",
      title: "数学: 式の計算・1節・加法・減法 (1)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "2.加法・減法",
      file: "jla/math/式の計算/1節/2.加法・減法/2.html",
      title: "数学: 式の計算・1節・加法・減法 (2)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "3.分配法則・分数",
      file: "jla/math/式の計算/1節/3.分配法則・分数/1.html",
      title: "数学: 式の計算・1節・分配法則・分数 (1)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "3.分配法則・分数",
      file: "jla/math/式の計算/1節/3.分配法則・分数/2.html",
      title: "数学: 式の計算・1節・分配法則・分数 (2)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "3.分配法則・分数",
      file: "jla/math/式の計算/1節/3.分配法則・分数/3.html",
      title: "数学: 式の計算・1節・分配法則・分数 (3)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "4.乗法・除法",
      file: "jla/math/式の計算/1節/4.乗法・除法/1.html",
      title: "数学: 式の計算・1節・乗法・除法 (1)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "4.乗法・除法",
      file: "jla/math/式の計算/1節/4.乗法・除法/2.html",
      title: "数学: 式の計算・1節・乗法・除法 (2)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "5.式の値",
      file: "jla/math/式の計算/1節/5.式の値/1.html",
      title: "数学: 式の計算・1節・式の値 (1)",
    },
    {
      subject: "数学",
      field: "式の計算",
      unit: "5.式の値",
      file: "jla/math/式の計算/1節/5.式の値/2.html",
      title: "数学: 式の計算・1節・式の値 (2)",
    },
    // 国語
    {
      subject: "国語",
      field: "文法",
      unit: "unit1",
      file: "jla/jp/grammer/unit1/1.html",
      title: "国語: 文法・unit1 (1)",
    },
    //英語
    {
      subject: "English",
      field: "Write and Use",
      unit: "unit1:The tale of PeterRabbit",
      file: "jla/eng/wriNuse/unit1/1.html",
      title: "English:wriNuse Unit1 The Tale of Peter Rabbit-Part1",
    },
    {
      subject: "English",
      field: "Write and Use",
      unit: "unit1:The tale of PeterRabbit",
      file: "jla/eng/wriNuse/unit1/2.html",
      title: "English:wriNuse Unit1 The Tale of Peter Rabbit-Part2",
    },
    // 社会（公民）
    {
      subject: "社会",
      field: "公民",
      unit: "unit1",
      file: "jla/ss/civics/unit1/index.html",
      title: "社会: 公民・unit1",
    },
    {
      subject: "社会",
      field: "公民",
      unit: "unit2",
      file: "jla/ss/civics/unit2/index.html",
      title: "社会: 公民・unit2",
    },
    {
      subject: "社会",
      field: "公民",
      unit: "unit3",
      file: "jla/ss/civics/unit3/index.html",
      title: "社会: 公民・unit3",
    },
    {
      subject: "社会",
      field: "公民",
      unit: "unit4",
      file: "jla/ss/civics/unit4/index.html",
      title: "社会: 公民・unit4",
    },
    {
      subject: "社会",
      field: "公民",
      unit: "unit5",
      file: "jla/ss/civics/unit5/index.html",
      title: "社会: 公民・unit5",
    },
    {
      subject: "社会",
      field: "公民",
      unit: "unit6",
      file: "jla/ss/civics/unit6/index.html",
      title: "社会: 公民・unit6",
    },
    // 社会（地理）
    {
      subject: "社会",
      field: "地理",
      unit: "unit1",
      file: "jla/ss/geography/unit1/index.html",
      title: "社会: 地理・unit1",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit2",
      file: "jla/ss/geography/unit2/index.html",
      title: "社会: 地理・unit2",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit3",
      file: "jla/ss/geography/unit3/index.html",
      title: "社会: 地理・unit3",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit4",
      file: "jla/ss/geography/unit4/index.html",
      title: "社会: 地理・unit4",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit5",
      file: "jla/ss/geography/unit5/index.html",
      title: "社会: 地理・unit5",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit6",
      file: "jla/ss/geography/unit6/index.html",
      title: "社会: 地理・unit6",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit7",
      file: "jla/ss/geography/unit7/index.html",
      title: "社会: 地理・unit7",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit8",
      file: "jla/ss/geography/unit8/index.html",
      title: "社会: 地理・unit8",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit9",
      file: "jla/ss/geography/unit9/index.html",
      title: "社会: 地理・unit9",
    },
    {
      subject: "社会",
      field: "地理",
      unit: "unit10",
      file: "jla/ss/geography/unit10/index.html",
      title: "社会: 地理・unit10",
    },
    // 社会（歴史）
    {
      subject: "社会",
      field: "歴史",
      unit: "unit1",
      file: "jla/ss/history/unit1/index.html",
      title: "社会: 歴史・unit1",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit2",
      file: "jla/ss/history/unit2/index.html",
      title: "社会: 歴史・unit2",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit3",
      file: "jla/ss/history/unit3/index.html",
      title: "社会: 歴史・unit3",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit4",
      file: "jla/ss/history/unit4/index.html",
      title: "社会: 歴史・unit4",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit5",
      file: "jla/ss/history/unit5/index.html",
      title: "社会: 歴史・unit5",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit6",
      file: "jla/ss/history/unit6/index.html",
      title: "社会: 歴史・unit6",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit7",
      file: "jla/ss/history/unit7/index.html",
      title: "社会: 歴史・unit7",
    },
    {
      subject: "社会",
      field: "歴史",
      unit: "unit8",
      file: "jla/ss/history/unit8/index.html",
      title: "社会: 歴史・unit8",
    },
  ];
  callback(materials);
}

// --- UI生成部分の雛形 ---

function renderMaterialSelector(materials, onSelect) {
  // 検索バー＋教科ごとにリスト表示
  return `
    <div class="pickramu-material-search">
      <input type="text" id="material-search-bar" placeholder="例: 数学、公民、unit1、式の計算..." class="search-bar">
    </div>
    <div class="pickramu-material-list">
      ${
        materials.length === 0
          ? '<div class="pickramu-no-results">検索結果が見つかりませんでした。<br>別のキーワードで検索してください。</div>'
          : ["数学", "国語", "社会", "English"]
              .map((subject) => {
                const subjectMaterials = materials.filter(
                  (m) => m.subject === subject
                );
                if (!subjectMaterials.length) return "";
                // フィールドごと
                const fields = [
                  ...new Set(subjectMaterials.map((m) => m.field)),
                ];
                return `
            <div class="pickramu-material-subject">
              <h4 class="section-title">${subject}</h4>
              ${fields
                .map((field) => {
                  const fieldMaterials = subjectMaterials.filter(
                    (m) => m.field === field
                  );
                  // Unitごと
                  const units = [...new Set(fieldMaterials.map((m) => m.unit))];
                  return `
                  <div class="pickramu-material-field">
                    <div class="pickramu-material-field-title">${field}</div>
                    <ul class="pickramu-material-unit-list">
                      ${units
                        .map((unit) => {
                          const unitMaterials = fieldMaterials.filter(
                            (m) => m.unit === unit
                          );
                          return `
                          <li class="pickramu-material-unit">
                            <span class="pickramu-material-unit-title">${unit}</span>
                            <ul class="pickramu-material-file-list">
                              ${unitMaterials
                                .map(
                                  (mat) => `
                                <li><button class="auto-btn pickramu-material-btn" data-file="${mat.file}">${mat.title}</button></li>
                              `
                                )
                                .join("")}
                            </ul>
                          </li>
                        `;
                        })
                        .join("")}
                    </ul>
                  </div>
                `;
                })
                .join("")}
            </div>
          `;
              })
              .join("")
      }
    </div>
  `;
}

export const appMeta = {
  name: "pickramu",
  title: "Pickramu",
  icon: "re/ico/note.svg",
};

export function appInit(shell) {
  let root = document.getElementById("app-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "app-root";
    document.body.appendChild(root);
    if (window.ds && window.ds.log)
      window.ds.log({
        from: "dp.app.pickramu.err",
        message: "PickramuApp: #app-rootがなかったので自動生成",
        level: "warn",
      });
  }
  // app-rootがhiddenやdisplay:noneになっていたら強制的に表示
  root.style.display = "";
  root.hidden = false;

  // 教材リストを取得してUI生成
  fetchAllMaterials("", (materials) => {
    root.innerHTML = `
      <div class="page-container pickramu-page">
        <button class="go-back-button" id="pickramu-back-btn" data-lang-key="back">←</button>
        <h1 class="page-title" data-lang-key="pickramu_work">Pickramu</h1>
        <div class="pickramu-tabs">
          <button class="auto-btn" id="tab-pickramu" data-lang-key="pickramu_tab">教材ワーク</button>
          <button class="auto-btn" id="tab-eguide" data-lang-key="eguide_tab">eGuide</button>
        </div>
        <div id="pickramu-work-area" class="pickramu-work-area">
          <div class="pickramu-select-container">
            <div class="card pickramu-select-card">
              <h3 class="pickramu-select-title">教材選択</h3>
              <div class="pickramu-select-group" id="pickramu-material-selector-area">
                <!-- 教材リスト＋検索バーがここに入る -->
                ${renderMaterialSelector(materials)}
              </div>
            </div>
          </div>
          <iframe id="pickramu_iframe" class="pickramu-iframe"></iframe>
        </div>
        <div id="pickramu-eguide-area" class="pickramu-eguide-area" style="display:none;">
          <iframe src="eguide.html" class="pickramu-iframe"></iframe>
        </div>
      </div>
      
     <style>
  /* ベーススタイル */
  .pickramu-page {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif;
    padding: 32px;
    max-width: 1200px;
    margin: 0 auto;
    min-height: 100vh;
    box-sizing: border-box;
    background: #f5f5f7;
    color: #1d1d1f;
    letter-spacing: -0.022em;
  }

  /* ページタイトル */
  .page-title {
    font-size: 40px;
    font-weight: 700;
    text-align: center;
    margin: 48px 0;
    color: #1d1d1f;
    letter-spacing: -0.003em;
  }

  /* タブナビゲーション */
  .pickramu-tabs {
    display: flex;
    gap: 16px;
    justify-content: center;
    margin-bottom: 32px;
  }

  .pickramu-tabs .auto-btn {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: none;
    border-radius: 980px;
    padding: 12px 24px;
    font-size: 17px;
    color: #1d1d1f;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .pickramu-tabs .auto-btn:hover,
  .pickramu-tabs .auto-btn.active {
    background: #0071e3;
    color: #fff;
    transform: translateY(-1px);
  }

  /* メインレイアウト */
  .pickramu-work-area {
    display: flex;
    gap: 32px;
    align-items: flex-start;
    margin-top: 32px;
  }

  /* サイドバー */
  .pickramu-select-container {
    flex: 0 0 340px;
    position: sticky;
    top: 32px;
  }

  .pickramu-select-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 24px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .pickramu-select-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 48px rgba(0, 0, 0, 0.12);
  }

  .pickramu-select-title {
    font-size: 24px;
    font-weight: 600;
    text-align: center;
    margin-bottom: 24px;
    color: #1d1d1f;
  }

  /* 検索バー */
  .pickramu-material-search {
    margin-bottom: 24px;
  }

  .search-bar {
    width: 100%;
    padding: 12px 16px;
    font-size: 17px;
    color: #1d1d1f;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  }

  .search-bar:focus {
    outline: none;
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
    transform: scale(1.02);
  }

  /* 教材リスト */
  .pickramu-material-list {
    max-height: calc(100vh - 280px);
    overflow-y: auto;
    padding-right: 12px;
  }

  .pickramu-material-subject {
    margin-bottom: 32px;
  }

  .section-title {
    font-size: 20px;
    font-weight: 600;
    color: #1d1d1f;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .pickramu-material-field-title {
    font-size: 17px;
    font-weight: 500;
    color: #86868b;
    margin: 16px 0 8px;
  }

  .pickramu-material-unit-title {
    font-size: 15px;
    color: #86868b;
    margin: 12px 0 8px;
  }

  /* 教材ボタン */
  .pickramu-material-btn {
    width: 100%;
    padding: 12px 16px;
    font-size: 15px;
    text-align: left;
    color: #1d1d1f;
    background: rgba(255, 255, 255, 0.8);
    border: none;
    border-radius: 12px;
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    margin: 4px 0;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    cursor: pointer;
  }

  .pickramu-material-btn:hover {
    background: #0071e3;
    color: #fff;
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 113, 227, 0.3);
  }

  /* iFrame */
  .pickramu-iframe {
    flex: 1;
    height: 80vh;
    border: none;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
    transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
  }

  /* 戻るボタン */
  .go-back-button {
    position: fixed;
    top: 24px;
    left: 24px;
    z-index: 1000;
    width: 40px;
    height: 40px;
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border: none;
    color: #1d1d1f;
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  }

  .go-back-button:hover {
    transform: scale(1.1);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  /* スクロールバー */
  .pickramu-material-list::-webkit-scrollbar {
    width: 6px;
  }

  .pickramu-material-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .pickramu-material-list::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  .pickramu-material-list::-webkit-scrollbar-thumb:hover {
    background: rgba(0, 0, 0, 0.3);
  }

  /* 検索結果なし */
  .pickramu-no-results {
    text-align: center;
    padding: 48px 24px;
    color: #86868b;
    font-size: 17px;
    line-height: 1.5;
  }

  /* アニメーション */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .pickramu-material-btn {
    animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
    animation-fill-mode: both;
  }

  /* レスポンシブデザイン */
  @media (max-width: 768px) {
    .pickramu-page {
      padding: 16px;
    }

    .page-title {
      font-size: 32px;
      margin: 32px 0;
    }

    .pickramu-work-area {
      flex-direction: column;
      gap: 24px;
    }

    .pickramu-select-container {
      flex: none;
      width: 100%;
      position: static;
    }

    .pickramu-iframe {
      height: 60vh;
    }

    .pickramu-material-list {
      max-height: 50vh;
    }

    .go-back-button {
      top: 16px;
      left: 16px;
    }
  }
</style>
    `;

    // 戻るボタン
    document.getElementById("pickramu-back-btn").onclick = () =>
      shell.loadApp("menu");

    // タブ切り替え
    document.getElementById("tab-pickramu").onclick = () => {
      document.getElementById("pickramu-work-area").style.display = "flex";
      document.getElementById("pickramu-eguide-area").style.display = "none";
      document.getElementById("tab-pickramu").classList.add("active");
      document.getElementById("tab-eguide").classList.remove("active");
    };
    document.getElementById("tab-eguide").onclick = () => {
      document.getElementById("pickramu-work-area").style.display = "none";
      document.getElementById("pickramu-eguide-area").style.display = "block";
      document.getElementById("tab-pickramu").classList.remove("active");
      document.getElementById("tab-eguide").classList.add("active");
    };

    // 教材ボタン押下でiframeに教材をロード
    const baseHtmlPath =
      "https://sugisaku8.github.io/Deep-School/client/Pickramu/data/";
    document.querySelectorAll(".pickramu-material-btn").forEach((btn) => {
      btn.onclick = (e) => {
        const file = btn.getAttribute("data-file");
        document.getElementById("pickramu_iframe").src = baseHtmlPath + file;
      };
    });

    // 検索機能を実行する関数
    function performSearch(keyword) {
      const filtered = materials.filter(
        (m) =>
          m.title.toLowerCase().includes(keyword) ||
          m.subject.toLowerCase().includes(keyword) ||
          m.field.toLowerCase().includes(keyword) ||
          m.unit.toLowerCase().includes(keyword)
      );

      // 検索結果を表示
      const selectorArea = document.getElementById(
        "pickramu-material-selector-area"
      );
      if (keyword === "") {
        // 検索が空の場合は全教材を表示
        selectorArea.innerHTML = renderMaterialSelector(materials);
      } else {
        // 検索結果を表示
        selectorArea.innerHTML = renderMaterialSelector(filtered);
      }

      // 再度教材ボタンにイベントを付与
      document.querySelectorAll(".pickramu-material-btn").forEach((btn) => {
        btn.onclick = (e) => {
          const file = btn.getAttribute("data-file");
          document.getElementById("pickramu_iframe").src = baseHtmlPath + file;
        };
      });

      // 検索バーのイベントリスナーを再設定
      setupSearchBar();
    }

    // 検索バーのイベントリスナーを設定する関数
    function setupSearchBar() {
      const searchBar = document.getElementById("material-search-bar");
      if (!searchBar) return;

      // 既存のイベントリスナーを削除
      searchBar.removeEventListener("input", searchBar._inputHandler);
      searchBar.removeEventListener("keypress", searchBar._keypressHandler);

      let searchTimeout;

      // inputイベントハンドラー
      searchBar._inputHandler = (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          const keyword = searchBar.value.trim().toLowerCase();
          performSearch(keyword);
        }, 300); // 300msのデバウンス
      };

      // keypressイベントハンドラー
      searchBar._keypressHandler = (e) => {
        if (e.key === "Enter") {
          clearTimeout(searchTimeout);
          const keyword = searchBar.value.trim().toLowerCase();
          performSearch(keyword);
        }
      };

      // 新しいイベントリスナーを追加
      searchBar.addEventListener("input", searchBar._inputHandler);
      searchBar.addEventListener("keypress", searchBar._keypressHandler);
    }

    // 初期検索バー設定
    setupSearchBar();

    // eGuideタブとエリアを常に非表示にする
    const eguideTab = document.getElementById("tab-eguide");
    const eguideArea = document.getElementById("pickramu-eguide-area");
    if (eguideTab) eguideTab.style.display = "none";
    if (eguideArea) eguideArea.style.display = "none";

    // Ctrl+選択でToasterMachineに送信
    const iframe = document.getElementById("pickramu_iframe");
    if (iframe) {
      iframe.onload = () => {
        const doc = iframe.contentDocument || iframe.contentWindow.document;
        doc.addEventListener("mouseup", (e) => {
          if (e.ctrlKey) {
            const sel = doc.getSelection();
            const text = sel ? sel.toString().trim() : "";
            if (text) {
              localStorage.setItem("toastermachine_transfer", text);
              window.open("#chat", "_blank");
            }
          }
        });
      };
    }

    // Initialize parallax effects for pickramu elements
    if (window.parallaxManager) {
      const backBtn = document.getElementById("pickramu-back-btn");
      const tabButtons = document.querySelectorAll(
        "#tab-pickramu, #tab-eguide"
      );
      const materialBtns = document.querySelectorAll(".pickramu-material-btn");
      const selectCard = document.querySelector(".pickramu-select-card");

      if (backBtn) {
        window.parallaxManager.addParallaxEffects(backBtn, {
          hover: true,
          mouse: false,
          touch: true,
          ripple: true,
        });
      }

      tabButtons.forEach((btn) => {
        window.parallaxManager.addParallaxEffects(btn, {
          hover: true,
          mouse: false,
          touch: true,
          ripple: true,
        });
      });

      materialBtns.forEach((btn) => {
        window.parallaxManager.addParallaxEffects(btn, {
          hover: true,
          mouse: false,
          touch: true,
          ripple: true,
        });
      });

      if (selectCard) {
        window.parallaxManager.addParallaxEffects(selectCard, {
          hover: true,
          mouse: true,
          touch: false,
        });
      }

      shell.log({
        from: "dp.app.pickramu.out",
        message: "PickramuApp: Parallax effects initialized",
        level: "info",
      });
    }
  });
}
