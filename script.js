// Initialize the map
var map = L.map('map').setView([20, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Function to get color based on total goals
function getColor(goals) {
    return goals > 100 ? '#800026' :
           goals > 50  ? '#BD0026' :
           goals > 20  ? '#E31A1C' :
           goals > 10  ? '#FC4E2A' :
           goals > 5   ? '#FD8D3C' :
           goals > 0   ? '#FEB24C' :
                         '#FFEDA0';
}

// Assuming 'total_world_cup_goals_by_country.json' is the correct path
fetch('total_world_cup_goals_by_country.json')
    .then(response => response.json())
    .then(goalsData => {
        // Now that goalsData is loaded, load the GeoJSON and integrate
        fetch("countries.geojson")
            .then(response => response.json())
            .then(geoJsonData => {
                L.geoJson(geoJsonData, {
                    style: function(feature) {
                        var country = feature.properties.name;
                        var totalGoals = 0;
                        var countryData = goalsData.find(d => d.country === country);
                        if (countryData) {
                            totalGoals = countryData.total_goals;
                        }
                        return {
                            fillColor: getColor(totalGoals),
                            weight: 2,
                            opacity: 1,
                            color: 'white',
                            fillOpacity: 0.7
                        };
                    }
                }).addTo(map);
            });
    })
    .catch(error => console.error('Error loading the data:', error));
