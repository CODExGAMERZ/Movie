const movieNameRef = document.getElementById("movie-name");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("result");
const container = document.querySelector(".container");

let currentSearchQuery = "";
let currentPage = 1;

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
    currentSearchQuery = query;
    currentPage = page;

    // Show grid view, expand container
    container.classList.add("wide");
    showGridSkeleton();

    const url = `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&page=${page}&apikey=${key}`;

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
        })
        .catch(() => {
            result.innerHTML = `<h3 class="msg error-msg">An error occurred while fetching details. Please check your connection.</h3>`;
        });
};

const changePage = (direction) => {
    const nextPage = currentPage + direction;
    getMovies(currentSearchQuery, nextPage);
};

const fetchMovieDetails = (imdbID) => {
    // Narrow container back to 42rem for focused detail reading
    container.classList.remove("wide");
    showSkeleton();

    const url = `https://www.omdbapi.com/?i=${imdbID}&plot=full&apikey=${key}`;

    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            if (data.Response === "True") {
                const posterUrl = data.Poster !== "N/A" 
                    ? data.Poster 
                    : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%232e3b4e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a0a0a0" font-size="16" font-family="Outfit, sans-serif">No Poster Available</text></svg>`;

                result.innerHTML = `
                    <div class="back-btn-container fade-in">
                        <button class="back-btn" onclick="backToSearchResults()" aria-label="Back to results">
                            <span>&larr;</span> Back to Results
                        </button>
                    </div>
                    <div class="info fade-in">
                        <img src="${posterUrl}" class="poster" alt="${data.Title} Poster">
                        <div class="info-content">
                            <h2>${data.Title}</h2>
                            <div class="rating">
                                <img src="assets/star-icon.svg" alt="Rating Star">
                                <h4>${data.imdbRating} / 10</h4>
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

const handleSearch = () => {
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

// Load the default movie showcase on load
window.addEventListener("load", () => {
    let query = movieNameRef.value.trim();
    if (query.length <= 0) {
        query = "Inception";
        movieNameRef.value = "Inception";
    }
    getMovies(query, 1);
});
