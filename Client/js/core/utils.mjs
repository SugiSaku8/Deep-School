export function updatePopout(message) {
  const popoutElement = document.getElementById('persistent-popout');
  if (popoutElement) {
    popoutElement.innerHTML = message;
  }
} 