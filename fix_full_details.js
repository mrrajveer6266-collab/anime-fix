const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const updatedScript = `
function openAndPlayAnime(animeId, title, totalEps, posterUrl) {
    let detailModal = document.getElementById('animeDetailModal');
    if(!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'animeDetailModal';
        detailModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0f0f0f;z-index:9999;display:flex;flex-direction:column;overflow-y:auto;font-family:sans-serif;color:#fff;';
        document.body.appendChild(detailModal);
    }

    let maxEps = totalEps || 24;
    let epsButtons = '';
    for(let i = 1; i <= maxEps; i++) {
        epsButtons += \`<button onclick="playEpisode('\${animeId}', \${i}, \${maxEps})" id="ep-btn-\${i}" style="padding:12px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;cursor:pointer;font-weight:bold;transition:0.2s;text-align:center;">Ep \${i}</button>\`;
    }

    detailModal.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:#141414;position:sticky;top:0;z-index:10;border-bottom:1px solid #222;">
            <span style="color:#ff4757;font-weight:bold;font-size:18px;">🔥 ANIME FIX</span>
            <button onclick="document.getElementById('animeDetailModal').style.display='none'" style="padding:6px 14px;background:#ff4757;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Close ✖</button>
        </div>
        <div style="padding:20px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
            
            <!-- Anime Header with Poster -->
            <div style="display:flex;gap:15px;align-items:center;margin-bottom:20px;background:#161616;padding:15px;border-radius:12px;border:1px solid #222;">
                <img src="\${posterUrl || 'https://via.placeholder.com/100x150'}" style="width:80px;height:110px;object-fit:cover;border-radius:8px;" />
                <div>
                    <h2 style="font-size:20px;margin-bottom:8px;color:#fff;">\${title || 'Anime Details'}</h2>
                    <p style="color:#aaa;font-size:13px;margin:0;">Total Episodes: <b>\${maxEps}</b></p>
                </div>
            </div>

            <!-- Video Player Section -->
            <div id="videoContainer" style="width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;margin-bottom:20px;display:flex;align-items:center;justify-content:center;border:1px solid #222;">
                <p style="color:#777;font-size:14px;">Select an episode below to start streaming!</p>
            </div>

            <!-- Next Episode Control Bar -->
            <div id="playerControls" style="display:none;justify-content:space-between;align-items:center;margin-bottom:20px;">
                <span id="currentPlayingText" style="color:#ff4757;font-weight:bold;font-size:14px;">Playing Episode 1</span>
                <button id="nextEpBtn" style="padding:8px 16px;background:#ff4757;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Next Episode ▶</button>
            </div>

            <h3 style="font-size:18px;margin-bottom:15px;border-left:4px solid #ff4757;padding-left:8px;">All Episodes</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(75px, 1fr));gap:10px;max-height:280px;overflow-y:auto;padding-right:5px;">
                \${epsButtons}
            </div>
        </div>
    \`;
    detailModal.style.display = 'flex';
}

let currentAnimeId = '';
let currentEpNum = 1;
let maxEpisodesCount = 1;

function playEpisode(animeId, epNum, totalEps) {
    currentAnimeId = animeId;
    currentEpNum = epNum;
    maxEpisodesCount = totalEps;

    let videoContainer = document.getElementById('videoContainer');
    let embedUrl = \`https://vidsrc.xyz/embed/anime/\${animeId}/\${epNum}\`;
    
    videoContainer.innerHTML = \`<iframe src="\${embedUrl}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>\`;

    // Controls show करें और Next Episode का बटन सेट करें
    document.getElementById('playerControls').style.display = 'flex';
    document.getElementById('currentPlayingText').innerText = \`Playing Episode \${epNum}\`;

    let nextBtn = document.getElementById('nextEpBtn');
    if (epNum < totalEps) {
        nextBtn.style.display = 'block';
        nextBtn.onclick = function() {
            playEpisode(animeId, epNum + 1, totalEps);
        };
    } else {
        nextBtn.style.display = 'none';
    }

    // Active button highlight
    document.querySelectorAll('[id^="ep-btn-"]').forEach(b => b.style.background = '#1a1a1a');
    let activeBtn = document.getElementById('ep-btn-' + epNum);
    if(activeBtn) activeBtn.style.background = '#ff4757';
}
`;

html = html.replace(/function openAndPlayAnime[\s\S]*?<\/script>/, updatedScript + '\n</script>');
fs.writeFileSync('public/index.html', html);
console.log('Full details, posters and next episode feature integrated!');
