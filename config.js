/* ---------- config.js (revised with special incident support) ---------- */
const config = {
  style: 'mapbox://styles/mapbox/dark-v11',
  accessToken:
    'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtYm9mMjJpdzE2ZTYyaXE5Mmx2Yng5aHoifQ.ptuVPXZ7BVI4vsG1aY70Gw',
  showMarkers: false,
  theme: 'dark',
  alignment: 'left',
  footer: 'Monitoring Taiwan Undersea Cable Incidents in 2025',

  cablesGeoJSON:
    'https://oukangneng.github.io/TaiwanInternet/data/Global_Submarine_Cables.geojson',
  redGeoJSON:
    'https://oukangneng.github.io/TaiwanInternet/data/cable_incidents.geojson',
  plannedCableGeoJSON:
    'https://raw.githubusercontent.com/Oukangneng/TaiwanInternet/main/data/Taiwan_Matsu_No_4_Cable.geojson',

  /* NEW — single special incident */
  specialIncidentGeoJSON:
    'https://oukangneng.github.io/TaiwanInternet/data/special_incident.geojson',

  /* ---------- LAYERS ---------- */
  initializeMapLayers(map) {
    /* Cables -------------------------------------------------------- */
    if (!map.getSource('cables')) {
      map.addSource('cables', { type: 'geojson', data: config.cablesGeoJSON });
      map.addLayer({
        id: 'cables-layer',
        type: 'line',
        source: 'cables',
        paint: { 'line-color': '#ff5733', 'line-width': 2 }
      });
    }

    /* Planned cable (added once, hidden by default) ----------------- */
    if (!map.getSource('planned-cable')) {
      map.addSource('planned-cable', {
        type: 'geojson',
        data: config.plannedCableGeoJSON
      });
    }
    if (!map.getLayer('planned-cable-layer')) {
      map.addLayer({
        id: 'planned-cable-layer',
        type: 'line',
        source: 'planned-cable',
        layout: {
          visibility: 'none',
          'line-cap': 'round',
          'line-join': 'round'
        },
        paint: {
          'line-color': '#00ffff',
          'line-width': 6,
          'line-dasharray': [4, 2]
        }
      });
    }
  },

  /**
   * Red incident markers (multiple points)
   */
  addIncidentMarkers(map) {
    if (this._markers) {
      this._markers.forEach(marker => marker.remove());
    }
    this._markers = [];

    fetch(this.redGeoJSON)
      .then(res => res.json())
      .then(data => {
        data.features.forEach(feature => {
          const el = document.createElement('div');
          el.className = 'red-marker';
          el.style.cssText = `
            width: 24px; height: 24px; border-radius: 50%;
            background-color: red; border: 2px solid black;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
            cursor: pointer;
          `;

          const props = feature.properties;
          const popupHTML = `
            <strong>${props.cable || 'No Cable Name'}</strong><br>
            <em>${props.date || 'No Date'}</em><br>
            ${props.distance || ''}${props.notes ? `<br><small>${props.notes}</small>` : ''}
          `;

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML))
            .addTo(map);

          this._markers.push(marker);
        });
      })
      .catch(err => console.error('Failed to load redGeoJSON:', err));
  },

  /**
   * Special highlighted incident (single point)
   */
  addSpecialIncidentMarker(map) {
    if (this._specialMarker) {
      this._specialMarker.remove();
    }
    this._specialMarker = null;

    fetch(this.specialIncidentGeoJSON)
      .then(res => res.json())
      .then(data => {
        if (!data.features.length) return;
        const feature = data.features[0];

        const el = document.createElement('div');
        el.style.cssText = `
          width: 28px; height: 28px; border-radius: 50%;
          background-color: yellow; border: 3px solid black;
          box-shadow: 0 0 12px rgba(255,255,0,0.9);
          cursor: pointer;
        `;

        const props = feature.properties || {};
        const popupHTML = `
          <strong>${props.cable || 'Special Cable'}</strong><br>
          <em>${props.date || 'No Date'}</em><br>
          ${props.notes || ''}
        `;

        this._specialMarker = new mapboxgl.Marker(el)
          .setLngLat(feature.geometry.coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML))
          .addTo(map);
      })
      .catch(err => console.error('Failed to load specialIncidentGeoJSON:', err));
  },

  /* ---------- SHOW / HIDE HELPERS ---------- */
  showPlannedCable(map) {
    if (!map.getLayer('planned-cable-layer')) {
      config.initializeMapLayers(map);
    }
    map.setLayoutProperty('planned-cable-layer', 'visibility', 'visible');
  },
  hidePlannedCable(map) {
    if (map.getLayer('planned-cable-layer')) {
      map.setLayoutProperty('planned-cable-layer', 'visibility', 'none');
    }
  },

  /* ---------- CHAPTERS ---------- */
  chapters: [
    {
      id: 'intro',
      title: 'Monitoring Taiwan’s Undersea Cable Incidents in 2025 | By Owen OConnell',
      subtitle: 'A visual timeline of cable malfunctions disrupting Taiwan’s internet connections in 2025.',
      image: './data/canvabargraph.png',
      description: `Taiwan’s digital lifelines...`,
      location: { center: [120, 24], zoom: 7, pitch: 0, bearing: 0 },
      onChapterEnter() {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    // You can choose a chapter to call addSpecialIncidentMarker(map) here
  ]
};
