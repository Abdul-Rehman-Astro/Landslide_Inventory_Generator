// Initialize the Leaflet map
const map = L.map('map').setView([29.852970, 77.875450], 13);

// Add a base tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Replace this with your actual Planet API key
const planetApiKey = 'PLAK525826dfc69a469cbbf3a5ad99c43872';

// Function to fetch data from the Planet API
async function fetchPlanetData(location, dateRange, cloudCover) {
  const [startDate, endDate] = dateRange;
  const locationString = location ? `&bbox=${location.join(',')}` : '';
  const dateRangeString = `&date.from=${startDate.toISOString()}&date.to=${endDate.toISOString()}`;
  const cloudCoverString = cloudCover !== undefined ? `&cloud_cover.lte=${cloudCover}` : '';

  const apiUrl = `https://api.planet.com/data/v1/searches?item_types=PSScene3Band&api_key=${planetApiKey}${locationString}${dateRangeString}${cloudCoverString}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  return data.features;
}

// Function to update the map with the filtered data
function updateMap(filteredData, location) {
  // Clear existing layers
  map.eachLayer(layer => {
    if (layer instanceof L.Polygon || layer instanceof L.Rectangle) {
      map.removeLayer(layer);
    }
  });

  // Add a rectangle for the specified location
  if (location) {
    const [minLng, minLat, maxLng, maxLat] = location;
    const rectangle = L.rectangle([[minLat, minLng], [maxLat, maxLng]], { color: 'red', fillOpacity: 0 }).addTo(map);
  }

  // Add new layers for the filtered data
  filteredData.forEach(item => {
    const polygon = L.polygon(item.geometry.coordinates).addTo(map);

    // Add a popup with the image URL
    polygon.bindPopup(`<img src="${item.properties.thumbnail}" width="200" />`);
  });
}

// Add event listener to the "Apply Filters" button
const applyFiltersBtn = document.getElementById('applyFilters');
applyFiltersBtn.addEventListener('click', async () => {
  const locationInput = document.getElementById('location').value;
  const startDate = new Date(document.getElementById('startDate').value);
  const endDate = new Date(document.getElementById('endDate').value);
  const cloudCover = parseFloat(document.getElementById('cloudCover').value);

  let location;
  if (locationInput) {
    // Assuming the location input is in the format "lng1,lat1,lng2,lat2" (e.g., "-120.27282714843749,38.348118547988065,-119.761962890625,38.74337300148126")
    location = locationInput.split(',').map(Number);
  }

  const dateRange = [startDate, endDate];
  const planetData = await fetchPlanetData(location, dateRange, cloudCover);
  updateMap(planetData, location);
});