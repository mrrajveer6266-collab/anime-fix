const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JIKAN = 'https://api.jikan.moe/v4';

async function jikan(path) {
  const response = await fetch(JIKAN + path);

  if (!response.ok) {
    throw new Error('Jikan error ' + response.status);
  }

  return response.json();
}

// Home / anime catalog
app.get('/api/anime', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await jikan('/top/anime?page=' + page);

    res.json({
      page,
      hasNextPage: Boolean(data.pagination?.has_next_page),
      anime: data.data || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Anime catalog temporarily unavailable'
    });
  }
});

// Anime search
app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!q) {
      return res.status(400).json({ error: 'Search text is required' });
    }

    const data = await jikan(
      '/anime?q=' + encodeURIComponent(q) +
      '&page=' + page +
      '&sfw=true'
    );

    res.json({
      page,
      hasNextPage: Boolean(data.pagination?.has_next_page),
      anime: data.data || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Search temporarily unavailable'
    });
  }
});

// Full anime information
app.get('/api/anime/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid anime ID' });
    }

    const data = await jikan('/anime/' + id + '/full');

    res.json(data.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Anime details temporarily unavailable'
    });
  }
});

// Episodes metadata
app.get('/api/anime/:id/episodes', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid anime ID' });
    }

    const data = await jikan(
      '/anime/' + id + '/episodes?page=' + page
    );

    res.json({
      page,
      hasNextPage: Boolean(data.pagination?.has_next_page),
      episodes: data.data || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Episode information temporarily unavailable'
    });
  }
});

// Official/promotional video information when available
app.get('/api/anime/:id/videos', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'Invalid anime ID' });
    }

    const data = await jikan('/anime/' + id + '/videos');

    res.json({
      promo: data.data?.promo || [],
      episodes: data.data?.episodes || []
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Video information temporarily unavailable'
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Anime Fix'
  });
});

// Website
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log('Anime Fix running on port ' + PORT);
});
