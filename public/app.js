document.addEventListener('DOMContentLoaded', () => {
  const grid = document.getElementById('anime-grid');
  const statusContainer = document.getElementById('status-container');
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const pagination = document.getElementById('pagination');
  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const pageNum = document.getElementById('page-num');
  const modal = document.getElementById('detail-modal');
  const modalBody = document.getElementById('modal-body');
  const closeModal = document.getElementById('close-modal');
  const tabAll = document.getElementById('tab-all');
  const tabHindi = document.getElementById('tab-hindi');

  let currentPage = 1;
  let currentMode = 'top';
  let currentQuery = '';
  let activeFilter = 'all';

  loadAnimeCatalog();

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    if (!query) return;
    currentMode = 'search';
    currentQuery = query;
    currentPage = 1;
    loadAnimeCatalog();
  });

  tabAll.addEventListener('click', () => {
    activeFilter = 'all';
    tabAll.classList.add('active');
    tabHindi.classList.remove('active');
    currentPage = 1;
    currentMode = 'top';
    loadAnimeCatalog();
  });

  tabHindi.addEventListener('click', () => {
    activeFilter = 'hindi';
    tabHindi.classList.add('active');
    tabAll.classList.remove('active');
    currentPage = 1;
    currentMode = 'search';
    currentQuery = 'hindi';
    loadAnimeCatalog();
  });

  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      loadAnimeCatalog();
    }
  });

  nextBtn.addEventListener('click', () => {
    currentPage++;
    loadAnimeCatalog();
  });

  closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
    modalBody.innerHTML = '';
  });

  async function loadAnimeCatalog() {
    grid.innerHTML = '';
    statusContainer.style.display = 'block';
    statusContainer.innerText = 'Anime Fix लोड हो रहा है...';
    pagination.style.display = 'none';

    let url = currentMode === 'search' 
      ? `/api/anime/search?q=${encodeURIComponent(currentQuery)}&page=${currentPage}`
      : `/api/anime/top?page=${currentPage}`;

    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        statusContainer.innerText = 'कोई एनिमे नहीं मिला।';
        return;
      }

      statusContainer.style.display = 'none';
      renderGrid(data.items);

      pagination.style.display = 'flex';
      pageNum.innerText = `Page ${currentPage}`;
      prevBtn.disabled = currentPage === 1;
      nextBtn.disabled = !data.hasNextPage;

    } catch (err) {
      console.error(err);
      statusContainer.style.display = 'block';
      statusContainer.className = 'error-msg';
      statusContainer.innerText = 'डेटा लोड करने में समस्या आई। कृपया पुनः प्रयास करें।';
    }
  }

  function renderGrid(items) {
    items.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'card';
      
      const fallbackImg = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" fill="%232A2C3D"><rect width="100" height="100"/></svg>';
      const imgUrl = anime.image || fallbackImg;

      card.innerHTML = `
        <img src="${imgUrl}" alt="${anime.title}" loading="lazy" onerror="this.src='${fallbackImg}'" />
        <div class="card-info">
          <div class="card-title">${anime.title}</div>
          <div class="card-meta">
            <span>${anime.type}</span>
            <span>Ep: ${anime.episodes}</span>
          </div>
        </div>
      `;

      card.addEventListener('click', () => openDetailModal(anime.id));
      grid.appendChild(card);
    });
  }

  async function openDetailModal(id) {
    modal.style.display = 'block';
    modalBody.innerHTML = '<div class="status-msg">विवरण लोड हो रहा है...</div>';

    try {
      const [animeRes, epRes, vidRes] = await Promise.all([
        fetch(`/api/anime/${id}`),
        fetch(`/api/anime/${id}/episodes`),
        fetch(`/api/anime/${id}/videos`)
      ]);

      const anime = await animeRes.json();
      const episodes = await epRes.json();
      const videoData = await vidRes.json();

      let videoHtml = '<div class="no-video-notice">इस episode के लिए authorized video source उपलब्ध नहीं है.</div>';
      if (videoData.authorizedVideo && videoData.authorizedVideo.url) {
        videoHtml = `
          <div class="player-container">
            <iframe src="${videoData.authorizedVideo.url}" allowfullscreen></iframe>
          </div>
        `;
      }

      let epListHtml = '<p style="color: var(--text-sub);">एपिसोड की जानकारी उपलब्ध नहीं है।</p>';
      if (Array.isArray(episodes) && episodes.length > 0) {
        epListHtml = `
          <div class="episodes-list">
            ${episodes.map(e => `<div class="ep-item">Ep ${e.id}:${e.title}</div>`).join('')}
          </div>
        `;
      }

      modalBody.innerHTML = `
        <div class="detail-header">
          <img src="${anime.image}" class="detail-poster" />
          <div class="detail-body">
            <h2>${anime.title}</h2>
            <p style="color: var(--text-sub);">${anime.japaneseTitle}</p>
            <p><strong>Score:</strong> ${anime.score} | <strong>Type:</strong> ${anime.type}</p>
            <p><strong>Genres:</strong> ${anime.genres.join(', ') || 'N/A'}</p>
            <p style="margin-top: 8px; line-height: 1.4; font-size: 0.85rem;">${anime.synopsis}</p>
          </div>
        </div>
        
        <div class="audio-selector">
          <button class="audio-btn active">Japanese / Sub</button>
          <button class="audio-btn">Hindi Dubbed</button>
        </div>

        <h3>Trailer / Preview</h3>
        ${videoHtml}
        
        <h3 style="margin-top: 16px;">Episode List</h3>
        ${epListHtml}
      `;

    } catch (err) {
      console.error(err);
      modalBody.innerHTML = '<div class="error-msg">विवरण लोड करने में समस्या आई।</div>';
    }
  }
});
