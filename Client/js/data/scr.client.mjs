export function initializeSCR() {
  const postButton = document.getElementById("post-button");
  const postNameInput = document.getElementById("postname");
  const postDataInput = document.getElementById("postdata");
  const feedContent = document.getElementById("feed-content");
  const searchButton = document.getElementById("scr-search-btn");
  const searchInput = document.getElementById("scr-search-input");
  
  const server_url = window.localStorage.getItem("scr_url");

  if (!postButton) {
    // まだSCRアプリのDOMが読み込まれていない場合は何もしない
    return;
  }
  
  if (!server_url) {
    console.error("SCRのURLが設定されていません。");
    feedContent.innerHTML = "<p>エラー: SCRサーバーのURLが設定されていません。</p>";
    return;
  }

  postButton.addEventListener("click", () => {
    const postName = postNameInput.value;
    const postData = postDataInput.value;
    if (postName && postData) {
      fetch(`${server_url}/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: postName, data: postData }),
      })
      .then(res => {
        if (!res.ok) throw new Error('投稿に失敗しました');
        return res.json();
      })
      .then(() => {
        postNameInput.value = "";
        postDataInput.value = "";
        document.getElementById('post-form').style.display = 'none';
        loadFeed();
      })
      .catch(error => console.error("Error:", error));
    }
  });

  async function loadFeed(url) {
    const fetchUrl = url || `${server_url}/posts`;
    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) throw new Error('フィードの読み込みに失敗しました');
      const posts = await response.json();
      feedContent.innerHTML = "";
      posts.forEach(post => {
        const postElement = document.createElement("div");
        postElement.className = "post scr-form-card"; // 流用
        postElement.innerHTML = `
          <h3>${post.name}</h3>
          <p style="white-space: pre-wrap;">${post.data}</p>
        `;
        feedContent.appendChild(postElement);
      });
    } catch (e) {
      console.error("フィードの読み込みに失敗しました", e);
      feedContent.innerHTML = "<p>フィードの読み込みに失敗しました</p>";
    }
  }

  searchButton.addEventListener("click", () => {
    const keyword = searchInput.value;
    if (!keyword) {
        loadFeed();
        return;
    };
    loadFeed(`${server_url}/posts/search?q=${keyword}`);
  });

  // 初期読み込み
  loadFeed();
}
