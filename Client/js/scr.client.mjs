const postButton = document.getElementById("post-button");
const feedContent = document.getElementById("feed-content");

/**
 * 投稿ボタンのクリックイベント
 * @param {string} username 投稿者の名前
 * @param {string} userid 投稿者のID
 * @param {string} postname 投稿タイトル
 * @param {string} postdata 投稿内容
 * @param {string} PostTime 投稿日時（ISO8601形式）
 * @param {string} Genre 投稿ジャンル（通常は"general"、リプライ時は"Reply"）
 * @param {Array} LinkerData リプライ情報配列（通常投稿時は空配列、リプライ時は返信情報を格納）
 */
postButton.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const userid = document.getElementById("userid").value;
  const postname = document.getElementById("postname").value;
  const postdata = document.getElementById("postdata").value;

  const response = await fetch(window.scr_url + "/post", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      UserName: username,
      UserId: userid,
      PostName: postname,
      PostData: postdata,
      PostTime: new Date().toISOString(),
      Genre: "general",
      LinkerData: [], // リプライ用のデータ
    }),
  });

  const result = await response.json();
  console.log(result.message);
  loadFeed();
});

/**
 * 0を除去する関数
 * @param {Object} obj 任意のオブジェクト
 * @returns {Object} 0以外の値のみを持つ新しいオブジェクト
 */
function removeZeros(obj) {
  const newObj = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== 0) {
      newObj[key] = value;
    }
  }

  return newObj;
}

/**
 * オブジェクトからパスで値を取得
 * @param {Object} data データオブジェクト
 * @param {string} path ドット区切りのパス
 * @returns {any} 指定パスの値
 */
function getValue(data, path) {
  if (!data || typeof data !== "object") return null;

  const parts = path.split(".");
  let current = data;

  for (let part of parts) {
    if (!current?.value && !current?.[part]) return null;
    current = current.value ? current.value : current[part];

    if (typeof current !== "object" || !current) return null;
  }

  return current;
}

/**
 * 投稿データを取得
 * @param {string} file 投稿IDまたはファイル名
 * @returns {Promise<Object>} 投稿データ
 */
async function getPost(file) {
  const response = await fetch(
    window.scr_url + "/get?text=" + file
  );
  const data = await response.json();
  return data;
}

/**
 * フィードに投稿を追加
 * @param {Object} postValue 投稿データ
 */
function addfeed(postValue) {
  let div = document.createElement("div");
  div.className = "feed-item";
  div.innerHTML = `
        <div class="feed-card">
          <h3>${postValue.PostName?.value || ""}</h3>
          <div class="meta">
            <span>${postValue.Genre?.value || "general"}</span>
            <span>${postValue.UserId?.value || ""}</span>
          </div>
          <div class="content">
            ${postValue.PostData?.value || ""}
          </div>
          <button class="reply-button" data-post-id="${
            postValue.PostId?.value || ""
          }">返信</button>
          <div class="date">${new Date(
            postValue.PostTime?.value || new Date()
          ).toLocaleDateString("ja-JP")}</div>
          <div class="reply-thread"></div>
        </div>
      `;
  feedContent.appendChild(div);
}

/**
 * フィードを読み込む
 */
