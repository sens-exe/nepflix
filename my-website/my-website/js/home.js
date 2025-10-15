// =====================
// TMDB API CONFIG
// =====================
const API_KEY = 'ce0d1040e3b7e67747909494432bf3f1'; // Replace with your TMDB key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_PATH = 'https://image.tmdb.org/t/p/w500';

// =====================
// SEARCH BAR FUNCTIONS
// =====================
const searchBar = document.getElementById("search-bar");
const searchModal = document.getElementById("search-modal");
const searchInput = document.getElementById("search-input");
const searchResults = document.getElementById("search-results");

searchBar.addEventListener("focus", openSearchModal);

function openSearchModal() {
  searchModal.style.display = "block";
  searchInput.focus();
}

function closeSearchModal() {
  searchModal.style.display = "none";
  searchInput.value = "";
  searchResults.innerHTML = "";
}

// Fetch results from TMDB
async function searchTMDB() {
  const query = searchInput.value.trim();
  if (query.length < 2) {
    searchResults.innerHTML = "";
    return;
  }

  const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);
  const data = await res.json();

  searchResults.innerHTML = data.results
    .filter(item => item.poster_path)
    .map(item => `
      <div class="search-item" onclick="showModal('${item.title || item.name}', '${IMG_PATH + item.poster_path}', '${item.overview || 'No description available'}')">
        <img src="${IMG_PATH + item.poster_path}" alt="">
        <div>${item.title || item.name}</div>
      </div>
    `)
    .join("");
}

// =====================
// MODAL FUNCTIONS
// =====================
function showModal(title, image, description) {
  const modal = document.getElementById("modal");
  document.getElementById("modal-title").textContent = title;
  document.getElementById("modal-image").src = image;
  document.getElementById("modal-description").textContent = description;
  modal.style.display = "block";
  closeSearchModal();
}

function closeModal() {
  document.getElementById("modal").style.display = "none";
}

function changeServer() {
  const server = document.getElementById("server").value;
  const title = document.getElementById("modal-title").textContent;
  const iframe = document.getElementById("modal-video");
  iframe.src = `https://${server}/embed/${title}`;
}

// =====================
// CLOSE MODAL ON OUTSIDE CLICK
// =====================
window.onclick = function(event) {
  const modal = document.getElementById("modal");
  if (event.target === modal) {
    modal.style.display = "none";
  }
  if (event.target === searchModal) {
    searchModal.style.display = "none";
  }
};

