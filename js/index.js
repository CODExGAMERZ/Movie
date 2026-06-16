// Safety check for API key configuration
let api_key = "";
let has_key = false;
if (typeof key !== "undefined") {
    api_key = key;
    has_key = true;
}

const movieNameRef = document.getElementById("movie-name");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("result");
const container = document.querySelector(".container");

// Watchlist DOM Elements
const watchlistToggle = document.getElementById("watchlist-toggle");
const watchlistDrawer = document.getElementById("watchlist-drawer");
const closeDrawer = document.getElementById("close-drawer");
const drawerOverlay = document.getElementById("drawer-overlay");
const watchlistItemsList = document.getElementById("watchlist-items-list");
const watchlistCountEl = document.getElementById("watchlist-count");
const themeToggle = document.getElementById("theme-toggle");

let currentSearchQuery = "";
let currentPage = 1;

// --- Watchlist State Management ---
let watchlist = JSON.parse(localStorage.getItem("cinefinder_watchlist")) || [];

const saveWatchlist = () => {
    localStorage.setItem("cinefinder_watchlist", JSON.stringify(watchlist));
    updateWatchlistUI();
};

const updateWatchlistUI = () => {
    watchlistCountEl.textContent = watchlist.length;
    
    if (watchlist.length === 0) {
        watchlistItemsList.innerHTML = `
            <div class="empty-watchlist-msg">
                <p>Your watchlist is empty.</p>
                <p style="font-size: 0.78rem; margin-top: 4px;">Click the bookmark icon on any movie details page to save it here.</p>
            </div>
        `;
        return;
    }
    
    watchlistItemsList.innerHTML = watchlist.map(item => `
        <div class="watchlist-item" onclick="fetchMovieDetails('${item.id}')">
            <img src="${item.poster}" alt="${item.title}">
            <div class="watchlist-item-info">
                <div class="watchlist-item-title">${item.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted);">${item.year}</div>
            </div>
            <button class="watchlist-item-delete" onclick="event.stopPropagation(); removeWatchlistItem('${item.id}')" aria-label="Remove ${item.title}">
                <i class="ri-delete-bin-line"></i>
            </button>
        </div>
    `).join("");
};

const toggleWatchlist = (id, title, poster, year) => {
    const idx = watchlist.findIndex(item => item.id === id);
    if (idx > -1) {
        watchlist.splice(idx, 1);
    } else {
        watchlist.push({ id, title, poster, year });
    }
    saveWatchlist();
    
    // Toggle state of current button if visible
    const detailBtn = document.querySelector(".btn-watchlist-add");
    if (detailBtn) {
        const isIn = watchlist.some(item => item.id === id);
        detailBtn.className = `btn-watchlist-add ${isIn ? 'added' : ''}`;
        detailBtn.innerHTML = isIn 
            ? `<i class="ri-bookmark-3-fill"></i> Watchlisted` 
            : `<i class="ri-bookmark-3-line"></i> Add to Watchlist`;
    }
};

const removeWatchlistItem = (id) => {
    watchlist = watchlist.filter(item => item.id !== id);
    saveWatchlist();
    
    // Update button in detail view if it's currently showing this movie
    const detailBtn = document.querySelector(".btn-watchlist-add");
    if (detailBtn) {
        const isIn = watchlist.some(item => item.id === id);
        detailBtn.className = `btn-watchlist-add ${isIn ? 'added' : ''}`;
        detailBtn.innerHTML = isIn 
            ? `<i class="ri-bookmark-3-fill"></i> Watchlisted` 
            : `<i class="ri-bookmark-3-line"></i> Add to Watchlist`;
    }
};

// --- Drawer Event Listeners ---
const openDrawer = () => {
    watchlistDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
    updateWatchlistUI();
};

const hideDrawer = () => {
    watchlistDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
};

watchlistToggle.addEventListener("click", openDrawer);
closeDrawer.addEventListener("click", hideDrawer);
drawerOverlay.addEventListener("click", hideDrawer);

// --- Theme Switcher ---
if (localStorage.getItem("theme") === "light") {
    document.body.classList.add("light");
    themeToggle.querySelector("i").className = "ri-sun-line";
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("light");
    const isLight = document.body.classList.contains("light");
    themeToggle.querySelector("i").className = isLight ? "ri-sun-line" : "ri-moon-line";
    localStorage.setItem("theme", isLight ? "light" : "dark");
});


