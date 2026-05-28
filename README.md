# CineFinder - Discover Movies & Details

CineFinder is a lightweight, responsive, and visually stunning movie search web application. It integrates with the OMDb API to fetch and display comprehensive movie data including ratings, plot summaries, director/writer details, actors, language options, box office performance, and prestigious awards.

The user interface features a modern dark-themed glassmorphic design that leverages dynamic layouts, micro-animations, and custom skeleton loader pulses to provide a premium user experience.

---

## 🚀 Features

- **Modern Glassmorphic Design**: Semi-transparent, blurred glass cards overlaying a deep space-radial gradient.
- **Micro-Animations**: Hover-zoom effects on movie posters, scale animations on action tags, and interactive button states.
- **Skeleton Loader Pulse**: A custom-designed placeholder animation that previews the visual structure of the movie details cards while data is being fetched.
- **Automatic Popular Showcase**: On load, CineFinder queries and showcases a popular movie by default (e.g., *Inception*), ensuring the interface is never empty.
- **Richer Metadata**: Displays more than just titles and ratings. You get details on Director & Writer, Box Office numbers, Awards, Language, and Ratings.
- **Instant Search Action**: Perform searches by clicking the "Search" button or simply pressing `Enter` on your keyboard.
- **Responsive Layout**: Adapts gracefully to all screens, from large monitors to tablets and mobile devices.

---

## 📁 Directory Structure

The project has been structured into standard production-ready directories:

```text
Movie/
├── assets/
│   └── star-icon.svg      # SVG graphic for rating rating stars
├── css/
│   └── style.css          # Modern Outfit-based glassmorphism stylesheet
├── js/
│   ├── index.js           # Main app controller (fetching, listeners, loaders)
│   └── key.js             # OMDb API authentication key
├── index.html             # Semantic markup with SEO tags
└── README.md              # Technical and usage documentation
```

---

## 🛠️ Technology Stack

- **HTML5**: Structured semantic markup and ARIA live regions for accessibility.
- **CSS3 (Vanilla)**: Glassmorphism (`backdrop-filter`), CSS Grid & Flexbox, custom `@keyframes` for pulsing loading states.
- **JavaScript (ES6+)**: Fetch API, async response rendering, event handling.
- **OMDb API**: Content-rich movie data service.

---

## ⚡ Setup & Run Instructions

Since this is a client-side vanilla JavaScript application, you can run it instantly without complex builds.

### Prerequisite
You need a web browser (Chrome, Firefox, Edge, Safari) and a simple HTTP server to avoid CORS issues when fetching API resources locally.

### Step-by-Step Launch
1. Clone or download this project.
2. Open a terminal in the `Movie` directory.
3. Start a local server. For example:
   - **Using Python (built-in)**:
     ```bash
     python -m http.server 8000
     ```
   - **Using Node/NPM (Live Server)**:
     ```bash
     npx live-server
     ```
4. Open your browser and navigate to `http://localhost:8000` (or the port specified by your tool).
5. Search for any movie to start exploring!

---

## 🔑 API Key

The API key used by this project is stored inside [key.js](file:///c:/Users/codex/GitHub/Movie/js/key.js). The default key is fully active. If you wish to use your own OMDb key, edit the file contents:
```javascript
const key = "YOUR_OMDB_API_KEY";
```
You can register for a free OMDb API key at [omdbapi.com](http://www.omdbapi.com/apikey.aspx).
