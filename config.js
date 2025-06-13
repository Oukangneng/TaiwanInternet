const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'pk.eyJ1Ijoib3dlbm9jIiwiYSI6ImNtYm9mMjJpdzE2ZTYyaXE5Mmx2Yng5aHoifQ.ptuVPXZ7BVI4vsG1aY70Gw',
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',

    cablesGeoJSON: 'https://oukangneng.github.io/TaiwanInternet/data/Global_Submarine_Cables.geojson',
    redGeoJSON: 'https://oukangneng.github.io/TaiwanInternet/data/cable_incidents.geojson',

    chapters: [
        {
            id: 'intro',
            title: 'Monitoring Taiwans Subsea Internet Cable Incidents',
            image: './data/canvabargraph.png',
            description: 'This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)',
            location: {
                center: [120, 24],
                zoom: 7,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: function () {
                if (typeof map !== 'undefined') {
                    if (!map.getSource('cables')) {
                        map.addSource('cables', {
                            type: 'geojson',
                            data: config.cablesGeoJSON
                        });
                        map.addLayer({
                            id: 'cables-layer',
                            type: 'line',
                            source: 'cables',
                            paint: {
                                'line-color': '#ff5733',
                                'line-width': 2
                            }
                        });
                    }

                    if (!map.getSource('cable-incidents')) {
                        map.addSource('cable-incidents', {
                            type: 'vector',
                            url: 'mapbox://owenoc.740hanei'
                        });
                        map.addLayer({
                            id: 'cable-incidents-layer',
                            type: 'circle',
                            source: 'cable-incidents',
                            'source-layer': 'taiwan-cable-incidentx-d8tdes',
                            paint: {
                                'circle-radius': 8,
                                'circle-color': '#ff0000',
                                'circle-stroke-width': 2,
                                'circle-stroke-color': '#ffffff'
                            }
                        });

                        // Add a small delay to ensure layer is loaded
                        setTimeout(() => {
                            map.on('click', 'cable-incidents-layer', function (e) {
                                const props = e.features[0].properties;
                                const popupHTML = `
                                    <strong>${props.cable}</strong><br>
                                    <em>${props.date}</em><br>
                                    ${props.distance}<br>
                                    ${props.notes ? `<small>${props.notes}</small>` : ''}
                                `;
                                new mapboxgl.Popup()
                                    .setLngLat(e.lngLat)
                                    .setHTML(popupHTML)
                                    .addTo(map);
                            });

                            map.on('mouseenter', 'cable-incidents-layer', () => {
                                map.getCanvas().style.cursor = 'pointer';
                            });

                            map.on('mouseleave', 'cable-incidents-layer', () => {
                                map.getCanvas().style.cursor = '';
                            });
                        }, 1000);
                    }

                    // ✅ Only draw bar chart once
                    if (typeof drawBarChart === 'function' && !document.querySelector("#bar-chart g")) {
                        drawBarChart();
                    }
                }
            },
            onChapterExit: function () {
                if (typeof map !== 'undefined') {
                    if (map.getLayer('cables-layer')) {
                        map.removeLayer('cables-layer');
                    }
                    if (map.getSource('cables')) {
                        map.removeSource('cables');
                    }
                }
            }
        },

        {
            id: 'incident-matsu',
            title: 'The Matsu Islands Incident (Part 1 of 2)',
            image: './data/Matsu.png',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">
                    Photo from my visit to the Matsu Islands, showing the presence of Chinese fishermen illuminating the night sky from their boats (August 2023).
                </div>
                <p>In February 2023, two undersea cables were severed connecting Taiwan's Matsu Islands to China. This disruption led to internet shortages for weeks.</p>
            `,
            location: {
                center: [119.97, 26.15],
                zoom: 8.5,
                pitch: 45,
                bearing: 20
            },
            onChapterEnter: function () {},
            onChapterExit: function () {}
        },

        {
            id: 'incident-keelung',
            title: 'APCN-2 Cable Disruption near Keelung',
            image: './data/keelung_incident.jpg',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">
                    Photo showing the APCN-2 cable disruption near Keelung, Taiwan (January 2024).
                </div>
                <p>On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. The cause remains unknown. This cable is vital for Taiwan's connection to global internet infrastructure.</p>
            `,
            location: {
                center: [122.3, 25.1],
                zoom: 9,
                pitch: 30,
                bearing: -10
            },
            onChapterEnter: function () {},
            onChapterExit: function () {}
        },

        {
            id: 'incident-south',
            title: 'Disruption South of Taiwan',
            image: './data/south_taiwan_incident.jpg',
            description: `
                <div style="font-size: 0.85em; font-style: italic; color: #666; text-align: center; margin-top: 10px;">
                    Photo showing the location of the cable disruption south of Taiwan (Late 2024).
                </div>
                <p>In late 2024, a major cable disruption occurred south of Taiwan, cutting off connectivity to parts of Southeast Asia. Officials suspected intentional sabotage.</p>
            `,
            location: {
                center: [121.0, 21.8],
                zoom: 8,
                pitch: 40,
                bearing: 15
            },
            onChapterEnter: function () {},
            onChapterExit: function () {}
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
            onChapterEnter: function () {},
            onChapterExit: function () {}
        }
    ]
};
