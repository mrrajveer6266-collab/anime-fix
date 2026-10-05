let rawAnimeList = [];
let currentOffset = 0;
let currentSearchQuery = "";
let currentAnime = null;
let currentEp = 1;
let currentServer = 1;

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function loadTopAnime(isLoadMore = false) {
  const status = document.getElementById('statusText');
  
  if (!isLoadMore) {
    currentOffset = 0;
    rawAnimeList = [];
    currentSearchQuery = "";
    if (status) status.innerHTML = '⏳ Fetching latest anime catalog...';
  }

  try {
    const res = await fetch(`/api/anime/top?offset=${currentOffset}`);
    const result = await res.json();
    
    if (result && result.data) {
      const newItems = result.data.map(item => item.node);
      rawAnimeList = rawAnimeList.concat(newItems);
      renderAnimeList(rawAnimeList);
      if (status) status.innerHTML = `Showing <b>${rawAnimeList.length}</b> Anime`;
    }
  } catch (err) {
    console.error(err);
    if (status) status.innerHTML = '⚠️ Network error loading anime.';
  }
}

function renderAnimeList(list) {
  const grid = document.getElementById('animeGrid');
  if (!grid) return;

  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#aaa;">No anime found.</div>';
    return;
  }

  list.forEach(item => {
    const title = item.title;
    const score = item.mean ? item.mean : 'N/A';
    const eps = item.num_episodes ? `${item.num_episodes} Ep` : 'Airing';
    const img = item.main_picture?.large || item.main_picture?.medium || 'https://via.placeholder.com/300x400';

    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img}" alt="${title}" loading="lazy">
        <div class="card-score">⭐ ${score}</div>
      </div>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-meta">📺 ${eps} • ${(item.media_type || 'TV').toUpperCase()}</div>
        <button class="watch-btn" onclick="openWatchPage(${item.id})">
          ▶ Watch Now
        </button>
      </div>
    `;
    grid.appendChild(card);
  });

  let loadMoreBtn = document.getElementById('loadMoreBtn');
  if (!loadMoreBtn) {
    loadMoreBtn = document.createElement('button');
    loadMoreBtn.id = 'loadMoreBtn';
    loadMoreBtn.style.cssText = 'grid-column: 1/-1; margin: 30px auto; display: block; padding: 12px 30px; background: #ff6600; color: #fff; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 15px;';
    loadMoreBtn.innerText = '⬇ Load More Anime';
    loadMoreBtn.onclick = handleLoadMore;
  }
  grid.appendChild(loadMoreBtn);
}

function handleLoadMore() {
  currentOffset += 50;
  if (currentSearchQuery) {
    handleSearch(true);
  } else {
    loadTopAnime(true);
  }
}

async function handleSearch(isLoadMore = false) {
  const query = document.getElementById('searchInput').value.trim();
  const status = document.getElementById('statusText');

  if (!query) { loadTopAnime(); return; }

  if (!isLoadMore) {
    currentOffset = 0;
    rawAnimeList = [];
    currentSearchQuery = query;
  }

  if (status) status.innerHTML = `🔍 Searching for "${query}"...`;

  try {
    const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}&offset=${currentOffset}`);
    const result = await res.json();
    if (result && result.data) {
      const newItems = result.data.map(item => item.node);
      rawAnimeList = rawAnimeList.concat(newItems);
      renderAnimeList(rawAnimeList);
      if (status) status.innerHTML = `Found <b>${rawAnimeList.length}</b> results for "${query}"`;
    }
  } catch (e) {
    if (status) status.innerHTML = 'Error searching anime.';
  }
}

function openWatchPage(animeId) {
  currentAnime = rawAnimeList.find(a => a.id === animeId);
  if (!currentAnime) return;

  currentEp = 1;
  currentServer = 1;

  document.getElementById('catalogPage').style.display = 'none';
  document.getElementById('watchPage').style.display = 'block';
  window.scrollTo(0,0);

  document.getElementById('detailTitle').innerText = currentAnime.title;
  document.getElementById('detailPoster').src = currentAnime.main_picture?.large || currentAnime.main_picture?.medium;
  document.getElementById('detailMeta').innerText = `⭐ ${currentAnime.mean || 'N/A'} • ${currentAnime.num_episodes || 12} Episodes • ${(currentAnime.media_type || 'TV').toUpperCase()}`;
  document.getElementById('detailSynopsis').innerText = currentAnime.synopsis || "Stream all episodes in high definition.";

  renderEpisodes(currentAnime.num_episodes || 12);
  updatePlayer();
}

function renderEpisodes(totalEps) {
  const grid = document.getElementById('episodeGrid');
  grid.innerHTML = '';
  const count = Math.min(totalEps > 0 ? totalEps : 12, 500);

  for (let i = 1; i <= count; i++) {
    const btn = document.createElement('button');
    btn.className = `ep-btn ${i === currentEp ? 'active' : ''}`;
    btn.innerText = `Ep ${i}`;
    btn.onclick = () => {
      currentEp = i;
      document.querySelectorAll('.ep-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      updatePlayer();
    };
    grid.appendChild(btn);
  }
}

function updatePlayer() {
  const iframe = document.getElementById('mainIframe');
  const externalBtn = document.getElementById('externalStreamBtn');
  const slug = slugify(currentAnime.title);
  let embedUrl = "";

  if (currentServer === 1) {
    embedUrl = `https://vidsrc.cc/v2/embed/anime/${slug}/${currentEp}`;
  } else if (currentServer === 2) {
    embedUrl = `https://2embed.org/embed/anime/${slug}/${currentEp}`;
  } else {
    embedUrl = `https://em.gogoanime.bid/streaming.php?id=${slug}-episode-${currentEp}`;
  }

  iframe.src = embedUrl;
  externalBtn.href = embedUrl;
}

function switchServer(srv) {
  currentServer = srv;
  document.querySelectorAll('.srv-btn').forEach((btn, idx) => {
    btn.classList.toggle('active', idx + 1 === srv);
  });
  updatePlayer();
}

function showCatalogPage() {
  document.getElementById('watchPage').style.display = 'none';
  document.getElementById('catalogPage').style.display = 'block';
  document.getElementById('mainIframe').src = '';
}

document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleSearch();
});

window.onload = () => loadTopAnime(false);
