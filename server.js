require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const MAL_API = 'https://api.myanimelist.net/v2';

app.use(express.static(path.join(__dirname, 'public')));

const mal = axios.create({
  baseURL: MAL_API,
  headers: {
    'X-MAL-CLIENT-ID': process.env.MAL_CLIENT_ID
  },
  timeout: 15000
});

// Anime catalog
app.get('/api/all-anime', async (req, res) => {
  try {
    const page = Number(req.query.page || 1);

    const response = await mal.get('/anime/ranking', {
      params: {
        ranking_type: 'all',
        limit: 25,
        offset: (page - 1) * 25,
        fields:
          'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios'
      }
    });

    res.json({
      data: response.data.data || [],
      paging: response.data.paging || {}
    });
  } catch (error) {
    console.error('MAL catalog error:', error.response?.data || error.message);
    res.status(500).json({ error: 'MAL catalog fetch failed' });
  }
});

// Search
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q;

    if (!q) {
      return res.json({ data: [] });
    }

    const response = await mal.get('/anime', {
      params: {
        q,
        limit: 25,
        fields:
          'id,title,main_picture,synopsis,mean,num_episodes,start_date,end_date,genres,studios'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('MAL search error:', error.response?.data || error.message);
    res.status(500).json({ error: 'MAL search failed' });
  }
});

// Anime details
app.get('/api/anime/:id', async (req, res) => {
  try {
    const response = await mal.get(`/anime/${req.params.id}`, {
      params: {
        fields:
          'id,title,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios,statistics'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('MAL details error:', error.response?.data || error.message);
    res.status(500).json({ error: 'MAL details fetch failed' });
  }
});

app.get('/api/anime/:id/trailer', async (req, res) => {
  try {
    // MAL API v2 does not provide a universal streaming endpoint.
    // Trailer URLs should come from an authorized video source.
    res.json({
      anime_id: req.params.id,
      trailer_available: false,
      message: 'Use an authorized trailer/video provider.'
    });
  } catch (error) {
    res.status(500).json({ error: 'Trailer lookup failed' });
  }
});

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    mal_configured: Boolean(process.env.MAL_CLIENT_ID)
  });
});

app.listen(PORT, () => {
  console.log(`Anime Fix server running on port ${PORT}`);
});
