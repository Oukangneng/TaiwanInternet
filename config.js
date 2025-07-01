/* ---------- config.js (revised) ---------- */
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
  },

  /**
   * Fetch the incident GeoJSON and add red circle markers with popups
   * using mapboxgl.Marker instances.
   */
  addIncidentMarkers(map) {
    // Clear any existing markers first (optional, if you want to update dynamically)
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

          // Build popup HTML, adjust property names as needed
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
      console.warn('planned-cable layer missing – re-adding');
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
      title: 'Monitoring Taiwan’s Undersea Cable Incidents in 2025',
      image: './data/canvabargraph.png',
      description:
        'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)',
      location: { center: [120, 24], zoom: 7, pitch: 0, bearing: 0 },
      onChapterEnter() {
        if (typeof map !== 'undefined') {
          if (typeof drawBarChart === 'function' && !document.querySelector('#bar-chart g')) {
            drawBarChart();
          }
          config.hidePlannedCable(map);
          config.addIncidentMarkers(map);
        }
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-matsu',
      title: 'The Matsu Islands Incident (Part 1 of 2)',
      image: './data/Matsu.png',
      description:
        '<div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">Photo from my visit to the Matsu Islands, showing the presence of Chinese fishermen illuminating the night sky from their boats (August 2023).</div><p>In February 2023, two undersea cables were severed connecting Taiwan\'s Matsu Islands to China. This disruption led to internet shortages for weeks.</p>',
      location: { center: [119.97, 26.15], zoom: 8.5, pitch: 45, bearing: 20 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-keelung',
      title: 'APCN-2 Cable Disruption near Keelung',
      image: './data/keelung_incident.jpg',
      description:
        '<div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">Photo showing the APCN-2 cable disruption near Keelung, Taiwan (January 2024).</div><p>On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. The cause remains unknown. This cable is vital for Taiwan’s connection to global internet infrastructure.</p>',
      location: { center: [122.3, 25.1], zoom: 9, pitch: 30, bearing: -10 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-south',
      title: 'Disruption South of Taiwan',
      image: './data/south_taiwan_incident.jpg',
      description:
        '<div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">Photo showing the location of the cable disruption south of Taiwan (Late 2024).</div><p>In late 2024, a major cable disruption...</p>',
      location: { center: [121.0, 21.8], zoom: 8, pitch: 40, bearing: 15 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'conclusion',
      title: 'Moving Forward, What to Expect?',
      image: './data/focustaiwan.jpg',
      description: 'The cyan-colored line represents the new undersea cable, "Taiwan-Matsu No. 4," which is projected to be completed in 2026. This cable will link Dongyin Island with Bali in New Taipei. Chunghwa Telecom stated that the cable will be protected by plastic or metal tubes and will avoid busy fishing grounds.',
      location: { center: [121.2, 25.7], zoom: 6.5, pitch: 0, bearing: 0 },
      onChapterEnter: map => {
        config.showPlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.showPlannedCable(map)
    }
  ]
};

