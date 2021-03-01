/* eslint-disable */
export const displayMap = (locations) => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoibGV3aXN5IiwiYSI6ImNrbG1qaXR2YzA5dmcyd3FyNXkyZ2lsbHcifQ.WsufR3Kmii4U_moKzM0ZJA';
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/lewisy/cklmkl5xs288a17lnubnscxtp',
    scrollZoom: false,
    doubleClickZoom: false,
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach((loc) => {
    const el = document.createElement('div');
    el.className = 'marker';

    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom',
    })
      .setLngLat(loc.coordinates)
      .addTo(map);

    // add popup
    new mapboxgl.Popup({
      offset: 35,
      closeOnClick: false,
      closeButton: false,
    })
      .setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
      .addTo(map);

    bounds.extend(loc.coordinates);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100,
    },
  });
};
