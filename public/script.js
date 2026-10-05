(function() {
  function slugify(text) {
    return text.toString().toLowerCase().trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  }

  // Override or create showAnime function
  window.showAnime = function(id) {
    var title = "Sousou no Frieren";
    var target = event ? event.target.closest('.card') : null;
    
    if (target) {
      var h3 = target.querySelector('h3');
      if (h3) title = h3.innerText.trim();
    }

    var slug = slugify(title);
    var epNum = 1;
    var mainEmbed = "https://em.gogoanime.bid/streaming.php?id=" + slug + "-episode-" + epNum;
    var backupEmbed = "https://vidsrc.to/embed/anime/" + slug + "/" + epNum;

    // Existing modal remove if open
    var oldModal = document.getElementById('animeFixVideoModal');
    if (oldModal) oldModal.remove();

    var modal = document.createElement('div');
    modal.id = 'animeFixVideoModal';
    modal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.95); z-index:999999; display:flex; flex-direction:column; align-items:center; justify-content:center; padding:10px; box-sizing:border-box;';

    modal.innerHTML = 
      '<div style="width:100%; max-width:800px; background:#1b1b1b; border-radius:12px; overflow:hidden; border:1px solid #ff6600;">' +
        '<div style="padding:12px 15px; background:#242424; display:flex; justify-content:space-between; align-items:center;">' +
          '<h3 style="color:#fff; margin:0; font-size:16px;">▶ Watching: ' + title + '</h3>' +
          '<div>' +
            '<button onclick="document.getElementById(\'videoIframe\').src=\'' + backupEmbed + '\'" style="background:#ff6600; color:#fff; border:none; padding:5px 10px; border-radius:4px; margin-right:8px; cursor:pointer; font-weight:bold;">Server 2</button>' +
            '<button onclick="document.getElementById(\'animeFixVideoModal\').remove();" style="background:#ff4d4d; color:#fff; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; font-weight:bold;">✕ Close</button>' +
          '</div>' +
        '</div>' +
        '<div style="position:relative; width:100%; height:0; padding-bottom:56.25%; background:#000;">' +
          '<iframe id="videoIframe" src="' + mainEmbed + '" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allowfullscreen referrer-policy="no-referrer"></iframe>' +
        '</div>' +
      '</div>';

    document.body.appendChild(modal);
  };
})();
