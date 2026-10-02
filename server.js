const express = require('express');
const axios = require('axios');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));

// Top Popular Anime
app.get('/api/anime', async (req, res) => {
  try {
    const response = await axios.get('https://api.jikan.moe/v4/top/anime?limit=25');
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch top anime' });
  }
});

// Catalog / Infinite Load Anime (Paginated)
app.get('/api/all-anime', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const response = await axios.get(`https://api.jikan.moe/v4/anime?page=${page}&limit=25`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch catalog' });
  }
});

// Search Anime
app.get('/api/search', async (req, res) => {
  try {
    const query = req.query.q;
    const response = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search anime' });
  }
});

// Anime Details
app.get('/api/anime/:id', async (req, res) => {
  try {
    const response = await axios.get(`https://api.jikan.moe/v4/anime/${req.params.id}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
// Consumet API se episode streaming link aur episode list laane ka route
app.get('/api/watch/:id', async (req, res) => {
  try {
    const animeId = req.params.id;
    // Gogoanime provider se episode links fetch karna
    const response = await axios.get(`https://api.consumet.org/anime/gogoanime/info/${animeId}`);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Video stream fetch nahi ho paya' });
  }
});
