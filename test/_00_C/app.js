// script.js
const postButton = document.getElementById("post-button");
const feedContent = document.getElementById("feed-content");

postButton.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const userid = document.getElementById("userid").value;
  const postname = document.getElementById("postname").value;
  const postdata = document.getElementById("postdata").value;

  const response = await fetch("http://localhost:3776/post", {
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
// 入力例
const json = { データ: 0, キー1: 0, キー2: 0 };

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
function getValue(d, path) {
  const parts = path.split(".");
  let current = d;

  for (let part of parts) {
    if (!current || typeof current !== "object") {
      return null;
    }
    current = current[part];
  }

  return current;
}
async function loadFeed() {
  const response = await fetch("http://localhost:3776/get");
  let data = await response.json();
  console.log(data)
  data = data.filter(item => item !== 0);
  data = JSON.stringify(data);
  feedContent.innerHTML = "";
  const randomIndex = Math.floor(Math.random() * data.length);
  const feedItem = data[randomIndex];
  console.log(feedItem);
  console.log(getValue(feedItem, "value.PostName.value")); // "Sugisaku8によるテスト投稿"
  console.log(getValue(feedItem, "value.PostId.value")); // "@sugisaku8;2025-04-09T08:29:35.294Z"
  console.log(getValue(feedItem, "value.PostName.value")); // "Sugisaku8によるテスト投稿"
  console.log(getValue(feedItem, "value.PostTime.value")); // "2025-04-09T08:29:35.294Z"
  console.log(getValue(feedItem, "value.UserId.value")); // "@sugisaku8"
  console.log(getValue(feedItem, "value.UserName")); // "Sugisaku8"
  console.log(getValue(feedItem, "value.LikerData.value"));
  if (!(feedItem === 0)) {
    if (feedItem) {
      const div = document.createElement("div");
      div.className = "feed-item";
      div.innerHTML = `
              <strong>${feedItem.UserName} (${feedItem.UserId})</strong>
              <p>${feedItem.PostName}</p>
              <p>${feedItem.PostData}</p>
              <small>${feedItem.PostTime}</small>
          `;
      feedContent.appendChild(div);
    }
  } else {
    await RechankFeed(data);
  }
}

window.onload = async function () {
  await loadFeed();
};
