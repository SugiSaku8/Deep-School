function openModal(type) {
    const modal = document.getElementById('productModal');
    const content = document.getElementById('modalContent');
  
    let html = '';
  
    switch (type) {
      case 'toaster':
        html = `
          <h2 class="chalk-text">ToasterMachine Plus</h2>
          <p class="chalk-text">これはToasterMachine Plusの詳細情報です。</p>
          <img src="placeholder1.png" alt="Detail Image" style="width: 100%; border-radius: 12px;">
        `;
        break;
      case 'math':
        html = `
          <h2 class="chalk-text">f(x) Math Kit</h2>
          <p class="chalk-text">これはMath Kitの詳細情報です。</p>
        `;
        break;
      case 'room':
        html = `
          <h2 class="chalk-text">Room</h2>
          <p class="chalk-text">これはRoomの詳細情報です。</p>
        `;
        break;
    }
  
    content.innerHTML = html;
    modal.classList.remove('hidden');
    modal.classList.add('popup');
    setTimeout(() => modal.classList.add('show'), 10);
  }
  
  function closeModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
  
  // 自動スライド
  let scrollIndex = 0;
  setInterval(() => {
    const carousel = document.getElementById('imageCarousel');
    if (!carousel) return;
  
    const images = carousel.querySelectorAll('img');
    if (images.length === 0) return;
  
    scrollIndex = (scrollIndex + 1) % images.length;
    const scrollTo = images[scrollIndex].offsetLeft;
    carousel.scrollTo({ left: scrollTo, behavior: 'smooth' });
  }, 3000);