let rawAnimeList = [];
let currentOffset = 0;
let currentSearchQuery = "";
let currentSlug = "";
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
        <button class="watch-btn" onclick="openPlayer('${title.replace(/'/g, "\\'")}', ${item.num_episodes || 12})">
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

function openPlayer(title, totalEps) {
  currentSlug = slugify(title);
  currentEp = 1;
  currentServer = 1;

  document.getElementById('playerTitle').innerText = `Watching: ${title}`;
  
  const epSelector = document.getElementById('epSelector');
  epSelector.innerHTML = '';
  const epCount = totalEps > 0 ? Math.min(totalEps, 500) : 24;
  
  for (let i = 1; i <= epCount; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.innerText = `Episode ${i}`;
    epSelector.appendChild(opt);
  }

  updatePlayerEmbed();
  document.getElementById('playerModal').style.display = 'flex';
}

function updatePlayerEmbed() {
  const iframe = document.getElementById('mainIframe');
  let embedUrl = "";

  if (currentServer === 1) {
    embedUrl = `https://vidsrc.to/embed/anime/${currentSlug}/${currentEp}`;
  } else if (currentServer === 2) {
    embedUrl = `https://2embed.org/embed/anime/${currentSlug}/${currentEp}`;
  } else {
    embedUrl = `https://anime.consun.workers.dev/?title=${currentSlug}&ep=${currentEp}`;
  }

  iframe.src = embedUrl;
}

function switchServer(srvNum) {
  currentServer = srvNum;
  document.getElementById('srv1').classList.toggle('active', srvNum === 1);
  document.getElementById('srv2').classList.toggle('active', srvNum === 2);
  updatePlayerEmbed();
}

function changeEpisode(epNum) {
  currentEp = epNum;
  updatePlayerEmbed();
}

function closePlayer() {
  document.getElementById('playerModal').style.display = 'none';
  document.getElementById('mainIframe').src = '';
}

document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleSearch();
});

window.onload = () => loadTopAnime(false);
