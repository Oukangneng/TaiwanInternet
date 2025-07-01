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
      subtitle: 'A visual timeline of cable malfunctions disrupting Taiwan’s internet connections in 2025.',
      image: './data/canvabargraph.png',
      description:`This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)
    <br><br>
    <small>This dataset was compiled using primary sources from the Taipei Fisheries Agency (Chinese) and the Ministry of Digital Affairs (English), supplemented by secondary sources including media reports from Chunghwa Telecom and reputable news outlets such as the Taipei Times, Focus Taiwan, Taiwan News, and the New York Times.</small>
  `,
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
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-keelung',
      title: 'The TPE Cable Disruption (January 2025)',
      image: './data/keelung_incident.jpg',
      description:`
    <div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">
      Map shows the approximate location of the TPE cable break, roughly 68 kilometers northeast of Taiwan.
    </div>
    <p>On January 3, 2025, the Trans-Pacific Express (TPE) cable system—Taiwan’s high-capacity digital link to the United States and Asia—was damaged in waters about 68 kilometers off Taiwan’s northeast coast.</p>
    <p>The cause was suspected to be a vessel flying a Tanzanian flag, the <i>XingShun 39</i>. This incident, reported by the New York Times and Taiwan’s Ministry of Digital Affairs, underscores how foreign-flagged ships can threaten critical infrastructure under ambiguous circumstances.</p>
    <p>With cable breaks like this happening far from shore and outside Taiwan’s direct jurisdiction, repair efforts are costly, slow, and diplomatically sensitive.</p>
  `,
      location: { center: [122.3, 25.1], zoom: 7.5, pitch: 30, bearing: -10 },
      onChapterEnter: map => {
        config.hidePlannedCable(map);
        config.addIncidentMarkers(map);
      },
      onChapterExit: map => config.hidePlannedCable(map)
    },
    {
      id: 'incident-south',
      title: 'Taiwan - Penghu No. 3 Severed (February 2025)',
      image: './data/south_taiwan_incident.jpg',
      description:
        '<div style="font-size:0.85em;font-style:italic;color:#666;text-align:center;margin-top:10px;">Photo showing the location of the cable disruption south of Taiwan.</div><p>This incident marks the second time a foreign-flagged vessel crewed by Chinese nationals has caused a disruption to Taiwan’s undersea infrastructure. It raises serious concerns about plausible deniability, flags of convenience, and the possibility of China’s indirect involvement in these disruptions. The Penghu No. 3 cable is a critical domestic link, and this event reflects a broader pattern of escalating gray-zone pressure on Taiwan’s communications network.</p>p style="margin-top:1em;">In April 2025, it was reported that Taiwanese authorities charged the <em>HongTai‑58</em> captain with intentional subsea‑cable damage.</p>',
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

