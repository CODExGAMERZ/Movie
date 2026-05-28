const movieNameRef = document.getElementById("movie-name");
const searchBtn = document.getElementById("search-btn");
const result = document.getElementById("result");

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

const getMovie = () => {
    let movieName = movieNameRef.value.trim();
    
    // If empty on action, search for Inception as the default popular showcase
    if (movieName.length <= 0) {
        movieName = "Inception";
        movieNameRef.value = "Inception";
    }

    // Show loading state
    showSkeleton();

    const url = `https://www.omdbapi.com/?t=${encodeURIComponent(movieName)}&apikey=${key}`;

    fetch(url)
        .then((resp) => resp.json())
        .then((data) => {
            if (data.Response === "True") {
                const posterUrl = data.Poster !== "N/A" 
                    ? data.Poster 
                    : `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450" viewBox="0 0 300 450"><rect width="100%" height="100%" fill="%232e3b4e"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%23a0a0a0" font-size="16" font-family="Poppins, sans-serif">No Poster Available</text></svg>`;

                result.innerHTML = `
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

searchBtn.addEventListener("click", getMovie);
movieNameRef.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        getMovie();
    }
});

// Load the default movie showcase on load
window.addEventListener("load", getMovie);
