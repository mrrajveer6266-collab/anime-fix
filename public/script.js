
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



// Embedded In-Website Video Player Logic
window.openAnimePlayer = function(title, ep = 1) {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  const embedUrl = `https://vidsrc.to/embed/anime/${cleanTitle}/${ep}`;

  let playerModal = document.getElementById('animeInWebsitePlayer');
  if (!playerModal) {
    playerModal = document.createElement('div');
    playerModal.id = 'animeInWebsitePlayer';
    playerModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.92); z-index:99999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; box-sizing:border-box;';
    document.body.appendChild(playerModal);
  }

  playerModal.innerHTML = `
    <div style="width:100%; max-width:900px; background:#181818; border-radius:12px; overflow:hidden; box-shadow:0 10px 30px rgba(0,0,0,0.8); border:1px solid #333;">
      <div style="padding:12px 20px; background:#222; display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #333;">
        <h3 style="color:#fff; margin:0; font-size:16px; font-family:sans-serif;">Watching: ${title} - Episode ${ep}</h3>
        <button onclick="document.getElementById('animeInWebsitePlayer').style.display='none'; document.getElementById('animeInWebsitePlayer').innerHTML='';" style="background:#ff4d4d; color:#fff; border:none; padding:6px 14px; border-radius:6px; cursor:pointer; font-weight:bold; font-size:14px;">✕ Close</button>
      </div>
      
      <div style="position:relative; width:100%; height:0; padding-bottom:56.25%; background:#000;">
        <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen></iframe>
      </div>

      <div style="padding:15px; background:#181818;">
        <p style="color:#aaa; margin:0 0 10px 0; font-size:13px; font-family:sans-serif;">Select Episode:</p>
        <div style="display:flex; gap:8px; overflow-x:auto; padding-bottom:5px;">
          ${[1,2,3,4,5,6,7,8,9,10,11,12].map(num => `
            <button onclick="openAnimePlayer('${title.replace(/'/g, "\'")}', ${num})" style="background:${num == ep ? '#ff4757' : '#333'}; color:#fff; border:none; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px; font-weight:bold; flex-shrink:0;">Ep ${num}</button>
          `).join('')}
        </div>
      </div>
    </div>
  `;

  playerModal.style.display = 'flex';
};


document.addEventListener('click', function(e) {
  setTimeout(() => {
    const modal = document.querySelector('.modal') || document.querySelector('#modal') || document.querySelector('[class*="modal"]');
    if (modal && !document.getElementById('inWebsiteWatchBtn')) {
      const titleEl = modal.querySelector('h1') || modal.querySelector('h2') || modal.querySelector('h3') || modal.querySelector('.title');
      if (titleEl) {
        const title = titleEl.innerText.trim();
        const btnContainer = document.createElement('div');
        btnContainer.id = 'inWebsiteWatchBtn';
        btnContainer.style.cssText = 'margin:15px 0; text-align:center;';
        btnContainer.innerHTML = `<button onclick="openAnimePlayer('${title.replace(/'/g, "\'")}', 1)" style="background:linear-gradient(45deg, #ff4757, #ff6b81); color:#fff; border:none; padding:12px 24px; border-radius:30px; font-size:16px; font-weight:bold; cursor:pointer; box-shadow:0 4px 15px rgba(255,71,87,0.4);">▶ Watch Episode 1 Now</button>`;
        titleEl.after(btnContainer);
      }
    }
  }, 200);
});
