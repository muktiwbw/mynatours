const locations = JSON.parse(document.getElementById('map').dataset.locations);

mapboxgl.accessToken = 'pk.eyJ1IjoibXVrdGl3YnciLCJhIjoiY2tjbG00c25qMDV5aDJxbGpiOWE1dDl4NiJ9.QKgRyoSj8wdKIaGGGcpwxw';

var map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/muktiwbw/ckcln6p520tm31ik9ijeaawp4'
});

const bounds = new mapboxgl.LngLatBounds();

// Add marker for each location
locations.forEach(loc => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker';

  // Style and add marker
  new mapboxgl.Marker({
    element: el,
    anchor: 'bottom'
  })
    .setLngLat(loc.coordinates)
    .addTo(map);

  // Add marker popup (or tooltip)
  new mapboxgl.Popup({
    offset: 30
  })
    .setLngLat(loc.coordinates)
    .setHTML(`<span>Day ${loc.day}: ${loc.description}</span>`)
    .addTo(map);

  // Add location to bound
  bounds.extend(loc.coordinates)
});

map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 200,
    left: 100,
    right: 100
  }
});