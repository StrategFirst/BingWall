// Map setup
var map = L.map('map').setView([48.8583701, 2.2944813], 1.5);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var markerIconDay = L.icon({
    iconUrl: 'assets/pointer.svg',
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [18, 0],
})
var markerIconMonth = L.icon({
    iconUrl: 'assets/pointer-old.svg',
    iconSize: [36, 36],
    iconAnchor: [18, 35],
    popupAnchor: [0, -20],
})

/**
 * Add a marker to the page map with the given information
 * and return an html anchor to it
 * 
 * @param {string|number} lat The map marker lattitude
 * @param {string|number} long The map marker longitude
 * @param {string} title The map marker title
 * @param {string} img_path Relative or absolute path to the referenced image for miniature usage
 * @param {boolean} old If old, this isn't a daily marker, change it's visual
 * @returns {string} A dom string storing the HTML with a anchor link to the generated marker
 */
function addMarker(lat, long, title, img_path, old) {
    var marker = L.marker([lat, long],{icon:old?markerIconMonth:markerIconDay}).addTo(map);
    let anchor_name = `map_marker${title.replace(/[^a-zA-Z0-9_-]/ig,'')}`
    marker.bindPopup(`<strong id="${anchor_name}">${title}</strong> <img class="map_img_miniature" src="${img_path}" />`);
    return `<a href="#${anchor_name}" class="map-marker-link"> Emplacement sur la carte. </a>`;
}
