const axios = require('axios');

async function getAnimeStreams(animeTitle, episodeNum = 1) {
  try {
    const searchRes = await axios.get(`https://api.consumet.org/anime/gogoanime/${encodeURIComponent(animeTitle)}`);
    const results = searchRes.data.results;

    if (!results || results.length === 0) {
      return { success: false, message: 'Video currently unavailable' };
    }

    const animeGogoId = results[0].id;
    const infoRes = await axios.get(`https://api.consumet.org/anime/gogoanime/info/${animeGogoId}`);
    const episodes = infoRes.data.episodes;

    if (!episodes || episodes.length === 0) {
      return { success: false, message: 'No episodes found' };
    }

    const targetEpisode = episodes.find(ep => ep.number == episodeNum) || episodes[0];
    const streamRes = await axios.get(`https://api.consumet.org/anime/gogoanime/watch/${targetEpisode.id}`);
    
    return {
      success: true,
      animeId: animeGogoId,
      totalEpisodes: episodes.length,
      currentEpisode: episodeNum,
      headers: streamRes.data.headers || {},
      sources: streamRes.data.sources || [],
      download: streamRes.data.download || null
    };

  } catch (error) {
    return { success: false, message: 'Video currently unavailable' };
  }
}

module.exports = { getAnimeStreams };
