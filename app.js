window.onload = function () {

  var hostname = location.hostname
  var channelId = hostname.split('.')[0]

  if (channelId === 'localhost') channelId = 'comoro'

  var app = document.querySelector('#app')
  fetch('http://api.mep/v1/channels/' + channelId + '/data')
  .then(function (response) { return response.json() })
  .then(function (items) {
    app.innerHTML = '<h1>Zihadisi za imitrume</h1>' +
      items.map(function (item) {
        return '<iframe class="youtube" width="560" height="315" src="' + item['video:url'] + '" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
      }).join('\n')
  })
}
