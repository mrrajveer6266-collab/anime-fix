const fs = require('fs');
let html = fs.readFileSync('public/index.html', 'utf8');

// प्लेयर फ़ंक्शन को एकदम साफ़ तरीके से रिप्लेस करना
const correctPlayerScript = `
function openAndPlayAnime(url) {
    let slug = '';
    if(typeof url === 'string') {
        slug = url.split('/').pop().replace('-episode-1','');
    }
    const embedUrl = 'https://gogoanime3.co/embed/' + (slug || 'naruto') + '-episode-1';
    let playerModal = document.getElementById('playerModal');
    if(!playerModal) {
        playerModal = document.createElement('div');
        playerModal.id = 'playerModal';
        playerModal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.9);z-index:9999;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:10px;';
        playerModal.innerHTML = '<button onclick="document.getElementById(\\'playerModal\\').remove()" style="align-self:flex-end;margin-bottom:10px;padding:8px 16px;background:#ff4757;color:#fff;border:none;border-radius:5px;cursor:pointer;font-weight:bold;">Close ✖</button><iframe id="animeIframe" src="' + embedUrl + '" width="100%" height="350" frameborder="0" allowfullscreen style="max-width:800px;border-radius:10px;background:#000;"></iframe>';
        document.body.appendChild(playerModal);
    } else {
        document.getElementById('animeIframe').src = embedUrl;
        playerModal.style.display = 'flex';
    }
}
`;

html = html.replace(/function openAndPlayAnime[\s\S]*?<\/script>/, correctPlayerScript + '\n</script>');
fs.writeFileSync('public/index.html', html);
console.log('Fixed successfully!');
