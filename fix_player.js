const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

const updatedPlayerScript = `
function openAndPlayAnime(url) {
    let animeTitle = "Anime Episode";
    let watchUrl = "https://vidsrc.xyz/embed/anime/frieren/1-1";
    
    if(typeof url === 'string' && url.length > 0) {
        watchUrl = url.includes('http') ? url : 'https://vidsrc.xyz/embed/anime/' + url;
    }

    let playerModal = document.getElementById('playerModal');
    if(!playerModal) {
        playerModal = document.createElement('div');
        playerModal.id = 'playerModal';
        playerModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.96);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:15px;box-sizing:border-box;';
        
        playerModal.innerHTML = \`
            <div style="width:100%;max-width:700px;display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <span style="color:#ff4757;font-weight:bold;font-family:sans-serif;font-size:18px;">🔥 ANIME FIX PLAYER</span>
                <button onclick="document.getElementById('playerModal').remove()" style="padding:6px 14px;background:#ff4757;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Close ✖</button>
            </div>
            <div style="width:100%;max-width:700px;background:#1a1a1a;border-radius:12px;padding:30px;text-align:center;box-shadow:0 8px 30px rgba(0,0,0,0.9);font-family:sans-serif;">
                <h3 style="color:#fff;margin-bottom:15px;font-size:20px;">Ready to Watch!</h3>
                <p style="color:#aaa;font-size:14px;margin-bottom:25px;">Click the button below to open the secure high-speed streaming server in full player mode:</p>
                <a id="directWatchBtn" href="\${watchUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#ff4757;color:#white;color:#fff;text-decoration:none;font-weight:bold;border-radius:8px;font-size:16px;box-shadow:0 4px 15px rgba(255,71,87,0.4);">▶ Play Anime Now (HD)</a>
            </div>
        \`;
        document.body.appendChild(playerModal);
    } else {
        document.getElementById('directWatchBtn').href = watchUrl;
        playerModal.style.display = 'flex';
    }
}
`;

html = html.replace(/function openAndPlayAnime[\s\S]*?<\/script>/, updatedPlayerScript + '\n</script>');
fs.writeFileSync('public/index.html', html);
console.log('Direct Stream Launcher integrated successfully!');
