const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtNnh0aHNsODB5ZjcyanE4NTYwMjRrZDcifQ.jIUeVxkI7mayEkFCKHcgKw',
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',

    // Path to the GeoJSON files
    cablesGeoJSON: './data/Global_Submarine_Cables.geojson',
    incidentsGeoJSON: './data/cable_incidents.geojson',

    chapters: [
        {
            id: 'intro',
            title: 'Monitoring Taiwan's Subsea Internet Cable Incidents',
            image: './data/taiwan_cables_map.jpg',
            description: 'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)',
            location: {
                center: [121.5, 23.5],
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: function() {
                // Check if map is loaded before adding sources
                if (!map.isStyleLoaded()) {
                    map.once('styleload', () => {
                        addCablesAndIncidents();
                    });
                } else {
                    addCablesAndIncidents();
                }

                function addCablesAndIncidents() {
                    // Add cables layer if not exists
                    if (!map.getSource('cables')) {
                        // Use fetch to load and validate GeoJSON
                        fetch(config.cablesGeoJSON)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Validate GeoJSON structure
                                if (!data.type || data.type !== 'FeatureCollection') {
                                    console.warn('Cables GeoJSON may not be properly formatted');
                                }
                                
                                map.addSource('cables', {
                                    'type': 'geojson',
                                    'data': data
                                });
                                
                                map.addLayer({
                                    'id': 'cables-layer',
                                    'type': 'line',
                                    'source': 'cables',
                                    'paint': {
                                        'line-color': '#ff5733',
                                        'line-width': 2,
                                        'line-opacity': 0.8
                                    }
                                });
                            })
                            .catch(error => {
                                console.error('Error loading cables GeoJSON:', error);
                                // Fallback: try to add empty source to prevent errors
                                if (!map.getSource('cables')) {
                                    map.addSource('cables', {
                                        'type': 'geojson',
                                        'data': {
                                            'type': 'FeatureCollection',
                                            'features': []
                                        }
                                    });
                                }
                            });
                    }

                    // Add cable incidents layer if not exists
                    if (!map.getSource('cable-incidents')) {
                        fetch(config.incidentsGeoJSON)
                            .then(response => {
                                if (!response.ok) {
                                    throw new Error(`HTTP error! status: ${response.status}`);
                                }
                                return response.json();
                            })
                            .then(data => {
                                // Validate GeoJSON structure
                                if (!data.type || data.type !== 'FeatureCollection') {
                                    console.warn('Incidents GeoJSON may not be properly formatted');
                                }
                                
                                map.addSource('cable-incidents', {
                                    'type': 'geojson',
                                    'data': data
                                });
                                
                                map.addLayer({
                                    'id': 'cable-incidents-layer',
                                    'type': 'circle',
                                    'source': 'cable-incidents',
                                    'paint': {
                                        'circle-radius': 8,
                                        'circle-color': '#00ffff',
                                        'circle-stroke-width': 2,
                                        'circle-stroke-color': '#ffffff',
                                        'circle-opacity': 0.9
                                    }
                                });

                                // Add popup on click for incidents
                                map.on('click', 'cable-incidents-layer', (e) => {
                                    const coordinates = e.features[0].geometry.coordinates.slice();
                                    const properties = e.features[0].properties;
                                    
                                    // Ensure popup appears over the point
                                    while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
                                        coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
                                    }
                                    
                                    new mapboxgl.Popup()
                                        .setLngLat(coordinates)
                                        .setHTML(`
                                            <div style="max-width: 200px;">
                                                <h4>Cable Incident</h4>
                                                <p><strong>Date:</strong> ${properties.date || 'Unknown'}</p>
                                                <p><strong>Location:</strong> ${properties.location || 'Unknown'}</p>
                                                <p><strong>Details:</strong> ${properties.description || 'No details available'}</p>
                                            </div>
                                        `)
                                        .addTo(map);
                                });

                                // Change cursor on hover
                                map.on('mouseenter', 'cable-incidents-layer', () => {
                                    map.getCanvas().style.cursor = 'pointer';
                                });

                                map.on('mouseleave', 'cable-incidents-layer', () => {
                                    map.getCanvas().style.cursor = '';
                                });
                            })
                            .catch(error => {
                                console.error('Error loading incidents GeoJSON:', error);
                                // Fallback: try to add empty source to prevent errors
                                if (!map.getSource('cable-incidents')) {
                                    map.addSource('cable-incidents', {
                                        'type': 'geojson',
                                        'data': {
                                            'type': 'FeatureCollection',
                                            'features': []
                                        }
                                    });
                                }
                            });
                    }
                }
            },
            onChapterExit: function() {
                // Remove cables layer on exit
                if (map.getLayer('cables-layer')) {
                    map.removeLayer('cables-layer');
                }
                if (map.getSource('cables')) {
                    map.removeSource('cables');
                }
                // Keep cable incidents layer persistent as intended
            }
        },
        {
            id: 'incident-matsu',
            title: 'The Matsu Islands Incident (Part 1 of 2)',
            image: './data/Matsu.png',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">Photo from my visit to the Matsu Islands, showing the presence of Chinese fishermen illuminating the night sky from their boats (August 2023).</div>
                <p>In February 2023, two undersea cables were severed connecting Taiwan's Matsu Islands to China. This disruption led to internet shortages for weeks.</p>
            `,
            location: {
                center: [119.97, 26.15],
                zoom: 9.5,
                pitch: 45,
                bearing: 20
            },
            onChapterEnter: function() {
                // Highlight specific incident if exists
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', [
                        'case',
                        ['==', ['get', 'location'], 'Matsu Islands'],
                        '#ff0000', // Red for highlighted incident
                        '#00ffff'  // Default cyan
                    ]);
                }
            },
            onChapterExit: function() {
                // Reset incident colors
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', '#00ffff');
                }
            }
        },
        {
            id: 'incident-keelung',
            title: 'APCN-2 Cable Disruption near Keelung',
            image: './data/keelung_incident.jpg',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">Photo showing the APCN-2 cable disruption near Keelung, Taiwan (January 2024).</div>
                <p>On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. The cause remains unknown. This cable is vital for Taiwan's connection to global internet infrastructure.</p>
            `,
            location: {
                center: [122.3, 25.1],
                zoom: 10.5,
                pitch: 30,
                bearing: -10
            },
            onChapterEnter: function() {
                // Highlight Keelung incident
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', [
                        'case',
                        ['==', ['get', 'location'], 'Keelung'],
                        '#ff0000', // Red for highlighted incident
                        '#00ffff'  // Default cyan
                    ]);
                }
            },
            onChapterExit: function() {
                // Reset incident colors
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', '#00ffff');
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
            onChapterEnter: function() {
                // Highlight southern Taiwan incident
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', [
                        'case',
                        ['==', ['get', 'location'], 'South Taiwan'],
                        '#ff0000', // Red for highlighted incident
                        '#00ffff'  // Default cyan
                    ]);
                }
            },
            onChapterExit: function() {
                // Reset incident colors
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', '#00ffff');
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
            onChapterEnter: function() {
                // Show all incidents with equal prominence
                if (map.getLayer('cable-incidents-layer')) {
                    map.setPaintProperty('cable-incidents-layer', 'circle-color', '#00ffff');
                    map.setPaintProperty('cable-incidents-layer', 'circle-radius', 8);
                }
            },
            onChapterExit: []
        }
    ]
};
