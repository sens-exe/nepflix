const API_KEY = 'ce0d1040e3b7e67747909494432bf3f1';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/original';

let currentItem = null;

// ======= FETCH FUNCTIONS ======= //
async function fetchTrending(type) {
  try {
    const res = await fetch(`${BASE_URL}/trending/${type}/week?api_key=${API_KEY}`);
    const data = await res.json();
    return data.results || [];
  } catch (error) {
    console.error(`Error fetching trending ${type}:`, error);
    return [];
  }
}

async function fetchTrendingAnime() {
  const allResults = [];

  for (let page = 1; page <= 3; page++) {
    try {
      const res = await fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
      const data = await res.json();
      const filtered = (data.results || []).filter(
        item => item.original_language === 'ja' && item.genre_ids?.includes(16)
      );
      allResults.push(...filtered);
    } catch (error) {
      console.error('Error fetching anime:', error);
    }
  }

  return allResults;
}

// ======= DISPLAY FUNCTIONS ======= //
function displayBanner(item) {
  if (!item?.backdrop_path) return;

  const banner = document.getElementById('banner');
  const title = document.getElementById('banner-title');

  banner.style.backgroundImage = `url(${IMG_URL}${item.backdrop_path})`;
  title.textContent = item.title || item.name || 'Untitled';
}

function displayList(items, containerId) {
  const container = document.getElementById(containerId);
  container.innerHTML = '';

  items.forEach(item => {
    if (!item.poster_path) return;
    const img = document.createElement('img');
    img.src = `${IMG_URL}${item.poster_path}`;
    img.alt = item.title || item.name || 'Untitled';
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onclick = () => showDetails(item);
    container.appendChild(img);
  });
}

// ======= MODAL FUNCTIONS ======= //
function showDetails(item) {
  currentItem = item;

  const modal = document.getElementById('modal');
  document.getElementById('modal-title').textContent = item.title || item.name || 'Untitled';
  document.getElementById('modal-description').textContent = item.overview || 'No description available.';
  document.getElementById('modal-image').src = `${IMG_URL}${item.poster_path}`;
  document.getElementById('modal-rating').innerHTML = '★'.repeat(Math.round(item.vote_average / 2)) || 'N/A';

  changeServer();
  modal.style.display = 'flex';
}

function changeServer() {
  const server = document.getElementById('server').value;
  const type = currentItem.media_type === 'movie' ? 'movie' : 'tv';
  let embedURL = '';

  switch (server) {
    case 'vidsrc.cc':
      embedURL = `https://vidsrc.cc/v2/embed/${type}/${currentItem.id}`;
      break;
    case 'vidsrc.me':
      embedURL = `https://vidsrc.net/embed/${type}/?tmdb=${currentItem.id}`;
      break;
    case 'player.videasy.net':
      embedURL = `https://player.videasy.net/${type}/${currentItem.id}`;
      break;
  }

  document.getElementById('modal-video').src = embedURL;
}

function closeModal() {
  const modal = document.getElementById('modal');
  modal.style.display = 'none';
  document.getElementById('modal-video').src = '';
}

// ======= SEARCH FUNCTIONS ======= //
function openSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.style.display = 'flex';
  document.getElementById('search-input').focus();
}

function closeSearchModal() {
  const modal = document.getElementById('search-modal');
  modal.style.display = 'none';
  document.getElementById('search-results').innerHTML = '';
}

async function searchTMDB() {
  const query = document.getElementById('search-input').value.trim();
  const container = document.getElementById('search-results');

  if (!query) {
    container.innerHTML = '';
    return;
  }

  try {
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    container.innerHTML = '';

    (data.results || []).forEach(item => {
      if (!item.poster_path) return;
      const img = document.createElement('img');
      img.src = `${IMG_URL}${item.poster_path}`;
      img.alt = item.title || item.name;
      img.loading = 'lazy';
      img.onclick = () => {
        closeSearchModal();
        showDetails(item);
      };
      container.appendChild(img);
    });
  } catch (error) {
    console.error('Search error:', error);
  }
}

// ======= INITIALIZE ======= //
async function init() {
  try {
    const [movies, tvShows, anime] = await Promise.all([
      fetchTrending('movie'),
      fetchTrending('tv'),
      fetchTrendingAnime()
    ]);

    if (movies.length) displayBanner(movies[Math.floor(Math.random() * movies.length)]);
    displayList(movies, 'movies-list');
    displayList(tvShows, 'tvshows-list');
    displayList(anime, 'anime-list');
  } catch (error) {
    console.error('Initialization error:', error);
  }
}

init();
