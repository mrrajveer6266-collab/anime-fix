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

// 1. Fetch Anime from Jikan API
async function loadTopAnime() {
  const grid = document.getElementById('animeGrid');
  const status = document.getElementById('statusText');
  status.innerHTML = '⏳ Fetching latest anime catalog...';

  try {
    const res = await fetch('https://api.jikan.moe/v4/top/anime?limit=24');
    const data = await res.json();
    
    if (data && data.data) {
      rawAnimeList = data.data;
      renderAnimeList(rawAnimeList);
      status.innerHTML = `Showing Top <b>${rawAnimeList.length}</b> Trending Anime`;
    } else {
      status.innerHTML = 'Failed to load anime. Please refresh.';
    }
  } catch (err) {
    console.error(err);
    status.innerHTML = '⚠️ Network error loading anime.';
  }
}

// 2. Render Cards
function renderAnimeList(list) {
  const grid = document.getElementById('animeGrid');
  grid.innerHTML = '';

  if (list.length === 0) {
    grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#aaa;">No anime found matching criteria.</div>';
    return;
  }

  list.forEach(item => {
    const title = item.title_english || item.title;
    const score = item.score ? item.score : 'N/A';
    const eps = item.episodes ? `${item.episodes} Ep` : 'Airing';
    const img = item.images?.jpg?.large_image_url || item.images?.jpg?.image_url;

    const card = document.createElement('div');
    card.className = 'anime-card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${img}" alt="${title}" loading="lazy">
        <div class="card-score">⭐ ${score}</div>
      </div>
      <div class="card-info">
        <div class="card-title">${title}</div>
        <div class="card-meta">📺 ${eps} • ${item.type || 'TV'}</div>
        <button class="watch-btn" onclick="openPlayer('${title.replace(/'/g, "\\'")}', ${item.episodes || 12})">
          ▶ Watch Now
        </button>
      </div>
    `;
    grid.appendChild(card);
  });
}

// 3. Search Anime
async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  if (!query) { loadTopAnime(); return; }

  const status = document.getElementById('statusText');
  status.innerHTML = `🔍 Searching for "${query}"...`;

  try {
    const res = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=24`);
    const data = await res.json();
    if (data && data.data) {
      rawAnimeList = data.data;
      renderAnimeList(rawAnimeList);
      status.innerHTML = `Found <b>${rawAnimeList.length}</b> results for "${query}"`;
    }
  } catch (e) {
    status.innerHTML = 'Error searching anime.';
  }
}

// 4. Filters
function applyFilters() {
  const type = document.getElementById('typeFilter').value;
  const statusFilter = document.getElementById('statusFilter').value;
  const rating = document.getElementById('ratingFilter').value;

  let filtered = rawAnimeList.filter(item => {
    if (type && (item.type || '').toLowerCase() !== type) return false;
    if (statusFilter && (item.status || '').toLowerCase().indexOf(statusFilter) === -1) return false;
    if (rating && (item.score || 0) < Number(rating)) return false;
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

// 5. Stream Player System
function openPlayer(title, totalEps) {
  currentSlug = slugify(title);
  currentEp = 1;
  currentServer = 1;

  document.getElementById('playerTitle').innerText = `Watching: ${title}`;
  
  // Populate Episode Dropdown
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

// Enter Key Search Bind
document.getElementById('searchInput')?.addEventListener('keypress', function(e) {
  if (e.key === 'Enter') handleSearch();
});

// Initial Load
window.onload = loadTopAnime;
