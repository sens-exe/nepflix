// ===== API SETTINGS =====
const API_KEY = "ce0d1040e3b7e67747909494432bf3f1"; // <-- Replace with your TMDB key
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";

const banner = document.getElementById("banner");
const bannerTitle = document.getElementById("banner-title");
const moviesList = document.getElementById("movies-list");
const tvList = document.getElementById("tvshows-list");
const animeList = document.getElementById("anime-list");

const modal = document.getElementById("modal");
const modalImage = document.getElementById("modal-image");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-description");
const modalVideo = document.getElementById("modal-video");
const modalRating = document.getElementById("modal-rating");

const searchModal = document.getElementById("search-modal");
const searchResults = document.getElementById("search-results");
const searchInput = document.getElementById("search-input");

// ===== FETCH TRENDING CONTENT =====
async function fetchTrending(category, container) {
  const res = await fetch(`${BASE_URL}/trending/${category}/week?api_key=${API_KEY}`);
  const data = await res.json();

  container.innerHTML = data.results
    .slice(0, 12)
    .map(
      (item) => `
      <img 
        src="${IMG_URL + item.poster_path}" 
        alt="${item.title || item.name}" 
        onclick="openModal('${item.id}', '${category}')"
      />`
    )
    .join("");

  if (category === "movie" && banner) {
    const randomMovie = data.results[Math.floor(Math.random() * data.results.length)];
    banner.style.backgroundImage = `url(${IMG_URL + randomMovie.backdrop_path})`;
    bannerTitle.textContent = randomMovie.title;
  }
}

// ===== MODAL FUNCTIONS =====
async function openModal(id, category) {
  modal.style.display = "flex";

  const res = await fetch(`${BASE_URL}/${category}/${id}?api_key=${API_KEY}`);
  const item = await res.json();

  modalImage.src = IMG_URL + item.poster_path;
  modalTitle.textContent = item.title || item.name;
  modalDesc.textContent = item.overview || "No description available.";

  const ratingStars = Math.round(item.vote_average / 2);
  modalRating.innerHTML = "★".repeat(ratingStars) + "☆".repeat(5 - ratingStars);

  changeServer(id, category);
}

function closeModal() {
  modal.style.display = "none";
  modalVideo.src = "";
}

// ===== CHANGE SERVER =====
function changeServer(id, category = "movie") {
  const server = document.getElementById("server").value;
  const videoSrc = `https://${server}/embed/${category}?tmdb=${id}`;
  modalVideo.src = videoSrc;
}

// ===== SEARCH =====
async function searchTMDB() {
  const query = searchInput.value.trim();
  if (query.length < 2) return;

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  searchResults.innerHTML = data.results
    .filter(item => item.poster_path)
    .slice(0, 15)
    .map(
      (item) => `
      <img 
        src="${IMG_URL + item.poster_path}" 
        alt="${item.title || item.name}" 
        onclick="openModal('${item.id}', '${item.media_type}')"
      />`
    )
    .join("");
}

function openSearchModal() {
  searchModal.style.display = "block";
  searchInput.focus();
}

function closeSearchModal() {
  searchModal.style.display = "none";
  searchInput.value = "";
  searchResults.innerHTML = "";
}

// ===== INIT =====
fetchTrending("movie", moviesList);
fetchTrending("tv", tvList);
fetchTrending("movie", animeList); // Placeholder for anime — TMDB doesn’t have “anime” category