export async function loadFeed() {
  try {
    const response = await fetch(window.scr_url +"/get");
    const data = await response.json();
    const numberOfPostsToLoad = Math.min(50); // 最大 50 件、またはデータ数
    const loadedPosts = [];
    const postsMap = new Map(); // postId をキーとして投稿を保存

    // 1. すべての投稿をロードし、postsMap に保存
    for (let i = 0; i < data.length; i++) {
      let selectedPost = data[i];
      let feedContenter = await getPost(selectedPost);
      let postValue = feedContenter.value;
      postsMap.set(postValue.PostId.value, postValue);
    }

    // 2. ランダムに選択された投稿を表示
    for (let i = 0; i < numberOfPostsToLoad; i++) {
      let randomIndex = Math.floor(Math.random() * data.length);
      let selectedPost = data[randomIndex];
      let feedContenter = await getPost(selectedPost);
      let postValue = feedContenter.value;

      // 既に読み込んだ投稿はスキップ
      if (loadedPosts.includes(postValue.PostId.value)) {
        continue;
      }
      loadedPosts.push(postValue.PostId.value);

      let div = document.createElement("div");
      div.className = "feed-item";

      // 投稿のHTMLを生成
      div.innerHTML = `
        <div class="feed-card">
          <h3>${postValue.PostName?.value || ""}</h3>
          <div class="meta">
            <span>${postValue.Genre?.value || "general"}</span>
            <span>${postValue.UserId?.value || ""}</span>
          </div>
          <div class="content">
            ${postValue.PostData?.value || ""}
          </div>
          <button class="reply-button" data-post-id="${
            postValue.PostId?.value || ""
          }">返信</button>
          <div class="date">${new Date(
            postValue.PostTime?.value || new Date()
          ).toLocaleDateString("ja-JP")}</div>
          <div class="reply-thread"></div>
        </div>
      `;

      // リプライがある場合、返信を表示
      if (postValue.LinkerData && postValue.LinkerData.length > 0) {
        const replyThread = div.querySelector(".reply-thread");
        postValue.LinkerData.forEach((reply) => {
          const replyCard = document.createElement("div");
          replyCard.className = "reply-card";
          replyCard.innerHTML = `
            <div class="reply-meta">${reply.UserId || "@Unknown"}</div>
            <div class="reply-content">${reply.PostData || ""}</div>
            <div class="reply-date">${new Date(
              reply.PostTime || new Date()
            ).toLocaleDateString("ja-JP")}</div>
          `;
          replyThread.appendChild(replyCard);
        });
      }

      feedContent.appendChild(div);
    }
  } catch (error) {
    console.error("フィードの読み込みに失敗しました:", error);
  }
}

/**
 * 返信ボタン・返信送信ボタンのイベント
 * @param {Event} event クリックイベント
 */
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("reply-button")) {
    const postId = event.target.dataset.postId;
    const replyForm = event.target.parentNode.querySelector(".reply-form");
    if (!replyForm) {
      const form = document.createElement("div");
      form.className = "reply-form";
      form.innerHTML = `
        <textarea class="reply-text" placeholder="返信を入力..."></textarea>
        <button class="submit-reply" data-post-id="${postId}">送信</button>
      `;
      event.target.parentNode.insertBefore(
        form,
        event.target.parentNode.querySelector(".reply-thread")
      );
    } else {
      replyForm.style.display =
        replyForm.style.display === "none" ? "block" : "none";
    }
  }

  if (event.target.classList.contains("submit-reply")) {
    const postId = event.target.dataset.postId;
    const replyText =
      event.target.parentNode.querySelector(".reply-text").value;
    const username = "Reply";
    const userid = "@Reply";

    /**
     * リプライ送信時のパラメータ
     * @param {string} PostName 返信タイトル（例: "12345 's Reply"）
     * @param {string} UserName 返信者名（デフォルト: "Reply"）
     * @param {string} UserId 返信者ID（デフォルト: "@Reply"）
     * @param {string} PostData 返信内容
     * @param {string} PostTime 返信日時（ISO8601形式）
     * @param {string} Genre 投稿ジャンル（"Reply" 固定）
     * @param {Array} LinkerData 返信情報配列（1件のみ）
     *   @param {string} replyed 返信先投稿ID
     *   @param {string} UserId 返信者ID
     *   @param {string} PostData 返信内容
     *   @param {string} PostTime 返信日時
     */
    const response = await fetch(window.scr_url + "/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        PostName: postId + " 's Reply",
        UserName: username,
        UserId: userid,
        PostData: replyText,
        PostTime: new Date().toISOString(),
        Genre: "Reply",
        LinkerData: [
          {
            replyed: postId,
            UserId: userid,
            PostData: replyText,
            PostTime: new Date().toISOString(),
          },
        ],
      }),
    });

    const result = await response.json();
    console.log(result.message);

    // 返信を表示する処理を追加
    const replyCard = document.createElement("div");
    replyCard.className = "reply-card";
    replyCard.innerHTML = `
      <div class="reply-meta">${userid}</div>
      <div class="reply-content">${replyText}</div>
      <div class="reply-date">${new Date().toLocaleDateString("ja-JP")}</div>
    `;
    const replyThread = document.querySelector(
      `.feed-item[data-post-id="${postId}"] .reply-thread`
    );
    replyThread.appendChild(replyCard);

    loadFeed();
  }
});

