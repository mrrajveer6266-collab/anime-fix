const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const newScript = `
function openAndPlayAnime(animeId, title, totalEps, posterUrl) {
    let detailModal = document.getElementById('animeDetailModal');
    if(!detailModal) {
        detailModal = document.createElement('div');
        detailModal.id = 'animeDetailModal';
        detailModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0f0f0f;z-index:9999;display:flex;flex-direction:column;overflow-y:auto;font-family:sans-serif;color:#fff;';
        document.body.appendChild(detailModal);
    }

    let epsButtons = '';
    let maxEps = totalEps || 12;
    for(let i = 1; i <= maxEps; i++) {
        epsButtons += \`<button onclick="playEpisode('\${animeId}', \${i})" style="padding:10px 15px;background:#1a1a1a;color:#fff;border:1px solid #333;border-radius:8px;cursor:pointer;font-weight:bold;transition:0.2s;text-align:center;">Ep \${i}</button>\`;
    }

    detailModal.innerHTML = \`
        <div style="display:flex;justify-content:space-between;align-items:center;padding:15px 20px;background:#141414;position:sticky;top:0;z-index:10;border-bottom:1px solid #222;">
            <span style="color:#ff4757;font-weight:bold;font-size:18px;">🔥 ANIME FIX</span>
            <button onclick="document.getElementById('animeDetailModal').style.display='none'" style="padding:6px 14px;background:#ff4757;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">Close ✖</button>
        </div>
        <div style="padding:20px;max-width:900px;margin:0 auto;width:100%;box-sizing:border-box;">
            <h2 id="modalTitle" style="font-size:24px;margin-bottom:15px;color:#fff;">\${title || 'Anime Details'}</h2>
            
            <!-- Video Player Section -->
            <div id="videoContainer" style="width:100%;aspect-ratio:16/9;background:#000;border-radius:12px;overflow:hidden;margin-bottom:25px;display:flex;align-items:center;justify-content:center;border:1px solid #222;">
                <p style="color:#777;font-size:14px;">Select an episode below to start streaming right here!</p>
            </div>

            <h3 style="font-size:18px;margin-bottom:15px;border-left:4px solid #ff4757;padding-left:8px;">Episodes</h3>
            <div style="display:grid;grid-template-columns:repeat(auto-fill, minmax(70px, 1fr));gap:10px;max-height:250px;overflow-y:auto;padding-right:5px;">
                \${epsButtons}
            </div>
        </div>
    \`;
    detailModal.style.display = 'flex';
}

function playEpisode(animeId, epNum) {
    let videoContainer = document.getElementById('videoContainer');
    // यहाँ हम VidSrc या आपके पसंदीदा सर्वर का एम्बेड लिंक सीधा आपकी साइट के अंदर चलाएंगे
    let embedUrl = \`https://vidsrc.xyz/embed/anime/\${animeId}/\${epNum}\`;
    
    videoContainer.innerHTML = \`<iframe src="\${embedUrl}" style="width:100%;height:100%;border:none;" allowfullscreen></iframe>\`;
}
`;

// पुरानी स्क्रिप्ट को नए डिटेल पेज वाले कोड से बदलें
html = html.replace(/function openAndPlayAnime[\s\S]*?<\/script>/, newScript + '\n</script>');
fs.writeFileSync('public/index.html', html);
console.log('Internal Detail Page & Player integrated successfully!');
