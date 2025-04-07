class DeepSchoolerClient {
    constructor() {
        this.baseUrl = 'http://localhost:3776';
        this.currentUserId = Math.random().toString(36).substr(2, 9);
        this.feedContainer = document.getElementById('feed-container');
        this.replyModal = document.getElementById('reply-modal');
        this.replyContent = document.getElementById('reply-content');
        this.setupEventListeners();
        this.loadFeed();
    }

    setupEventListeners() {
        // リプライモーダルの開閉処理
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('feed-item')) {
                const postId = e.target.dataset.postId;
                this.openReplyModal(postId);
            }
        });
    }

    async loadFeed() {
        try {
            const response = await fetch(`${this.baseUrl}/get`);
            if (!response.ok) {
                throw new Error(`サーバーからのレスポンスが異常です: ${response.status}`);
            }
            const indexData = await response.json();
            
            // ランダムなフィードを生成
            const randomPosts = this.generateRandomFeed(indexData);
            this.renderFeed(randomPosts);
        } catch (error) {
            console.error('フィードの読み込みに失敗しました:', error);
            this.feedContainer.innerHTML = '<p>投稿の読み込みに失敗しました。もう一度お試しください。</p>';
        }
    }

    generateRandomFeed(indexData) {
        const posts = Object.values(indexData).filter(item => 
            item !== null && 
            this.isValidDateObject(item.PostTime)
        );
        
        const randomPosts = [];
        const count = Math.min(10, posts.length);
        
        for (let i = 0; i < count; i++) {
            const randomIndex = Math.floor(Math.random() * posts.length);
            randomPosts.push(posts[randomIndex]);
            posts.splice(randomIndex, 1);
        }
        
        return randomPosts;
    }

    isValidDateObject(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    renderFeed(posts) {
        this.feedContainer.innerHTML = '';
        posts.forEach(post => {
            const feedItem = this.createFeedItem(post);
            this.feedContainer.appendChild(feedItem);
        });
    }

    createFeedItem(post) {
        const div = document.createElement('div');
        div.className = 'feed-item';
        div.dataset.postId = post.PostId;

        const replyCount = this.countReplies(post.LinkerData);
        const replyIndicator = replyCount > 0 ? 
            `<span class="reply-indicator">${replyCount}件の返信</span>` : '';

        // データの存在を確認してから表示
        const userName = post.UserName || '(匿名)';
        const postData = post.PostData || '(投稿内容なし)';
        const postTime = this.isValidDateObject(post.PostTime) ? 
            new Date(post.PostTime).toLocaleString() : 
            '(日時不明)';

        div.innerHTML = `
            <h3>${userName}</h3>
            <p>${postData}</p>
            <small>${postTime}</small>
            ${replyIndicator}
        `;
        
        return div;
    }

    countReplies(linkerData) {
        if (!linkerData) return 0;
        return linkerData.split(',').length;
    }

    openReplyModal(postId) {
        this.replyModal.style.display = 'block';
        this.currentPostId = postId;
    }

    closeModal() {
        this.replyModal.style.display = 'none';
        this.replyContent.value = '';
    }

    async postMessage() {
        const username = document.getElementById('username').value;
        const content = document.getElementById('post-content').value;

        if (!username || !content) {
            alert('ユーザー名と投稿内容は必須です');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    UserName: username,
                    UserId: this.currentUserId,
                    PostName: `post_${Date.now()}`,
                    PostTime: new Date().toISOString(),
                    PostData: content,
                    Genre: '',
                    LinkerData: ''
                })
            });

            if (response.ok) {
                document.getElementById('post-content').value = '';
                this.loadFeed(); // フィードを更新
            } else {
                throw new Error('投稿に失敗しました');
            }
        } catch (error) {
            console.error('エラー:', error);
            alert('投稿に失敗しました。もう一度お試しください。');
        }
    }

    async sendReply() {
        const replyContent = this.replyContent.value;
        if (!replyContent) {
            alert('リプライ内容を入力してください');
            return;
        }

        try {
            const response = await fetch(`${this.baseUrl}/post`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    UserName: document.getElementById('username').value,
                    UserId: this.currentUserId,
                    PostName: `reply_${Date.now()}`,
                    PostTime: new Date().toISOString(),
                    PostData: replyContent,
                    Genre: 'reply',
                    LinkerData: this.currentPostId
                })
            });

            if (response.ok) {
                this.closeModal();
                this.loadFeed(); // フィードを更新
            } else {
                throw new Error('リプライに失敗しました');
            }
        } catch (error) {
            console.error('エラー:', error);
            alert('リプライに失敗しました。もう一度お試しください。');
        }
    }
}

// クラスのインスタンスを作成してアプリケーションを開始
const app = new DeepSchoolerClient();