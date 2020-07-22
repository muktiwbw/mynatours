mapboxgl.accessToken = 'pk.eyJ1IjoibXVrdGl3YnciLCJhIjoiY2tjbG00c25qMDV5aDJxbGpiOWE1dDl4NiJ9.QKgRyoSj8wdKIaGGGcpwxw';

const initGeocoder = function(el) {
  const mapOption = {
    container: 'geocoder-map',
    style: 'mapbox://styles/muktiwbw/ckcln6p520tm31ik9ijeaawp4',
    center: [115.11280313746386,-1.6926391618314938],
    zoom: 3
  };

  const geoCoderOption = {
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false
  };

  if (el.value !== '') {
    mapOption.center = el.value.split(',');
    mapOption.zoom = 15;
  }

  const map = new mapboxgl.Map(mapOption);
  const geocoder = new MapboxGeocoder(geoCoderOption);
  
  document.querySelector('#geocoder-input').appendChild(geocoder.onAdd(map));

  const markerEl = document.createElement('div');
  markerEl.className = 'marker';
  
  const marker = new mapboxgl.Marker({
    element: markerEl,
    anchor: 'bottom'
  });

  if (el.value !== '') marker.setLngLat(el.value.split(',')).addTo(map);
  
  map.on('click', function(e) {
        
    const { lng, lat } = e.lngLat;

    el.value = `${lng},${lat}`;
    
    marker
    .setLngLat([lng, lat])
    .addTo(map);
  });
}

const locInputHandler = function(e) {
  e.preventDefault();

  // * 1. Switch focus
  const currFocused = document.querySelector('input.coordinate.focused');
  if (currFocused) currFocused.classList.remove('focused');  
  this.classList.add('focused');

  // * 2. Remove map
  const mapSection = document.querySelector('#geocoder-section');

  if (mapSection) {
    if (mapSection.parentElement === this.parentElement) {
      return;
    } else {
      mapSection.remove();
    }
  } 
  

  // * 3. Create geocoder section
  const geocoderSection = document.createElement('div');
  const geocoderInput = document.createElement('div');
  const geocoderMap = document.createElement('div');
  const geocoderControl = document.createElement('div');
  const geocoderBtOk = document.createElement('button');

  geocoderSection.id = 'geocoder-section';
  geocoderInput.id = 'geocoder-input';
  geocoderInput.className = 'ma-bt-sm';
  geocoderMap.id = 'geocoder-map';
  geocoderMap.className = 'ma-bt-sm';
  geocoderControl.id = 'geocoder-control';
  geocoderControl.className = 'right ma-bt-md';
  geocoderBtOk.className = 'mp btn btn--small btn--green';
  geocoderBtOk.setAttribute('action', 'ok');
  geocoderBtOk.innerText = 'Close';
  geocoderBtOk.onclick = mpCtrlHandler;

  geocoderControl.appendChild(geocoderBtOk);
  geocoderSection.appendChild(geocoderInput);
  geocoderSection.appendChild(geocoderMap);
  geocoderSection.appendChild(geocoderControl);

  if (this.nextSibling) {
    this.parentElement.insertBefore(geocoderSection, this.nextSibling);
  } else {
    this.parentElement.appendChild(geocoderSection);
  }

  initGeocoder(this);
}

document.querySelectorAll('input.locations.coordinate').forEach(coor => coor.onfocus = locInputHandler);
document.querySelector('input.startLocation.coordinate').onfocus = locInputHandler;

const mpCtrlHandler = function(e) {
  const action = this.getAttribute('action');

  switch (action) {
    case 'ok':
      document.querySelector('#geocoder-section').remove();
      break;
  
    default:
      break;
  }
};