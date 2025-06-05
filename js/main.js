// Stuff that has to happen after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        center: [42.27648680709905, -71.75747055885047],
        zoom: 18,
        zoomControl: false,
        attributionControl: false
    });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
    
    const compassArrow = document.getElementById('compass-arrow');
    function setCompassHeading(degrees) {
        degrees = ((degrees % 360) + 360) % 360;
        compassArrow.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
    }
    setCompassHeading(0);
    window.setCompassHeading = setCompassHeading;

    var websiteTelemetry = document.getElementById('website-telemetry');
    map.on("mousemove", (e) => { websiteTelemetry.innerText = `Lat: ${e.latlng.lat.toFixed(6)} Lng: ${e.latlng.lng.toFixed(6)}`; });

    
    let currentClickHandler = null;
    map.on("click", (e) => { if (currentClickHandler) { currentClickHandler(e); } });


    // WAYPOINTS -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    let waypointPolyline = null;
    let waypointCircles = [];
    function placeWaypoint(e) {
        var circle = L.circle(e.latlng, { radius: 10, color: 'green' }); // 10 meter radius that the boat will try to enter
        circle.addTo(map);
        waypointCircles.push(circle);

        if (waypointCircles.length > 1) {
            if (waypointPolyline) { map.removeLayer(waypointPolyline); }
            waypointPolyline = L.polyline(waypointCircles.map(c => c.getLatLng()), { color: 'green' }).addTo(map);
        }
    }
    document.getElementById('place-waypoint-button').addEventListener('click', () => { currentClickHandler = placeWaypoint; });
    document.getElementById('clear-waypoints-button').addEventListener('click', () => {
        if (waypointPolyline) { map.removeLayer(waypointPolyline); waypointPolyline = null; }
        waypointCircles.forEach(circle => map.removeLayer(circle));
        waypointCircles = [];
    });

    // BOUYS ------------------------------------------------------------------------------------------------------------------------------------------------------------------
    let buoyCircles = [];
    function placeBuoy(e) {
        var circle = L.circle(e.latlng, { radius: 5, color: 'red' }); // 5 meter radius that we really don't want to hit
        circle.addTo(map);
        buoyCircles.push(circle);
    }
    document.getElementById('place-buoys-button').addEventListener('click', () => { currentClickHandler = placeBuoy; });
    document.getElementById('clear-buoys-button').addEventListener('click', () => {
        buoyCircles.forEach(circle => map.removeLayer(circle));
        buoyCircles = [];
    });

    // RESTRICTED AREA --------------------------------------------------------------------------------------------------------------------------------------------------------
    let restrictedLatlngs = [
        // 4 points that make a square around the world so we can cut a hole in it
        [[90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180]],
        []
    ];
    let restrictedAreaPolygon = null;
    function placeRestrictedAreaPoint(e) {
        restrictedLatlngs[1].push(e.latlng);
        if (restrictedLatlngs[1].length > 2) {
            if (restrictedAreaPolygon) { map.removeLayer(restrictedAreaPolygon); }
            restrictedAreaPolygon = L.polygon(restrictedLatlngs, { color: 'red' }).addTo(map);
        }
    }
    document.getElementById('place-restricted-area-button').addEventListener('click', () => { currentClickHandler = placeRestrictedAreaPoint; });
    document.getElementById('clear-restricted-area-button').addEventListener('click', () => {
        restrictedLatlngs = [
            [[90, -180],
            [90, 180],
            [-90, 180],
            [-90, -180]],
            []
        ];
        if (restrictedAreaPolygon) { map.removeLayer(restrictedAreaPolygon); }
    });

    // OTHER BUTTONS ----------------------------------------------------------------------------------------------------------------------------------------------------------
    document.getElementById('enter-coordinates-button').addEventListener('click', () => {
        const lat = parseFloat(prompt("Enter latitude:"));
        const lng = parseFloat(prompt("Enter longitude:"));
        if (!isNaN(lat) && !isNaN(lng)) {
            const latlng = L.latLng(lat, lng);
            map.setView(latlng, 18);
            if (currentClickHandler) { currentClickHandler({ latlng }); }
        } else {
            alert("Invalid coordinates entered.");
        }
    });
    document.getElementById('export-waypoints-button').addEventListener('click', () => {
        // Export as json to file
    });
    document.getElementById('import-waypoints-button').addEventListener('click', () => {
        // Import from json file
    });
});