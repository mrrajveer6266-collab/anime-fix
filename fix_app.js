const fs = require('fs');
const path = require('path');

// Target file
const serverFile = path.join(__dirname, 'server.js');
const indexFile = path.join(__dirname, 'public', 'index.html');

// Create a quick working server code with Jikan API and English interface
const newServerCode = `
const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/anime', async (req, res) => {
    try {
        const query = req.query.q;
        let url = 'https://api.jikan.moe/v4/top/anime';
        if (query) {
            url = \`https://api.jikan.moe/v4/anime?q=\${encodeURIComponent(query)}\`;
        }
        const response = await axios.get(url);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch anime' });
    }
});

app.listen(PORT, () => {
    console.log(\`Server running on http://localhost:\${PORT}\`);
});
`;

fs.writeFileSync(serverFile, newServerCode);

// Create English UI HTML
const newHtmlCode = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anime Fix</title>
    <style>
        body { font-family: Arial, sans-serif; background-color: #121212; color: #fff; margin: 0; padding: 15px; }
        h1 { color: #ff6b00; text-align: center; }
        .search-box { display: flex; gap: 10px; margin-bottom: 20px; }
        input { flex: 1; padding: 10px; border-radius: 5px; border: 1px solid #333; background: #222; color: #fff; }
        button { padding: 10px 15px; border: none; background: #ff6b00; color: #fff; border-radius: 5px; cursor: pointer; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(140px, 1fr)); gap: 15px; }
        .card { background: #1e1e1e; border-radius: 8px; overflow: hidden; text-align: center; padding-bottom: 8px; }
        .card img { width: 100%; height: 190px; object-fit: cover; }
        .card p { margin: 8px 5px 0; font-size: 13px; font-weight: bold; line-height: 1.2; }
    </style>
</head>
<body>
    <h1>Anime Fix</h1>
    <div class="search-box">
        <input type="text" id="search" placeholder="Search anime (e.g. Naruto)...">
        <button onclick="loadAnime()">Search</button>
    </div>
    <div id="anime-list" class="grid">Loading...</div>

    <script>
        async function loadAnime() {
            const q = document.getElementById('search').value;
            const container = document.getElementById('anime-list');
            container.innerHTML = 'Loading...';
            try {
                const res = await fetch('/api/anime' + (q ? '?q=' + encodeURIComponent(q) : ''));
                const data = await res.json();
                if (!data.data || data.data.length === 0) {
                    container.innerHTML = '<p>No anime found.</p>';
                    return;
                }
                container.innerHTML = data.data.map(a => \`
                    <div class="card">
                        <img src="\${a.images.jpg.image_url}" alt="\${a.title}">
                        <p>\${a.title_english || a.title}</p>
                    </div>
                \`).join('');
            } catch (err) {
                container.innerHTML = '<p>Error loading anime.</p>';
            }
        }
        loadAnime();
    </script>
</body>
</html>
`;

if (!fs.existsSync(path.join(__dirname, 'public'))) {
    fs.mkdirSync(path.join(__dirname, 'public'));
}
fs.writeFileSync(indexFile, newHtmlCode);
console.log('App successfully updated to English UI with working Anime API!');
