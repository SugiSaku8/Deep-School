document.getElementById('submit-post').addEventListener('click', async () => {
    const title = document.getElementById('title').value;
    const body = document.getElementById('body').value;
    const genre = document.getElementById('genre').value;
    const user = document.getElementById('user').value;

    if (title && body && genre && user) {
        const response = await fetch('/send', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, body, genre, user })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            loadPosts();
        } else {
            alert(result.message);
        }
    } else {
        alert('すべての項目を入力してください。');
    }
});

async function loadPosts() {
    const response = await fetch('/genre/your_genre'); // ジャンルを指定
    const result = await response.json();
    const postList = document.getElementById('post-list');
    postList.innerHTML = '';

    result.data.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <h3>${post.name}</h3>
            <p>${post.andel}</p>
            <p><strong>ユーザー:</strong> ${post.user}</p>
            <p><strong>作成日時:</strong> ${new Date(post.time).toLocaleString()}</p>
            <button onclick="showReplies('${post.id}')">リプライ</button>
            <div id="replies-${post.id}"></div>
            <div class="reply-form" id="reply-form-${post.id}">
                <textarea placeholder="リプライを入力"></textarea>
                <input type="text" placeholder="ユーザー名" id="reply-user-${post.id}">
                <button onclick="submitReply('${post.id}')">リプライを送信</button>
            </div>
        `;
        postList.appendChild(postDiv);
    });
}

async function showReplies(postId) {
    const repliesDiv = document.getElementById(`replies-${postId}`);
    const response = await fetch(`/replies/your_genre/${postId}`); // ジャンルを指定
    const result = await response.json();

    repliesDiv.innerHTML = '';
    result.data.forEach(reply => {
        const replyDiv = document.createElement('div');
        replyDiv.className = 'reply';
        replyDiv.innerHTML = `
            <p>${reply.content}</p>
            <p><strong>ユーザー:</strong> ${reply.user}</p>
            <p><strong>作成日時:</strong> ${new Date(reply.time).toLocaleString()}</p>
        `;
        repliesDiv.appendChild(replyDiv);
    });
}

async function submitReply(postId) {
    const replyContent = document.querySelector(`#reply-form-${postId} textarea`).value;
    const user = document.querySelector(`#reply-user-${postId}`).value;

    if (replyContent && user) {
        const response = await fetch('/reply', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                parentId: postId,
                content: replyContent,
                user: user,
                genre: 'your_genre' // ジャンルを指定
            })
        });

        const result = await response.json();
        if (result.status === 'success') {
            alert(result.message);
            loadPosts(); // 投稿を再読み込みしてリプライを表示
        } else {
            alert(result.message);
        }
    } else {
        alert('リプライ内容とユーザー名を入力してください。');
    }
}

document.getElementById('search-button').addEventListener('click', async () => {
    const query = document.getElementById('search-query').value;
    const response = await fetch(`/search?query=${query}`);
    const result = await response.json();
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';

    result.data.forEach(post => {
        const postDiv = document.createElement('div');
        postDiv.className = 'post';
        postDiv.innerHTML = `
            <h3>${post.name}</h3>
            <p>${post.andel}</p>
            <p><strong>ユーザー:</strong> ${post.user}</p>
            <p><strong>作成日時:</strong> ${new Date(post.time).toLocaleString()}</p>
        `;
        searchResults.appendChild(postDiv);
    });
});

// 初期投稿の読み込み
loadPosts();