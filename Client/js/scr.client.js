import scr_url from "./con.js";
const postButton = document.getElementById("post-button");
const feedContent = document.getElementById("feed-content");

postButton.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const userid = document.getElementById("userid").value;
  const postname = document.getElementById("postname").value;
  const postdata = document.getElementById("postdata").value;

  const response = await fetch(scr_url + "/post", {
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

// 0を除去する関数
function removeZeros(obj) {
  const newObj = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value !== 0) {
      newObj[key] = value;
    }
  }

  return newObj;
}

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

async function getPost(file) {
  const response = await fetch(
    scr_url + "http://localhost:3776/get?text=" + file
  );
  const data = await response.json();
  return data;
}

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

async function loadFeed() {
  try {
    const response = await fetch(scr_url + "/get");
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
        <div class="feed-card">
          <h3>${postValue.PostName?.value || ''}</h3>
          <div class="meta">
            <span>${postValue.Genre?.value || 'general'}</span>
            <span>${postValue.UserId?.value || ''}</span>
          </div>
          <div class="content">
            ${postValue.PostData?.value || ''}
          </div>
          <button class="reply-button" data-post-id="${postValue.PostId?.value || ''}">返信</button>
          <div class="date">${new Date(postValue.PostTime?.value || new Date()).toLocaleDateString('ja-JP')}</div>
          <div class="reply-thread"></div>
        </div>
      `;
      div.dataset.postId = postValue.PostId.value; // postId を data 属性として保存
      feedContent.appendChild(div);
    }
  } catch (error) {
    console.error("フィードの読み込みに失敗しました:", error);
  }
}

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
      event.target.parentNode.insertBefore(form, event.target.parentNode.querySelector(".reply-thread"));
    } else {
      replyForm.style.display = replyForm.style.display === "none" ? "block" : "none";
    }
  }

  if (event.target.classList.contains("submit-reply")) {
    const postId = event.target.dataset.postId;
    const replyText = event.target.parentNode.querySelector(".reply-text").value;
    const username = "Reply";
    const userid = "@Reply";

    const response = await fetch(scr_url + "/post", {
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
    loadFeed();
  }
});

window.onload = async function () {
  await loadFeed();
};

const style = document.createElement('style');
style.textContent = `
  .feed-card {
    background: white;
    border-radius: 8px;
    padding: 16px;
    margin-bottom: 16px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .feed-card h3 {
    margin: 0 0 8px 0;
    font-size: 1.2em;
    color: #333;
  }

  .meta {
    display: flex;
    gap: 8px;
    margin-bottom: 8px;
    color: #666;
    font-size: 0.9em;
  }

  .content {
    margin-bottom: 12px;
    line-height: 1.5;
  }

  .reply-button {
    background: #f0f0f0;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    margin-bottom: 8px;
  }

  .reply-button:hover {
    background: #e0e0e0;
  }

  .date {
    color: #999;
    font-size: 0.8em;
  }

  .reply-thread {
    margin-top: 16px;
    border-left: 3px solid #e0e0e0;
    padding-left: 16px;
  }

  .reply-card {
    background: #f8f8f8;
    border-radius: 6px;
    padding: 12px;
    margin-bottom: 8px;
  }

  .reply-meta {
    color: #666;
    font-size: 0.9em;
    margin-bottom: 4px;
  }

  .reply-content {
    margin-bottom: 4px;
    line-height: 1.4;
  }

  .reply-date {
    color: #999;
    font-size: 0.8em;
  }

  .reply-form {
    margin: 12px 0;
    padding: 12px;
    background: #f8f8f8;
    border-radius: 6px;
  }

  .reply-form textarea {
    width: 100%;
    min-height: 80px;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-bottom: 8px;
    resize: vertical;
  }

  .reply-form button {
    background: #4CAF50;
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
  }

  .reply-form button:hover {
    background: #45a049;
  }
`;
document.head.appendChild(style);