// Show API key warning if missing
const showKeyWarning = () => {
    container.classList.remove("wide");
    result.innerHTML = `
        <div class="msg error-msg fade-in" style="padding: 2.5rem; text-align: center; border: 2px dashed rgba(255, 87, 34, 0.4); border-radius: 12px; margin-top: 1.5rem; background: rgba(255, 87, 34, 0.05);">
            <h3 style="color: #ff5722; margin-bottom: 1rem; font-size: 1.4rem;">⚠️ OMDB API Key Not Found</h3>
            <p style="margin-bottom: 1.5rem; color: var(--text-muted); font-size: 1rem; line-height: 1.5;">
                This app requires a free OMDB API key to retrieve movie details.
            </p>
            <div style="display: inline-block; text-align: left; color: var(--text-main); line-height: 1.8; font-size: 0.95rem; max-width: 400px; margin: 0 auto;">
                1. Create a file at <code style="background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; font-family: monospace;">js/key.js</code><br>
                2. Inside the file, add:<br>
                <code style="background: rgba(255,255,255,0.1); padding: 4px 8px; border-radius: 4px; font-family: monospace; display: block; margin: 0.5rem 0; color: var(--accent-color);">const key = "your_omdb_key_here";</code>
                3. Obtain a free key from <a href="http://www.omdbapi.com/apikey.aspx" target="_blank" style="color: var(--accent-color); text-decoration: underline; font-weight: 500;">omdbapi.com</a>
            </div>
        </div>
    `;
    if (searchBtn) searchBtn.disabled = true;
    if (movieNameRef) movieNameRef.disabled = true;
};

const showSkeleton = () => {
    result.innerHTML = `
        <div class="info skeleton-container">
            <div class="skeleton skeleton-poster"></div>
            <div class="info-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-rating"></div>
                <div class="skeleton skeleton-details"></div>
                <div class="skeleton skeleton-genre"></div>
            </div>
        </div>
        <div class="extra-details">
            <div class="skeleton skeleton-text"></div>
            <div class="skeleton skeleton-text" style="width: 80%;"></div>
            <div class="skeleton skeleton-text" style="width: 60%;"></div>
        </div>
    `;
};

const showGridSkeleton = () => {
    let cards = "";
    for (let i = 0; i < 8; i++) {
        cards += `
            <div class="movie-card skeleton-container">
                <div class="poster-container skeleton"></div>
                <div class="movie-card-info">
                    <div class="skeleton" style="height: 1.2rem; width: 85%; margin-bottom: 0.5rem;"></div>
                    <div class="skeleton" style="height: 1rem; width: 40%; margin-top: auto;"></div>
                </div>
            </div>
        `;
    }
    result.innerHTML = `<div class="movies-grid">${cards}</div>`;
};

const getMovies = (query, page) => {
    if (!has_key) {
        showKeyWarning();
        return;
    }
    currentSearchQuery = query;
    currentPage = page;

    // Show grid view, expand container
    container.classList.add("wide");
    showGridSkeleton();

    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${api_key}`;

    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            if (data.Response === "True") {
                let gridHtml = `<div class="movies-grid fade-in">`;
                data.Search.forEach(movie => {
                    const posterUrl = movie.Poster !== "N/A" 
                        ? movie.Poster 
                        : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%232e3b4e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a0a0a0" font-size="14" font-family="Outfit, sans-serif">No Poster Available</text></svg>`;
                    
                    gridHtml += `
                        <div class="movie-card" onclick="fetchMovieDetails('${movie.imdbID}')" role="button" tabindex="0" aria-label="View details of ${movie.Title}">
                            <div class="poster-container">
                                <img src="${posterUrl}" alt="${movie.Title} Poster" loading="lazy">
                            </div>
                            <div class="movie-card-info">
                                <h3 class="movie-card-title">${movie.Title}</h3>
                                <div class="movie-card-meta">
                                    <span>${movie.Year}</span>
                                    <span class="movie-card-type">${movie.Type}</span>
                                </div>
                            </div>
                        </div>
                    `;
                });
                gridHtml += `</div>`;

                const totalResults = parseInt(data.totalResults);
                const totalPages = Math.ceil(totalResults / 10);
                
                let paginationHtml = "";
                if (totalPages > 1) {
                    paginationHtml = `
                        <div class="pagination fade-in">
                            <button id="prev-btn" ${page <= 1 ? "disabled" : ""} onclick="changePage(-1)">Prev</button>
                            <span>Page ${page} of ${totalPages}</span>
                            <button id="next-btn" ${page >= totalPages ? "disabled" : ""} onclick="changePage(1)">Next</button>
                        </div>
                    `;
                }

                result.innerHTML = gridHtml + paginationHtml;
            } else {
                result.innerHTML = `<h3 class="msg error-msg">${data.Error}</h3>`;
            }
        }
        )
        .catch(() => {
            result.innerHTML = `<h3 class="msg error-msg">An error occurred while fetching details. Please check your connection.</h3>`;
        });
};

const changePage = (direction) => {
    const nextPage = currentPage + direction;
    getMovies(currentSearchQuery, nextPage);
};

