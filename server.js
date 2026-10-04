require('dotenv').config();

const express = require('express');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

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
          'id,title,media_type,main_picture,alternative_titles,start_date,end_date,synopsis,mean,rank,popularity,num_list_users,num_scoring_users,nsfw,genres,my_list_status,num_episodes,start_season,broadcast,source,average_episode_duration,rating,studios'
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

// ==========================================
// Hindi Anime Stream / m3u8 Extraction API
// ==========================================
app.get('/api/get-m3u8', async (req, res) => {
    const pageUrl = req.query.url;
    if (!pageUrl) {
        return res.status(400).json({ success: false, message: "URL parameter is required" });
    }

    try {
        // 1. Episode Page fetch करके iframe src खोजना
        const { data: pageHtml } = await axios.get(pageUrl, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' 
            }
        });
        const $ = cheerio.load(pageHtml);
        const iframeSrc = $('iframe').attr('src');

        if (!iframeSrc) {
            return res.status(404).json({ success: false, message: "No video iframe found on this page" });
        }

        // 2. iframe page के अंदर से direct .m3u8 स्ट्रीम URL खोजना
        const { data: iframeHtml } = await axios.get(iframeSrc, {
            headers: { 
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Referer': pageUrl 
            }
        });

        // RegEx से .m3u8 वीडियो फाइल खोजना
        const m3u8Match = iframeHtml.match(/(https?:\/\/[^\s"'<>]+\.m3u8[^\s"'<>]*)/);

        if (m3u8Match) {
            return res.json({ success: true, stream_url: m3u8Match[0], isDirect: true });
        } else {
            // Fallback: अगर direct .m3u8 न मिले तो safe iframe URL लौटाएं
            return res.json({ success: true, stream_url: iframeSrc, isDirect: false });
        }
    } catch (err) {
        return res.status(500).json({ success: false, error: err.message });
    }
});

app.listen(PORT, () => {
   console.log(`Anime Fix server running on port ${PORT}`);
});

// New Modular Streaming Route (Preserving Existing MAL Catalog)
const { getAnimeStreams } = require('./providers/gogoProvider');
app.get('/api/stream/:title/:episode?', async (req, res) => {
  const { title, episode } = req.params;
  const epNum = episode ? parseInt(episode) : 1;
  
  const result = await getAnimeStreams(title, epNum);
  res.json(result);
});
