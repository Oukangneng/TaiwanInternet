const config = {
    style: 'mapbox://styles/mapbox/dark-v11',
    accessToken: 'YOUR_MAPBOX_ACCESS_TOKEN',  
    showMarkers: false,
    theme: 'dark',
    alignment: 'left',
    footer: 'Tracking Taiwan Undersea Cable Incidents',
    chapters: [
        {
            id: 'intro',
            title: 'Tracking Taiwan’s Undersea Cable Incidents | By Owen OConnell',
            image: './data/taiwan_cables_map.jpg', 
            description: 'Taiwan relies on a network of undersea cables for internet connectivity. These cables are frequently damaged, with incidents often linked to Chinese vessels. This visualization highlights key incidents and their locations.<br><br>Sources: [TeleGeography](https://www2.telegeography.com), [Taiwan’s National Communications Commission](https://www.ncc.gov.tw/)',
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
            title: 'Matsu Cable 1 Incident',
            image: './data/matsu_incident.jpg',
            description: 'On February 2, 2023, a Chinese fishing vessel cut the Matsu Cable 1 near the Matsu Islands. This caused a major internet outage for the islands, lasting several weeks.',
            location: {
                center: [119.97, 26.15], 
                zoom: 10,
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
            description: 'On January 5, 2024, the APCN-2 cable was mysteriously severed near Keelung, Taiwan. The cause remains unknown. This cable is vital for Taiwan’s connection to global internet infrastructure.',
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
            description: 'In late 2024, a major cable disruption occurred south of Taiwan, cutting off connectivity to parts of Southeast Asia. Officials suspected intentional sabotage.',
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
            description: '<span style="font-size:24px">Taiwan’s undersea cables face growing threats, disrupting global internet traffic and raising security concerns.</span><br><br><span style="font-size:18px"><i>Learn More:</i></span><br><ul><li><a target="_blank" href="https://www2.telegeography.com">TeleGeography’s Submarine Cable Map</a></li><li><a target="_blank" href="https://www.ncc.gov.tw/">Taiwan’s National Communications Commission</a></li></ul>',
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
