const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.static('public'));

const cache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 mins cache

async function fetchFromJikan(url) {
  if (cache[url] && (Date.now() - cache[url].timestamp < CACHE_DURATION)) {
    return cache[url].data;
  }
  await new Promise(resolve => setTimeout(resolve, 400));
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Jikan API Error: ${response.status}`);
  const data = await response.json();
  cache[url] = { data: data, timestamp: Date.now() };
  return data;
}

// Popular Anime
app.get('/api/anime', async (req, res) => {
  try {
    const data = await fetchFromJikan('https://api.jikan.moe/v4/top/anime?limit=15');
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch popular anime' });
  }
});

// Catalog with Pagination
app.get('/api/all-anime', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const data = await fetchFromJikan(`https://api.jikan.moe/v4/anime?page=${page}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Search Route
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q || '';
    const data = await fetchFromJikan(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Details Route
app.get('/api/anime/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await fetchFromJikan(`https://api.jikan.moe/v4/anime/${id}/full`);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch anime details' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', branding: 'Anime Salt' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Anime Salt Server running on port ${PORT}`));
