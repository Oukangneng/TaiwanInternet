const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtNnh0aHNsODB5ZjcyanE4NTYwMjRrZDcifQ.jIUeVxkI7mayEkFCKHcgKw',  
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',

    cablesGeoJSON: './data/Global_Submarine_Cables.geojson',
    **incidentsGeoJSON: './data/cable_incidents.geojson',** // ✅ ADD this line

    chapters: [
        {
            id: 'intro',
            title: 'Monitoring Taiwan’s Subsea Internet Cable Incidents',
            image: './data/taiwan_cables_map.jpg',
            description: 'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)',
            location: {
                center: [121.5, 23.5],
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: function() {
                if (!map.getSource('cables')) {
                    map.addSource('cables', {
                        'type': 'geojson',
                        'data': config.cablesGeoJSON
                    });

                    map.addLayer({
                        'id': 'cables-layer',
                        'type': 'line',
                        'source': 'cables',
                        'paint': {
                            'line-color': '#ff5733',
                            'line-width': 2
                        }
                    });
                }
            },
            onChapterExit: function() {
                if (map.getLayer('cables-layer')) {
                    map.removeLayer('cables-layer');
                    map.removeSource('cables');
                }
            }
        },

        {
            id: 'incident-south',
            title: 'Disruption South of Taiwan',
            image: './data/south_taiwan_incident.jpg',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">Photo showing the location of the cable disruption south of Taiwan (Late 2024).</div>
                <p>In late 2024, a major cable disruption occurred south of Taiwan, cutting off connectivity to parts of Southeast Asia. Officials suspected intentional sabotage.</p>
            `,
            location: {
                center: [121.0, 21.8],
                zoom: 8,
                pitch: 40,
                bearing: 15
            },
            onChapterEnter: function () {
                // ✅ ADD these lines
                if (!map.getSource('cable-incidents')) {
                    map.addSource('cable-incidents', {
                        'type': 'geojson',
                        'data': config.incidentsGeoJSON
                    });

                    map.addLayer({
                        'id': 'cable-incidents-layer',
                        'type': 'line',
                        'source': 'cable-incidents',
                        'paint': {
                            'line-color': '#00ffff',
                            'line-width': 3
                        }
                    });
                }
            },
            onChapterExit: function () {
                // ✅ REMOVE the layer and source on exit
                if (map.getLayer('cable-incidents-layer')) {
                    map.removeLayer('cable-incidents-layer');
                    map.removeSource('cable-incidents');
                }
            }
        },

        {
            id: 'conclusion',
            title: 'Conclusion',
            description: 'In conclusion, Taiwan\'s undersea cables are vital for global communication and must be secured.',
            location: {
                center: [121.5, 23.5],
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: [],
            onChapterExit: []
        }
    ]
};
