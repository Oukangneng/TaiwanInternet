const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtNnh0aHNsODB5ZjcyanE4NTYwMjRrZDcifQ.jIUeVxkI7mayEkFCKHcgKw',  
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',

    // Path to the GeoJSON files
    cablesGeoJSON: './data/Global_Submarine_Cables.geojson',
    matsuGeoJSON: './data/matsu.geojson',  // Assuming this is the correct lowercase path

    chapters: [
        {
            id: 'intro',
            title: 'Monitoring Taiwan’s Subsea Internet Cable Incidents', 
            description: 'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)',
            location: {
                center: [121.5, 23.5],
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: [],
            onChapterExit: []
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
                // ✅ Add Matsu glow effect only on entering this chapter
                if (!map.getSource('matsu')) {
                    console.log("Adding Matsu source");
                    map.addSource('matsu', {
                        'type': 'geojson',
                        'data': config.matsuGeoJSON
                    });

                    // Highlight fill layer
                    map.addLayer({
                        'id': 'matsu-highlight',
                        'type': 'fill',
                        'source': 'matsu',
                        'paint': {
                            'fill-color': '#FFD700',      // Gold fill
                            'fill-opacity': 0.6,
                            'fill-outline-color': '#FF4500'  // Border color
                        }
                    });

                    // ✅ Add glow layer
                    map.addLayer({
                        'id': 'matsu-glow',
                        'type': 'circle',
                        'source': 'matsu',
                        'paint': {
                            'circle-radius': 20,
                            'circle-color': '#FFD700',     // Gold glow
                            'circle-opacity': 0.7,
                            'circle-blur': 1.5,
                            'circle-stroke-width': 2,
                            'circle-stroke-color': '#FF4500',
                            'circle-stroke-opacity': 0.9
                        }
                    });

                    // ✅ Add pulsing animation
                    let radius = 20;
                    let growing = true;

                    window.matsuGlowInterval = setInterval(() => {
                        radius = growing ? radius + 1 : radius - 1;
                        if (radius >= 30) growing = false;
                        if (radius <= 20) growing = true;

                        map.setPaintProperty('matsu-glow', 'circle-radius', radius);
                    }, 100);  // Animation speed
                }
            },
            onChapterExit: function() {
                // ✅ Remove glow effect when leaving this chapter
                if (map.getLayer('matsu-highlight')) {
                    map.removeLayer('matsu-highlight');
                }
                if (map.getLayer('matsu-glow')) {
                    map.removeLayer('matsu-glow');
                }
                if (map.getSource('matsu')) {
                    map.removeSource('matsu');
                }

                // ✅ Clear the animation interval
                if (window.matsuGlowInterval) {
                    clearInterval(window.matsuGlowInterval);
                }
            }
        },
        {
            id: 'incident-keelung',
            title: 'APCN-2 Cable Disruption near Keelung',
            image: './data/keelung_incident.jpg',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">Photo showing the APCN-2 cable disruption near Keelung, Taiwan (January 2024).</div>
                <p>On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. The cause remains unknown. This cable is vital for Taiwan’s connection to global internet infrastructure.</p>
            `,
            location: {
                center: [122.3, 25.1],
                zoom: 10.5,
                pitch: 30,
                bearing: -10
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
