// script.js
import word_check from "./bd/loop.js";
/**
 * 投稿ボタンの要素
 * @type {HTMLButtonElement}
 */
const postButton = document.getElementById("post-button");
/**
 * フィード表示領域の要素
 * @type {HTMLElement}
 */
const feedContent = document.getElementById("feed-content");

/**
 * 投稿ボタンクリック時のイベントリスナー
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
 * オブジェクトから値が0のプロパティを除去する
 * @param {Object} obj 対象のオブジェクト
 * @returns {Object} 0を除去した新しいオブジェクト
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
 * ドット区切りのパスでオブジェクトから値を取得する
 * @param {Object} data 対象データ
 * @param {string} path パス（例: "foo.bar"）
 * @returns {*} 取得した値、またはnull
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
 * 投稿データを取得する
 * @param {string} file 投稿IDまたはファイル名
 * @returns {Promise<Object>} 投稿データ
 */
async function getPost(file) {
  const response = await fetch(scr_url + "/get?text=" + file);
  const data = await response.json();
  return data;
}

/**
 * フィードに投稿を追加する
 * @param {Object} postValue 投稿データ
 */
function addfeed(postValue) {
  let div = document.createElement("div");
  div.className = "feed-item";
  div.innerHTML = `
            <strong>${postValue.UserName.value} (${postValue.UserId.value})</strong>
            <p>${postValue.PostName.value}</p>
            <p>${postValue.PostData.value}</p>
            <small>${postValue.PostTime.value}</small>
        `;
  feedContent.appendChild(div);
}

/**
 * リプライHTMLを生成する
 * @param {Object} postValue 投稿データ
 * @returns {string} リプライHTML
 */
function createReplyHTML(postValue) {
  // LinkerDataからreplyedのpostIdを取得
  const replyedPostId = postValue.LinkerData.find(
    (item) => typeof item === "object" && item !== null && item.replyed
  )?.replyed;

  let html = '<div class="replies">';
  html += `
    <div class="reply">
      <strong>${postValue.UserName.value} (${postValue.UserId.value})</strong>
      <p>${postValue.PostData.value}</p>
      <small>${postValue.PostTime.value}</small>
      <p>返信先: ${replyedPostId}</p>
    </div>
  `;
  html += "</div>";
  return html;
}

/**
 * フィードを読み込んで表示する
 * @returns {Promise<void>}
 */
export default async function loadFeed() {
  try {
    if (typeof window.scr_url === undefined || window.scr_url === null) {
      throw new Error("指定されたSCRサーバーは存在しません。");
    }
    console.log("Loading Feed With " + window.scr_url);
    const response = await fetch(window.scr_url + "/get");
    const data = await response.json();
    //!undefinedかテスト
    if (typeof data === undefined) {
      throw new Error("SCRにデータが存在しません。");
    }
    const numberOfPostsToLoad = Math.min(50); // 最大 50 件、またはデータ数
    const loadedPosts = [];
    const postsMap = new Map(); // postId をキーとして投稿を保存

    // 1. すべての投稿をロードし、postsMap に保存
    //!undefinedかテスト
    if (typeof data[1] === undefined) {
      throw new Error("SCRにデータが存在しません。");
    }
    for (let i = 0; i < data.length; i++) {
      let selectedPost = data[i];
      //!undefinedかテスト
      if (
        typeof selectedPost === undefined ||
        selectedPost === null ||
        !selectedPost
      ) {
        throw new Error("SCRにデータが存在しません。");
      }
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

      // リプライの場合、親投稿を探してその下に表示
      if (
        postValue.LinkerData &&
        postValue.LinkerData.some(
          (item) => typeof item === "object" && item !== null && item.replyed
        )
      ) {
        const replyedPostId = postValue.LinkerData.find(
          (item) => typeof item === "object" && item !== null && item.replyed
        ).replyed;
        const parentPost = postsMap.get(replyedPostId);

        if (parentPost) {
          // 親投稿が存在する場合、その下にリプライを表示
          div.innerHTML = `
            <div class="reply">
              <strong>${postValue.UserName.value} (${postValue.UserId.value})</strong>
              <p>${postValue.PostData.value}</p>
              <small>${postValue.PostTime.value}</small>
              <p>返信先: ${replyedPostId}</p>
            </div>
          `;
          // 親投稿の要素を取得して、その下に追加
          const parentDiv = document.querySelector(
            `.feed-item[data-post-id="${replyedPostId}"]`
          );
          if (parentDiv) {
            parentDiv.appendChild(div);
            continue; // 通常のフィードへの追加をスキップ
          }
        }
      }

      // リプライでない場合は、通常のフィードに投稿を表示
      div.innerHTML = `
        <strong>${postValue.UserName.value} (${postValue.UserId.value})</strong>
        <p>${postValue.PostName.value}</p>
        <p>${postValue.PostData.value}</p>
        <small>${postValue.PostTime.value}</small>
        <button class="reply-button auto-btn" data-post-id="${postValue.PostId.value}">Reply</button>
        <div class="reply-form" style="display:none;">
          <textarea class="reply-text"></textarea>
          <button class="submit-reply auto-btn" data-post-id="${postValue.PostId.value}">Submit Reply</button>
        </div>
        <div class="replies"></div>
      `;
      div.dataset.postId = postValue.PostId.value; // postId を data 属性として保存
      feedContent.appendChild(div);
    }
  } catch (error) {
    console.error("フィードの読み込みに失敗しました:", error);
  }
}

/**
 * リプライボタン・リプライ送信ボタンのイベントリスナー
 */
document.addEventListener("click", async (event) => {
  if (event.target.classList.contains("reply-button")) {
    const postId = event.target.dataset.postId;
    const replyForm = event.target.parentNode.querySelector(".reply-form");
    replyForm.style.display = "block";
  }

  if (event.target.classList.contains("submit-reply")) {
    const postId = event.target.dataset.postId;
    const replyText =
      event.target.parentNode.querySelector(".reply-text").value;
    if (word_check(replyText)) {
      const username = "Reply";
      const userid = "@Reply";

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
            },
          ],
        }),
      });

      const result = await response.json();
      console.log(result.message);
      loadFeed(); // フィードをリロードしてリプライを表示
    }
  }
});
