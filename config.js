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
          visibility: 'none', // hidden until toggled
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

  /* ---------- PULSE ANIMATION HELPERS ---------- */
  // Pulse animation variables stored here for clean removal
  _pulseAnimationId: null,
  _pulseStart: null,

  addPulse(map) {
    if (map.getSource('pin-point')) return; // Already added

    map.addSource('pin-point', {
      'type': 'geojson',
      'data': {
        'type': 'FeatureCollection',
        'features': [{
          'type': 'Feature',
          'geometry': {
            'type': 'Point',
            'coordinates': [122.3, 25.1] // TPE Cable Disruption coordinate
          }
        }]
      }
    });

    map.addLayer({
      'id': 'pin-inner',
      'type': 'circle',
      'source': 'pin-point',
      'paint': {
        'circle-radius': 6,
        'circle-color': '#ff0000',
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
        'circle-opacity': 1
      }
    });

    map.addLayer({
      'id': 'pin-pulse1',
      'type': 'circle',
      'source': 'pin-point',
      'paint': {
        'circle-radius': 6,
        'circle-color': '#ff0000',
        'circle-opacity': 0.4
      }
    });

    map.addLayer({
      'id': 'pin-pulse2',
      'type': 'circle',
      'source': 'pin-point',
      'paint': {
        'circle-radius': 6,
        'circle-color': '#ff0000',
        'circle-opacity': 0.4
      }
    });

    this._pulseStart = null;

    const animate = timestamp => {
      if (!this._pulseStart) this._pulseStart = timestamp;
      const cycle = 1200; // ms per pulse
      const t = (timestamp - this._pulseStart) % cycle;

      const progress1 = t / cycle;
      const radius1 = 6 + progress1 * 24;
      const opacity1 = 0.4 * (1 - progress1);

      const progress2 = ((t + cycle / 2) % cycle) / cycle;
      const radius2 = 6 + progress2 * 24;
      const opacity2 = 0.4 * (1 - progress2);

      if (map.getLayer('pin-pulse1')) {
        map.setPaintProperty('pin-pulse1', 'circle-radius', radius1);
        map.setPaintProperty('pin-pulse1', 'circle-opacity', opacity1);
      }
      if (map.getLayer('pin-pulse2')) {
        map.setPaintProperty('pin-pulse2', 'circle-radius', radius2);
        map.setPaintProperty('pin-pulse2', 'circle-opacity', opacity2);
      }

      this._pulseAnimationId = requestAnimationFrame(animate);
    };

    this._pulseAnimationId = requestAnimationFrame(animate);
  },

  removePulse(map) {
    if (this._pulseAnimationId) {
      cancelAnimationFrame(this._pulseAnimationId);
      this._pulseAnimationId = null;
      this._pulseStart = null;
    }
    ['pin-inner', 'pin-pulse1', 'pin-pulse2'].forEach(layer => {
      if (map.getLayer(layer)) map.removeLayer(layer);
    });
    if (map.getSource('pin-point')) map.removeSource('pin-point');
  },

  /* ---------- CHAPTERS ---------- */
  chapters: [
    {
      id: 'intro',
      title: 'Monitoring Taiwan’s Undersea Cable Incidents in 2025 | By Owen OConnell',
      subtitle: 'A visual timeline of cable malfunctions disrupting Taiwan’s internet connections in 2025.',
      image: './data/canvabargraph.png',
      description:`Taiwan’s digital lifelines are under growing pressure. In 2025 alone, multiple undersea cables connecting the island to the world were cut, degraded, or sabotaged—disrupting communications and exposing deep vulnerabilities. <br><br> This visual tracker guides you through undersea cable disruptions between Taiwan and other regions in 2025. Each red circle marks a reported malfunction—click on a circle to view details about the incident. (Scroll ⤓ to begin exploring.)
    <br><br>
    <small>Sources:</small>
  `,
      location: { center: [120, 24], zoom: 7, pitch: 0, bearing: 0 },
      onChapterEnter(map) {
        if (typeof map !== 'undefined') {
          if (typeof drawBarChart === 'function' && !document.querySelector('#bar-chart g')) {
            drawBarChart();
          }
          config.hidePlannedCable(map);
          config.addIncidentMarkers(map);
        }
      },
      onChapterExit(map) {
        config.hidePlannedCable(map);
      }
    },
    {
      id: 'incident-matsu',
      title: 'The Matsu Islands Incident(s)',
      image: './data/Matsu.png',
      description: `
  <div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">
    Photo from my visit to the Matsu Islands, showing the presence of Chinese fishermen illuminating the night sky from their boats (August 2023).
  </div>
  <p>In February 2023, two undersea cables connecting Taiwan's Matsu Islands to China were severed, leaving some of the islands' 14,000 residents without internet access for up to 51 days.</p>
  <p>The area around the Matsu Islands remains a hotspot of activity. However, unlike the incident two years ago, the 2025 cable malfunction was attributed to natural degradation. Earthquakes, turbidity currents, and seabed erosion are all major contributing factors.</p>
  <p>It's important to note the combination of frequent "gray zone" activities and the region’s vulnerable geography continues to undermine Taiwan’s internet security in this area.</p>
`,
      location: { center: [119.97, 26.15], zoom: 8.5, pitch: 45, bearing: 20 },
      onChapterEnter(map) {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit(map) {
        config.hidePlannedCable(map);
      }
    },
    {
      id: 'incident-keelung',
      title: 'The TPE Cable Disruption (January 2025)',
      image: './data/Xingshun39.jpeg',
      description:`
    <div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">
     This image shows the Xingshun 39, a general cargo ship (source: VesselFinder).
    </div>
    <p>On January 3, 2025, the Trans-Pacific Express (TPE) cable system—Taiwan’s high-capacity digital link to the United States and Asia—was damaged in waters about 68 kilometers off Taiwan’s northeast coast.</p>
    <p>The cause was suspected to be a vessel flying a Tanzanian flag, the <i>XingShun 39</i>. This incident, reported by the New York Times and Taiwan’s Ministry of Digital Affairs, underscores how foreign-flagged ships can threaten critical infrastructure under ambiguous circumstances.</p>
    <p>With cable breaks like this happening far from shore and outside Taiwan’s direct jurisdiction, repair efforts are costly, slow, and diplomatically sensitive.</p>
  `,
      location: { center: [122.3, 25.1], zoom: 7.5, pitch: 30, bearing: -10 },
      onChapterEnter(map) {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
        config.addPulse(map);  // <-- Add pulse here!
      },
      onChapterExit(map) {
        config.hidePlannedCable(map);
        config.removePulse(map);  // <-- Remove pulse here!
      }
    },
    {
      id: 'incident-south',
      title: 'Taiwan - Penghu No. 3 Severed (February 2025)',
      image: './data/south_taiwan_incident.jpg',
      description:
        '<div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">Photo showing the location of the cable disruption south of Taiwan.</div><p>This incident marks the second time a foreign-flagged vessel crewed by Chinese nationals has caused a disruption to Taiwan’s undersea infrastructure. It raises serious concerns about plausible deniability, flags of convenience, and the possibility of China’s indirect involvement in these disruptions. The Penghu No. 3 cable is a critical domestic link, and this event reflects a broader pattern of escalating gray-zone pressure on Taiwan’s communications network.</p>In April 2025, it was reported that Taiwanese authorities charged the <em>HongTai‑58</em> captain with intentional subsea‑cable damage.</p>',
      location: { center: [121.0, 21.8], zoom: 8, pitch: 40, bearing: 15 },
      onChapterEnter(map) {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit(map) {
        config.hidePlannedCable(map);
      }
    },
    {
      id: 'conclusion',
      title: 'Moving Forward, What to Expect?',
      image: './data/focustaiwan.jpg',
      description: 'The cyan-colored line represents the new undersea cable, "Taiwan-Matsu No. 4," which is projected to be completed in 2026. This cable will link Dongyin Island with Bali in New Taipei. Chunghwa Telecom stated that the cable will be protected by plastic or metal tubes and will avoid busy fishing grounds.',
      location: { center: [121.2, 25.7], zoom: 6.5, pitch: 0, bearing: 0 },
      onChapterEnter(map) {
        config.showPlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit(map) {
        config.showPlannedCable(map);
      }
    }
  ]
};
