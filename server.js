const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const JIKAN = 'https://api.jikan.moe/v4';

async function jikan(path) {
  const response = await fetch(JIKAN + path);

  if (!response.ok) {
    throw new Error('Jikan error ' + response.status);
  }

  return response.json();
}

app.get('/api/anime', async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page) || 1);
    const data = await jikan('/top/anime?page=' + page);

    res.json({
      data: data.data || [],
      pagination: data.pagination || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Anime load failed' });
  }
});

app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q || '';
    const page = Math.max(1, Number(req.query.page) || 1);

    if (!q.trim()) {
      return res.json({ data: [], pagination: {} });
    }

    const data = await jikan(
      '/anime?q=' + encodeURIComponent(q) + '&page=' + page
    );

    res.json({
      data: data.data || [],
      pagination: data.pagination || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Search failed' });
  }
});

app.get('/', (req, res) => {
  res.send('<!DOCTYPE html>' +
    '<html lang="hi">' +
    '<head>' +
    '<meta charset="UTF-8">' +
    '<meta name="viewport" content="width=device-width, initial-scale=1.0">' +
    '<title>Anime Fix</title>' +
    '<style>' +
    'body{font-family:Arial;background:#101010;color:white;margin:0;padding:20px}' +
    'h1{text-align:center;color:#ff6600}' +
    '.search{display:flex;gap:8px;margin-bottom:20px}' +
    'input{flex:1;padding:12px;border:0;border-radius:8px;font-size:16px}' +
    'button{padding:12px 18px;border:0;border-radius:8px;background:#ff6600;color:white;font-weight:bold}' +
    '.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:15px}' +
    '.card{background:#1d1d1d;border-radius:10px;overflow:hidden;cursor:pointer}' +
    '.card img{width:100%;height:190px;object-fit:cover}' +
    '.card h3{font-size:14px;padding:8px;margin:0}' +
    '#status{text-align:center;margin:15px}' +
    '#more{display:block;margin:25px auto}' +
    '</style>' +
    '</head>' +
    '<body>' +
    '<h1>Anime Fix</h1>' +

    '<div class="search">' +
    '<input id="searchInput" placeholder="Search anime...">' +
    '<button onclick="searchAnime()">Search</button>' +
    '</div>' +

    '<div id="status">Anime loading...</div>' +
    '<div id="animeContainer" class="grid"></div>' +

    '<button id="more" onclick="loadMore()">Load More Anime</button>' +

    '<script>' +

    'var page=1;' +
    'var searchMode=false;' +
    'var searchText="";' +

    'async function getAnime(p,append){' +
    'document.getElementById("status").textContent="Anime loading...";' +

    'try{' +
    'var url=searchMode' +
    '?"/api/search?q="+encodeURIComponent(searchText)+"&page="+p' +
    ': "/api/anime?page="+p;' +

    'var r=await fetch(url);' +
    'var result=await r.json();' +

    'if(!r.ok)throw new Error(result.error||"API error");' +

    'render(result.data||[],append);' +

    'document.getElementById("status").textContent=' +
    '"Page "+p+" • "+(result.data||[]).length+" anime";' +

    'var more=result.pagination&&result.pagination.has_next_page;' +
    'document.getElementById("more").style.display=more?"block":"none";' +

    '}catch(e){' +
    'console.error(e);' +
    'document.getElementById("status").textContent="Anime load failed";' +
    '}' +
    '}' +

    'function render(list,append){' +
    'var c=document.getElementById("animeContainer");' +

    'if(!append)c.innerHTML="";' +

    'list.forEach(function(a){' +
    'var card=document.createElement("div");' +
    'card.className="card";' +

    'var img=(a.images&&a.images.jpg&&a.images.jpg.image_url)||"";' +
    'var title=a.title||"Unknown Anime";' +

    'card.innerHTML=' +
    '"<img src=\\"" + img + "\\" alt=\\"" + title + "\\"><h3>"' +
    '+title+"</h3>";' +

    'c.appendChild(card);' +
    '});' +
    '}' +

    'async function loadMore(){' +
    'page++;' +
    'await getAnime(page,true);' +
    '}' +

    'async function searchAnime(){' +
    'var q=document.getElementById("searchInput").value.trim();' +

    'if(!q){' +
    'searchMode=false;' +
    'searchText="";' +
    'page=1;' +
    'getAnime(1,false);' +
    'return;' +
    '}' +

    'searchMode=true;' +
    'searchText=q;' +
    'page=1;' +
    'getAnime(1,false);' +
    '}' +

    'getAnime(1,false);' +

    '</script>' +
    '</body>' +
    '</html>');
});

app.listen(process.env.PORT || 3000, '0.0.0.0', function() {
  console.log('Anime Fix running on port 3000');
});
