/* ---------- config.js (revised with special incident layer) ---------- */
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
  specialIncidentGeoJSON:
    'https://oukangneng.github.io/TaiwanInternet/data/special_incident.geojson', // NEW
  plannedCableGeoJSON:
    'https://raw.githubusercontent.com/Oukangneng/TaiwanInternet/main/data/Taiwan_Matsu_No_4_Cable.geojson',

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
          visibility: 'none',      // hidden until toggled
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

    /* Special Incident Layer ---------------------------------------- */
    if (!map.getSource('special-incident')) {
      map.addSource('special-incident', {
        type: 'geojson',
        data: config.special_IncidentGeoJSON
      });
    }
    if (!map.getLayer('special-incident-layer')) {
      map.addLayer({
        id: 'special-incident-layer',
        type: 'circle',
        source: 'special-incident',
        layout: { visibility: 'none' }, // show only on relevant chapter
        paint: {
          'circle-radius': 10,
          'circle-color': '#ffff00',
          'circle-stroke-width': 2,
          'circle-stroke-color': '#000'
        }
      });
    }
  },

  /**
   * Fetch the incident GeoJSON and add red circle markers with popups
   */
  addIncidentMarkers(map) {
    if (this._markers) {
      this._markers.forEach(marker => marker.remove());
    }
    this._markers = [];

    fetch(this.redGeoJSON)
      .then(response => response.json())
      .then(data => {
        data.features.forEach(feature => {
          const el = document.createElement('div');
          el.className = 'red-marker';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.backgroundColor = 'red';
          el.style.border = '2px solid black';
          el.style.boxShadow = '0 0 5px rgba(0,0,0,0.5)';
          el.style.cursor = 'pointer';

          const props = feature.properties;
          const popupHTML = `
            <strong>${props.cable || 'No Cable Name'}</strong><br>
            <em>${props.date || 'No Date'}</em><br>
            ${props.distance || ''}${props.notes ? `<br><small>${props.notes}</small>` : ''}
          `;

          const marker = new mapboxgl.Marker(el)
            .setLngLat(feature.geometry.coordinates)
            .setPopup(
              new mapboxgl.Popup({ offset: 25 }).setHTML(popupHTML)
            )
            .addTo(map);

          this._markers.push(marker);
        });
      })
      .catch(err => {
        console.error('Failed to load or parse redGeoJSON:', err);
      });
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

  showSpecialIncident(map) {
    if (!map.getLayer('special-incident-layer')) {
      config.initializeMapLayers(map);
    }
    map.setLayoutProperty('special-incident-layer', 'visibility', 'visible');
  },

  hideSpecialIncident(map) {
    if (map.getLayer('special-incident-layer')) {
      map.setLayoutProperty('special-incident-layer', 'visibility', 'none');
    }
  },

  /* ---------- CHAPTERS ---------- */
  chapters: [
    {
      id: 'intro',
      title: 'Monitoring Taiwan’s Undersea Cable Incidents in 2025 | By Owen OConnell',
      subtitle: 'A visual timeline of cable malfunctions disrupting Taiwan’s internet connections in 2025.',
      image: './data/canvabargraph.png',
      description:`Taiwan’s digital lifelines are under growing pressure. In 2025 alone, multiple undersea cables connecting the island to the world were cut, degraded, or sabotaged—disrupting communications and exposing deep vulnerabilities. <br><br> This visual tracker guides you through undersea cable disruptions between Taiwan and other regions in 2025. Each red circle marks a reported malfunction—click on a circle to view details about the incident.`,
      location: { center: [120, 24], zoom: 7, pitch: 0, bearing: 0 },
      onChapterEnter() {
        if (typeof map !== 'undefined') {
          config.hidePlannedCable(map);
          config.hideSpecialIncident(map);
          config.addIncidentMarkers(map);
        }
      },
      onChapterExit: map => {
        config.hidePlannedCable(map);
        config.hideSpecialIncident(map);
      }
    },
    {
      id: 'incident-matsu',
      title: 'The Matsu Islands Incident(s)',
      image: './data/Matsu.png',
      description: `<p>In February 2023, two undersea cables connecting Taiwan's Matsu Islands to China were severed. In 2025, the malfunction was attributed to natural degradation. The combination of gray zone activity and vulnerable geography continues to undermine security.</p>`,
      location: { center: [119.97, 26.15], zoom: 8.5, pitch: 45, bearing: 20 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.hideSpecialIncident(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-keelung',
      title: 'The TPE Cable Disruption (January 2025)',
      image: './data/Xingshun39.jpeg',
      description:`<p>On January 3, 2025, the Trans-Pacific Express cable system was damaged off Taiwan’s northeast coast. Suspected cause: a Tanzanian-flagged vessel. The incident highlights vulnerabilities far from shore.</p>`,
      location: { center: [122.3, 25.1], zoom: 7.5, pitch: 30, bearing: -10 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.showSpecialIncident(map); // show yellow highlight here
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hideSpecialIncident(map)
    },
    {
      id: 'incident-south',
      title: 'Taiwan - Penghu No. 3 Severed (February 2025)',
      image: './data/south_taiwan_incident.jpg',
      description:
        '<p>This marks the second time a foreign-flagged vessel crewed by Chinese nationals disrupted Taiwan’s undersea infrastructure. The Penghu No. 3 cable is a critical domestic link. In April 2025, the HongTai-58 captain was charged with intentional damage.</p>',
      location: { center: [121.0, 21.8], zoom: 8, pitch: 40, bearing: 15 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.hideSpecialIncident(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'conclusion',
      title: 'Moving Forward, What to Expect?',
      image: './data/focustaiwan.jpg',
      description: 'The cyan-colored line represents the new undersea cable, "Taiwan-Matsu No. 4," projected to be completed in 2026.',
      location: { center: [121.2, 25.7], zoom: 6.5, pitch: 0, bearing: 0 },
      onChapterEnter: map => {
        config.showPlannedCable(map);
        config.hideSpecialIncident(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.showPlannedCable(map)
    }
  ]
};

