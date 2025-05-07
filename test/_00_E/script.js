function openModal(type) {
  const modal = document.getElementById("modal");
  const content = document.getElementById("modalContent");

  let html = "";

  switch (type) {
    case "toaster":
      html = `
          <h2>ToasterMachine Plus</h2>
          <p>これはToasterMachine Plusの詳細情報です。</p>
          <img src="placeholder1.png" alt="Detail Image" style="width: 100%; border-radius: 12px;">
        `;
      break;
    case "math":
      html = `
          <h2>f(x) Math Kit</h2>
          <p>これはMath Kitの詳細情報です。</p>
        `;
      break;
    case "room":
      html = `
          <h2>Room</h2>
          <p>これはRoomの詳細情報です。</p>
        `;
      break;
  }

  content.innerHTML = html;
  modal.classList.remove("hidden");
  setTimeout(() => modal.classList.add("show"), 10); // スムーズ表示
}

function closeModal() {
  const modal = document.getElementById("modal");
  modal.classList.remove("show");
  setTimeout(() => {
    modal.classList.add("hidden");
  }, 300); // アニメーション終了後に非表示
}

// POP 自動スライド：ループ付き
let scrollIndex = 0;
setInterval(() => {
  const carousel = document.getElementById("carousel");
  if (!carousel) return;

  const images = carousel.querySelectorAll("img");
  scrollIndex = (scrollIndex + 1) % images.length;
  const scrollTo = images[scrollIndex].offsetLeft;
  carousel.scrollTo({ left: scrollTo, behavior: "smooth" });
}, 3000);
