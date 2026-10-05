const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

const MAL_CLIENT_ID = 'a027e08a4bd859644d6f09cf18b6ac9c';

app.use(express.static(path.join(__dirname, 'public')));

// Top Anime API (Offset Support for Load More)
app.get('/api/anime/top', async (req, res) => {
  const offset = req.query.offset || 0;
  try {
    const response = await fetch(`https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=50&offset=${offset}&fields=id,title,main_picture,mean,num_episodes,media_type,status`, {
      headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
    });

    if (!response.ok) throw new Error(`MAL API Error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to fetch anime data" });
  }
});

// Search API
app.get('/api/anime/search', async (req, res) => {
  const query = req.query.q;
  const offset = req.query.offset || 0;
  if (!query) return res.status(400).json({ error: "Query is required" });

  try {
    const response = await fetch(`https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(query)}&limit=50&offset=${offset}&fields=id,title,main_picture,mean,num_episodes,media_type,status`, {
      headers: { 'X-MAL-CLIENT-ID': MAL_CLIENT_ID }
    });

    if (!response.ok) throw new Error(`MAL Search Error: ${response.status}`);
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
