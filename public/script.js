
// Global Click Listener to Trigger Streaming Modal
document.addEventListener('click', function(e) {
  const card = e.target.closest('.anime-card') || e.target.closest('.card') || e.target.closest('[data-id]') || e.target.closest('article') || e.target.closest('div');
  if (card && typeof playAnimeStream === 'function') {
    const titleEl = card.querySelector('.anime-title') || card.querySelector('h3') || card.querySelector('h4') || card.querySelector('p') || card.querySelector('strong');
    const title = titleEl ? titleEl.innerText.trim() : 'Naruto';
    if (title && !e.target.classList.contains('no-stream')) {
      playAnimeStream(title, 1);
    }
  }
});
