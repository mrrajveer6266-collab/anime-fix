let rawAnimeList = [];
let currentSlug = "";
let currentEp = 1;
let currentServer = 1;

function slugify(text) {
  return text.toString().toLowerCase().trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-');
}

async function loadTopAnime() {
  const status = document.getElementById('statusText');
  if (status) status.innerHTML = '⏳ Fetching latest anime catalog...';

  try {
    const res = await fetch('/api/anime/top');
    const result = await res.json();
    
    if (result && result.data) {
      rawAnimeList = result.data.map(item => item.node);
      renderAnimeList(rawAnimeList);
      if (status) status.innerHTML = `Showing Top <b>${rawAnimeList.length}</b> Trending Anime`;
    } else {
      if (status) status.innerHTML = 'Failed to load anime. Please check API settings.';
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
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#aaa;">No anime found matching criteria.</div>';
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
}

async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) { loadTopAnime(); return; }

  const status = document.getElementById('statusText');
  if (status) status.innerHTML = `🔍 Searching for "${query}"...`;

  try {
    const res = await fetch(`/api/anime/search?q=${encodeURIComponent(query)}`);
    const result = await res.json();
    if (result && result.data) {
      rawAnimeList = result.data.map(item => item.node);
      renderAnimeList(rawAnimeList);
      if (status) status.innerHTML = `Found <b>${rawAnimeList.length}</b> results for "${query}"`;
    } else {
      if (status) status.innerHTML = 'No results found.';
    }
  } catch (e) {
    if (status) status.innerHTML = 'Error searching anime.';
  }
}

function applyFilters() {
  const type = document.getElementById('typeFilter').value;
  const rating = document.getElementById('ratingFilter').value;

  let filtered = rawAnimeList.filter(item => {
    if (type && (item.media_type || '').toLowerCase() !== type) return false;
    if (rating && (item.mean || 0) < Number(rating)) return false;
    return true;
  });

  renderAnimeList(filtered);
}

function resetFilters() {
  document.getElementById('typeFilter').value = '';
  document.getElementById('statusFilter').value = '';
  document.getElementById('ratingFilter').value = '';
  document.getElementById('searchInput').value = '';
  loadTopAnime();
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
    embedUrl = `https://em.gogoanime.bid/streaming.php?id=${currentSlug}-episode-${currentEp}`;
  } else {
    embedUrl = `https://vidsrc.to/embed/anime/${currentSlug}/${currentEp}`;
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

window.onload = loadTopAnime;
