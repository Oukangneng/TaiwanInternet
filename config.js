const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtNnh0aHNsODB5ZjcyanE4NTYwMjRrZDcifQ.jIUeVxkI7mayEkFCKHcgKw',  
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',
    
    // Path to the GeoJSON file
    cablesGeoJSON: './data/Global_Submarine_Cables.geojson',  

    chapters: [
        {
            id: 'intro',
            title: 'Tracking Taiwan’s Undersea Cable Incidents',
            image: './data/taiwan_cables_map.jpg', 
            description: 'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline) ',
            location: {
                center: [121.5, 23.5], 
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: function() {
                // Add the cables layer to the map when this chapter is entered
                map.on('load', function() {
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
                });
            },
            onChapterExit: function() {
                // Optionally remove the cables layer when exiting this chapter
                map.removeLayer('cables-layer');
                map.removeSource('cables');
            }
        },
        {
            id: 'incident-matsu',
            title: 'Matsu Cable 1 Incident',
            image: './data/matsu_incident.jpg',
            description: 'In February 2023, two underseas cables were severed connecting Taiwan's Matsu Islands to China. This disruption lead to internet shortages for weeks.',
            location: {
                center: [119.97, 26.15], 
                zoom: 9.5,
                pitch: 45,
                bearing: 20
            },
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'incident-keelung',
            title: 'APCN-2 Cable Disruption near Keelung',
            image: './data/keelung_incident.jpg',
            description: `
                On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. 
                The cause remains unknown. This cable is vital for Taiwan’s connection to global internet infrastructure.
            `,
            location: {
                center: [122.3, 25.1], 
                zoom: 11,
                pitch: 30,
                bearing: -10
            },
            onChapterEnter: [],
            onChapterExit: []
        },
        {
            id: 'incident-south',
            title: 'Disruption South of Taiwan',
            image: './data/south_taiwan_incident.jpg',
            description: `
                In late 2024, a major cable disruption occurred south of Taiwan, cutting off connectivity to parts of Southeast Asia. 
                Officials suspected intentional sabotage.
            `,
            location: {
                center: [121.0, 21.8],  
                zoom: 8,
                pitch: 40,
                bearing: 15
            },
            onChapterEnter: [],
            onChapterExit: []
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
