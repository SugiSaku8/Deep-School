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
  const response = await fetch("http://localhost:3776/get?text=" + file);
  const data = await response.json();
  return data;
}

function addfeed(postValue){
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

async function loadFeed() {
  try {
    const response = await fetch("http://localhost:3776/get");
    const data = await response.json();
    let randomIndex = Math.floor(Math.random() * data.length);
    let randomIndexplusone = Math.floor(Math.random() * data.length) +1;
    let selectedPost = data[randomIndex];
    let selectedPostplusone = data[randomIndexplusone];
    let feedContenter = await getPost(selectedPost);
    let feedContenterplusone = await getPost(selectedPostplusone);
    let postValue = feedContenter.value;
    let postValueone = feedContenter.value;

    let div = document.createElement("div");
    div.className = "feed-item";
    div.innerHTML = `
              <strong>${postValue.UserName.value} (${postValue.UserId.value})</strong>
              <p>${postValue.PostName.value}</p>
              <p>${postValue.PostData.value}</p>
              <small>${postValue.PostTime.value}</small>
          `;
    feedContent.appendChild(div);
  } catch (error) {
    console.error("フィードの読み込みに失敗しました:", error);
  }
}

window.onload = async function () {
  await loadFeed();
};
