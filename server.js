const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const JIKAN = 'https://api.jikan.moe/v4';

async function jikan(path) {
  const response = await fetch(JIKAN + path);

  if (!response.ok) {
    const error = new Error('Jikan error ' + response.status);
    error.status = response.status;
    throw error;
  }

  return response.json();
}

function sendApiError(res, error) {
  console.error(error);

  if (error.status === 429) {
    return res.status(429).json({
      error: 'Too many requests. Please wait a few seconds and try again.'
    });
  }

  res.status(503).json({
    error: 'Anime service is temporarily unavailable. Please try again.'
  });
}

// Popular / top anime
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
    sendApiError(res, error);
  }
});

// All anime database
app.get('/api/all-anime', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await jikan(`/anime?page=${page}&limit=25&sfw=true`);
    res.json(data);
  } catch (error) {
    sendApiError(res, error);
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = String(req.query.q || '').trim();
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!q) {
      return res.status(400).json({
        error: 'Search text is required'
      });
    }

    const data = await jikan(
      '/anime?q=' + encodeURIComponent(q) +
      '&page=' + page +
      '&limit=25' +
      '&sfw=true'
    );

    res.json({
      page,
      hasNextPage: Boolean(data.pagination?.has_next_page),
      anime: data.data || []
    });
  } catch (error) {
    sendApiError(res, error);
  }
});

// Filter / discover anime
app.get('/api/discover', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const params = new URLSearchParams();

    params.set('page', page);
    params.set('limit', '25');
    params.set('sfw', 'true');

    const allowed = [
      'type',
      'status',
      'rating',
      'genres',
      'start_date',
      'end_date',
      'order_by',
      'sort'
    ];

    for (const key of allowed) {
      if (req.query[key]) {
        params.set(key, String(req.query[key]));
      }
    }

    const data = await jikan('/anime?' + params.toString());

    res.json({
      page,
      hasNextPage: Boolean(data.pagination?.has_next_page),
      anime: data.data || []
    });
  } catch (error) {
    sendApiError(res, error);
  }
});

// Full anime information
app.get('/api/anime/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid anime ID'
      });
    }

    const data = await jikan('/anime/' + id + '/full');
    res.json(data.data);
  } catch (error) {
    sendApiError(res, error);
  }
});

// Episodes metadata
app.get('/api/anime/:id/episodes', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid anime ID'
      });
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
    sendApiError(res, error);
  }
});

// Official / promotional videos
app.get('/api/anime/:id/videos', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'Invalid anime ID'
      });
    }

    const data = await jikan('/anime/' + id + '/videos');

    res.json({
      promo: data.data?.promo || [],
      episodes: data.data?.episodes || []
    });
  } catch (error) {
    sendApiError(res, error);
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
