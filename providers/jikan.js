const axios = require('axios');

const JIKAN_BASE = 'https://api.jikan.moe/v4';

const client = axios.create({
  baseURL: JIKAN_BASE,
  timeout: 8000,
  headers: { 'Accept': 'application/json' }
});

function normalizeAnime(item) {
  if (!item) return null;
  return {
    id: item.mal_id,
    title: item.title_english || item.title || 'Unknown Title',
    japaneseTitle: item.title_japanese || '',
    image: item.images?.jpg?.large_image_url || item.images?.jpg?.image_url || '',
    type: item.type || 'TV',
    episodes: item.episodes || 'N/A',
    status: item.status || 'Unknown',
    year: item.year || (item.aired?.prop?.from?.year) || 'N/A',
    score: item.score || 'N/A',
    synopsis: item.synopsis || 'No synopsis available.',
    genres: item.genres ? item.genres.map(g => g.name) : [],
    trailerUrl: item.trailer?.embed_url || null,
    provider: 'jikan'
  };
}

async function getTopAnime(page = 1) {
  const res = await client.get(`/top/anime?page=${page}`);
  const data = res.data?.data || [];
  const pagination = res.data?.pagination || {};
  return {
    items: data.map(normalizeAnime),
    hasNextPage: pagination.has_next_page || false,
    currentPage: page
  };
}

async function searchAnime(query, page = 1) {
  const encodedQuery = encodeURIComponent(query.trim());
  const res = await client.get(`/anime?q=${encodedQuery}&page=${page}&sfw=true`);
  const data = res.data?.data || [];
  const pagination = res.data?.pagination || {};
  return {
    items: data.map(normalizeAnime),
    hasNextPage: pagination.has_next_page || false,
    currentPage: page
  };
}

async function getAnimeById(id) {
  const res = await client.get(`/anime/${id}`);
  return normalizeAnime(res.data?.data);
}

async function getAnimeEpisodes(id, page = 1) {
  try {
    const res = await client.get(`/anime/${id}/episodes?page=${page}`);
    const data = res.data?.data || [];
    return data.map(ep => ({
      id: ep.mal_id,
      title: ep.title || `Episode ${ep.mal_id}`,
      aired: ep.aired ? new Date(ep.aired).toLocaleDateString() : 'N/A',
      filler: ep.filler || false,
      recap: ep.recap || false,
      url: ep.url || null
    }));
  } catch (err) {
    return [];
  }
}

async function getAnimeVideos(id) {
  try {
    const res = await client.get(`/anime/${id}/videos`);
    return res.data?.data || {};
  } catch (err) {
    return {};
  }
}

module.exports = {
  getTopAnime,
  searchAnime,
  getAnimeById,
  getAnimeEpisodes,
  getAnimeVideos
};
