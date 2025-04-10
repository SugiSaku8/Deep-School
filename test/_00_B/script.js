document.getElementById('postForm').addEventListener('submit', function(event) {
    event.preventDefault(); // フォームのデフォルトの送信を防ぐ

    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    console.log(data);
    fetch('http://localhost:3776/post', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => response.json())
    .then(data => {
        console.log('成功:', data);
        alert('ポストが成功しました！');
    })
    .catch((error) => {
        console.error('エラー:', error);
        alert('ポストに失敗しました。');
    });
});