const fetchMovieDetails = (imdbID) => {
    if (!has_key) {
        showKeyWarning();
        return;
    }
    // Narrow container back to 42rem for focused detail reading
    container.classList.remove("wide");
    showSkeleton();
    hideDrawer();

    const url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${api_key}`;

    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            if (data.Response === "True") {
                const posterUrl = data.Poster !== "N/A" 
                    ? data.Poster 
                    : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%232e3b4e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a0a0a0" font-size="16" font-family="Outfit, sans-serif">No Poster Available</text></svg>`;

                // Compute Star Rating HTML
                const ratingVal = parseFloat(data.imdbRating) || 0;
                const starsCount = Math.round(ratingVal) / 2; // Star rating out of 5 stars
                let starsHtml = "";
                for (let i = 1; i <= 5; i++) {
                    if (starsCount >= i) {
                        starsHtml += `<i class="ri-star-fill"></i>`;
                    } else if (starsCount >= i - 0.5) {
                        starsHtml += `<i class="ri-star-half-fill"></i>`;
                    } else {
                        starsHtml += `<i class="ri-star-line"></i>`;
                    }
                }

                const isIn = watchlist.some(item => item.id === data.imdbID);

                // Escape single quotes for HTML attribute strings
                const escapedTitle = data.Title.replace(/'/g, "\\'");

                result.innerHTML = `
                    <div class="back-btn-container fade-in">
                        <button class="back-btn" onclick="backToSearchResults()" aria-label="Back to results">
                            <i class="ri-arrow-left-line"></i> Back to Results
                        </button>
                    </div>
                    <div class="info fade-in">
                        <img src="${posterUrl}" class="poster" alt="${data.Title} Poster">
                        <div class="info-content">
                            <h2>${data.Title}</h2>
                            <div class="detail-actions">
                                <div class="rating">
                                    <div class="rating-stars">${starsHtml}</div>
                                    <h4>${data.imdbRating} / 10</h4>
                                </div>
                                <button class="btn-watchlist-add ${isIn ? 'added' : ''}" 
                                    onclick="toggleWatchlist('${data.imdbID}', '${escapedTitle}', '${posterUrl}', '${data.Year}')">
                                    <i class="${isIn ? 'ri-bookmark-3-fill' : 'ri-bookmark-3-line'}"></i> 
                                    <span>${isIn ? 'Watchlisted' : 'Add to Watchlist'}</span>
                                </button>
                            </div>
                            <div class="details">
                                <span>${data.Rated}</span>
                                <span>${data.Year}</span>
                                <span>${data.Runtime}</span>
                            </div>
                            <div class="genre">
                                ${data.Genre.split(",").map(g => `<div>${g.trim()}</div>`).join("")}
                            </div>
                        </div>
                    </div>
                    <div class="extra-details fade-in">
                        <div class="detail-section">
                            <h3>Plot</h3>
                            <p>${data.Plot}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Director & Writer</h3>
                            <p><strong>Director:</strong> ${data.Director}<br><strong>Writer:</strong> ${data.Writer}</p>
                        </div>
                        <div class="detail-section">
                            <h3>Cast</h3>
                            <p>${data.Actors}</p>
                        </div>
                        <div class="metadata-grid">
                            <div class="meta-item">
                                <h4>Box Office</h4>
                                <p>${data.BoxOffice && data.BoxOffice !== "N/A" ? data.BoxOffice : "N/A"}</p>
                            </div>
                            <div class="meta-item">
                                <h4>Awards</h4>
                                <p>${data.Awards && data.Awards !== "N/A" ? data.Awards : "None"}</p>
                            </div>
                            <div class="meta-item">
                                <h4>Language</h4>
                                <p>${data.Language}</p>
                            </div>
                        </div>
                    </div>
                `;
            } else {
                result.innerHTML = `<h3 class="msg error-msg">${data.Error}</h3>`;
            }
        })
        .catch(() => {
            result.innerHTML = `<h3 class="msg error-msg">An error occurred while fetching details. Please check your connection.</h3>`;
        });
};

const backToSearchResults = () => {
    getMovies(currentSearchQuery, currentPage);
};

// Bind to window for HTML inline event handlers
window.fetchMovieDetails = fetchMovieDetails;
window.changePage = changePage;
window.backToSearchResults = backToSearchResults;
window.toggleWatchlist = toggleWatchlist;
window.removeWatchlistItem = removeWatchlistItem;

const handleSearch = () => {
    if (!has_key) {
        showKeyWarning();
        return;
    }
    let query = movieNameRef.value.trim();
    if (query.length <= 0) {
        query = "Inception";
        movieNameRef.value = "Inception";
    }
    getMovies(query, 1);
};

searchBtn.addEventListener("click", handleSearch);
movieNameRef.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        handleSearch();
    }
});

// Load the default movie showcase and initialize watchlist on load
window.addEventListener("load", () => {
    updateWatchlistUI();
    if (!has_key) {
        showKeyWarning();
        return;
    }
    let query = movieNameRef.value.trim();
    if (query.length <= 0) {
        query = "Inception";
        movieNameRef.value = "Inception";
    }
    getMovies(query, 1);
});
