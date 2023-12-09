var map = L.map('map').setView([48.8583701, 2.2944813], 1.5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function addMarker(lat, long, title, img_path) {
    var marker = L.marker([lat, long]).addTo(map);
    let anchor_name = `map_marker${title.replace(/[^a-zA-Z0-9_-]/ig,'')}`
    marker.bindPopup(`<strong id="${anchor_name}">${title}</strong> <img class="map_img_miniature" src="${img_path}" />`).openPopup();
    return `<a href="#${anchor_name}" class="map-marker-link"> Emplacement sur la carte. </a>`;
}
