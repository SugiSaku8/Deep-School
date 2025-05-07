function openModal(type) {
  const modal = document.getElementById('modal');
  const content = document.getElementById('modalContent');

  let html = '';

  switch (type) {
    case 'toaster':
      html = `
        <h2>ToasterMachine Plus</h2>
        <p>これはToasterMachine Plusの詳細情報です。</p>
        <img src="placeholder1.png" alt="Detail Image" style="width: 100%; border-radius: 12px;">
      `;
      break;
    case 'math':
      html = `
        <h2>f(x) Math Kit</h2>
        <p>これはMath Kitの詳細情報です。</p>
      `;
      break;
    case 'room':
      html = `
        <h2>Room</h2>
        <p>これはRoomの詳細情報です。</p>
      `;
      break;
  }

  content.innerHTML = html;
  modal.classList.remove('hidden');
  setTimeout(() => modal.classList.add('show'), 10);
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.classList.remove('show');
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300);
}

// Auto-scroll carousel with loop
let scrollIndex = 0;
setInterval(() => {
  const carousel = document.getElementById('carousel');
  if (!carousel) return;

  const items = carousel.querySelectorAll('.pop-item');
  scrollIndex = (scrollIndex + 1) % items.length;
  const scrollTo = items[scrollIndex].offsetLeft;
  carousel.scrollTo({ left: scrollTo, behavior: 'smooth' });
}, 3000);
