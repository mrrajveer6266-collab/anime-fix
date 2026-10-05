(function() {
  // 1. Convert Title to Gogoanime Slug Format
  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')           // Spaces to -
      .replace(/[^\w\-]+/g, '')       // Remove non-word chars
      .replace(/\-\-+/g, '-');        // Collapse multiple -
  }

  // 2. Play Video Modal/Overlay Function
  window.playAnimeStream = function(animeTitle, epNum) {
    epNum = epNum || 1;
    var slug = slugify(animeTitle);
    
    // Gogoanime Primary Embed & Fallback Server
    var mainEmbed = "https://em.gogoanime.bid/streaming.php?id=" + slug + "-episode-" + epNum;
    var backupEmbed = "https://vidsrc.to/embed/anime/" + slug + "/" + epNum;

    var overlay = document.getElementById('animeFixVideoOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'animeFixVideoOverlay';
      overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:99999999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:15px; box-sizing:border-box;';
      document.body.appendChild(overlay);
    }

    overlay.innerHTML = 
      '<div style="width:100%; max-width:850px; background:#1c1c1c; border-radius:12px; overflow:hidden; border:1px solid #ff6600; box-shadow:0 10px 30px rgba(0,0,0,0.8);">' +
        '<div style="padding:12px 18px; background:#282828; display:flex; justify-content:space-between; align-items:center;">' +
          '<h3 style="color:#fff; margin:0; font-size:15px; font-family:sans-serif;">Watching: ' + animeTitle + ' (Ep ' + epNum + ')</h3>' +
          '<div>' +
            '<button onclick="document.getElementById(\'animeFixIframe\').src=\'' + backupEmbed + '\'" style="background:#ff6600; color:#fff; border:none; padding:6px 12px; border-radius:4px; font-size:12px; margin-right:8px; cursor:pointer; font-weight:bold;">Server 2</button>' +
            '<button onclick="document.getElementById(\'animeFixVideoOverlay\').style.display=\'none\'; document.getElementById(\'animeFixVideoOverlay\').innerHTML=\'\';" style="background:#ff4d4d; color:#fff; border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-weight:bold;">✕ Close</button>' +
          '</div>' +
        '</div>' +
        '<div style="position:relative; width:100%; height:0; padding-bottom:56.25%; background:#000;">' +
          '<iframe id="animeFixIframe" src="' + mainEmbed + '" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen referrer-policy="no-referrer"></iframe>' +
        '</div>' +
      '</div>';

    overlay.style.display = 'flex';
  };

  // 3. Bind showAnime for index.html onclick buttons
  window.showAnime = function(animeId) {
    // Find the title from card or event
    var targetCard = event ? (event.target.closest('.card') || event.target.parentElement) : null;
    var title = "One Piece";
    if (targetCard) {
      var h3 = targetCard.querySelector('h3') || targetCard.querySelector('h2');
      if (h3) title = h3.innerText.trim();
    }
    window.playAnimeStream(title, 1);
  };

  // 4. Load Default Anime if API fails
  window.loadAnime = async function(page) {
    const container = document.getElementById("animeContainer");
    const status = document.getElementById("status");
    if (!container) return;

    try {
      const res = await fetch("https://api.jikan.moe/v4/top/anime?limit=25");
      const data = await res.json();
      if (data && data.data) {
        container.innerHTML = "";
        data.data.forEach(item => {
          const card = document.createElement("div");
          card.className = "card";
          card.innerHTML = `
            <img src="${item.images.jpg.image_url}" alt="${item.title}" loading="lazy">
            <h3>${item.title}</h3>
            <p>⭐ ${item.score || 'N/A'} &nbsp; • &nbsp; 📺 ${item.episodes || 'N/A'}</p>
            <button class="watch-btn" onclick="event.stopPropagation(); playAnimeStream('${item.title.replace(/'/g, "\\'")}', 1);">
              ▶️ Play / Watch
            </button>
          `;
          container.appendChild(card);
        });
        if (status) status.innerText = `Showing ${data.data.length} anime`;
      }
    } catch(e) {
      console.log("Using static list fallback");
    }
  };

  // Global click listener for play buttons
  document.addEventListener("click", function(e) {
    var btn = e.target.closest('.watch-btn') || e.target.closest('button');
    if (btn && btn.innerText && btn.innerText.includes('Play / Watch')) {
      var card = btn.closest('.card') || btn.parentElement;
      if (card) {
        var h3 = card.querySelector('h3');
        if (h3) {
          e.preventDefault();
          e.stopPropagation();
          window.playAnimeStream(h3.innerText.trim(), 1);
        }
      }
    }
  }, true);

})();
