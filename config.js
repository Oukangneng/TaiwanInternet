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
            title: 'Monitoring Taiwan’s Subsea Internet Cable Incidents',
            image: './data/taiwan_cables_map.jpg',
            description: `
                <p>This visual timeline will guide you through incidents of undersea cables being severed between Taiwan and other regions. (Scroll ⤓ to begin exploring the timeline)</p>
                <div id="bar-chart-container" style="width: 100%; height: 500px; margin: 30px 0; background: #111;"></div>
            `,
            location: {
                center: [121.5, 23.5],
                zoom: 6,
                pitch: 0,
                bearing: 0
            },
            onChapterEnter: function() {
                // Load the GeoJSON cables if not already loaded
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

                // D3 Bar Chart Rendering Logic
                const container = document.querySelector('#bar-chart-container');
                if (container) {
                    container.innerHTML = '';  // Clear existing chart if any

                    const data = [
                        { year: "2015", incidents: 5 },
                        { year: "2016", incidents: 7 },
                        { year: "2017", incidents: 4 },
                        { year: "2018", incidents: 6 },
                        { year: "2019", incidents: 9 },
                        { year: "2020", incidents: 11 },
                        { year: "2021", incidents: 8 },
                        { year: "2022", incidents: 13 },
                        { year: "2023", incidents: 15 }
                    ];

                    const width = container.clientWidth;
                    const height = 500;
                    const margin = { top: 20, right: 30, bottom: 40, left: 60 };

                    const svg = d3.select("#bar-chart-container")
                        .append("svg")
                        .attr("width", width)
                        .attr("height", height)
                        .append("g")
                        .attr("transform", `translate(${margin.left},${margin.top})`);

                    const x = d3.scaleBand()
                        .domain(data.map(d => d.year))
                        .range([0, width - margin.left - margin.right])
                        .padding(0.1);

                    const y = d3.scaleLinear()
                        .domain([0, d3.max(data, d => d.incidents)])
                        .nice()
                        .range([height - margin.top - margin.bottom, 0]);

                    // Add bars with animation
                    svg.append("g")
                        .selectAll("rect")
                        .data(data)
                        .enter().append("rect")
                        .attr("x", d => x(d.year))
                        .attr("y", d => y(0))
                        .attr("width", x.bandwidth())
                        .attr("height", 0)
                        .attr("fill", "#1da1f2")
                        .transition()
                        .duration(800)
                        .attr("y", d => y(d.incidents))
                        .attr("height", d => height - margin.top - margin.bottom - y(d.incidents));

                    // Add axes
                    svg.append("g")
                        .call(d3.axisLeft(y));

                    svg.append("g")
                        .attr("transform", `translate(0,${height - margin.bottom})`)
                        .call(d3.axisBottom(x));
                }
            },
            onChapterExit: function() {
                // Clean up the chart when exiting the chapter
                const container = document.querySelector('#bar-chart-container');
                if (container) {
                    container.innerHTML = '';
                }
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
            onChapterEnter: [],
            onChapterExit: []
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
