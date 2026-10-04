const axios = require('axios');

async function getAnimeStreams(animeTitle, episodeNum = 1) {
  try {
    const cleanTitle = animeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const searchUrl = `https://consumet-api-clone.vercel.app/anime/gogoanime/${encodeURIComponent(animeTitle)}`;
    
    const searchRes = await axios.get(searchUrl, { timeout: 5000 });
    const results = searchRes.data.results;

    if (!results || results.length === 0) {
      return { 
        success: true, 
        fallback: true,
        message: 'Serving backup embed stream',
        embedUrl: `https://vidsrc.to/embed/anime/${cleanTitle}/${episodeNum}`
      };
    }

    const animeGogoId = results[0].id;
    const infoUrl = `https://consumet-api-clone.vercel.app/anime/gogoanime/info/${animeGogoId}`;
    const infoRes = await axios.get(infoUrl, { timeout: 5000 });
    const episodes = infoRes.data.episodes;

    if (!episodes || episodes.length === 0) {
      return { success: false, message: 'No episodes found' };
    }

    const targetEpisode = episodes.find(ep => ep.number == episodeNum) || episodes[0];
    const watchUrl = `https://consumet-api-clone.vercel.app/anime/gogoanime/watch/${targetEpisode.id}`;
    const streamRes = await axios.get(watchUrl, { timeout: 5000 });

    return {
      success: true,
      animeId: animeGogoId,
      totalEpisodes: episodes.length,
      currentEpisode: episodeNum,
      sources: streamRes.data.sources || [],
      download: streamRes.data.download || null
    };

  } catch (error) {
    const cleanTitle = animeTitle.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    return { 
      success: true, 
      fallback: true,
      message: 'Serving backup embed stream',
      embedUrl: `https://vidsrc.to/embed/anime/${cleanTitle}/${episodeNum}`
    };
  }
}

module.exports = { getAnimeStreams };
