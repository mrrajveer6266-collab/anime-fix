const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// आपकी MyAnimeList Client ID
const MAL_CLIENT_ID = 'a027e08a4bd859644d6f09cf18b6ac9c';

app.use(express.static(path.join(__dirname, 'public')));

// Trending / Top Anime Endpoint
app.get('/api/anime/top', async (req, res) => {
  try {
    const response = await fetch('https://api.myanimelist.net/v2/anime/ranking?ranking_type=all&limit=24&fields=id,title,main_picture,mean,num_episodes,media_type,status', {
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID
      }
    });

    if (!response.ok) {
      throw new Error(`MAL API Error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ error: "Failed to fetch anime data from MyAnimeList" });
  }
});

// Anime Search Endpoint
app.get('/api/anime/search', async (req, res) => {
  const query = req.query.q;
  if (!query) return res.status(400).json({ error: "Query parameter 'q' is required" });

  try {
    const response = await fetch(`https://api.myanimelist.net/v2/anime?q=${encodeURIComponent(query)}&limit=24&fields=id,title,main_picture,mean,num_episodes,media_type,status`, {
      headers: {
        'X-MAL-CLIENT-ID': MAL_CLIENT_ID
      }
    });

    if (!response.ok) {
      throw new Error(`MAL Search API Error: ${response.status}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Search Error:", error);
    res.status(500).json({ error: "Search failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
