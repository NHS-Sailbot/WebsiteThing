// Stuff that has to happen after the DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    var map = L.map('map', {
        center: [42.27648680709905, -71.75747055885047],
        zoom: 18,
        zoomControl: false,
        attributionControl: false
    });
    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);
    
    var boatIcon = L.icon({
        iconUrl: 'images/boat.png',
        iconSize: [50, 50],
        iconAnchor: [25, 25],
        popupAnchor: [0, -25]
    });

    var isFollowingBoat = false;
    var boat = L.marker([42.27648680709905, -71.75747055885047], { icon: boatIcon }).addTo(map);
    function moveBoat(lat, lng, heading) {
        var visualHeading = heading - 90; // the boat image is rotated 90 degrees in the image, 0/360 is north
        boat.setLatLng([lat, lng]);
        boat.setRotationAngle(visualHeading);
        if (isFollowingBoat) { map.setView([lat, lng]); }
    }
    window.moveBoat = moveBoat;

    var compassWindArrow = document.getElementById('compass-wind-arrow');
    function setWindCompass(degrees) {
        degrees = ((degrees % 360) + 360) % 360;
        compassWindArrow.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
    }
    setWindCompass(0);
    window.setWindCompass = setWindCompass;

    var compassHeadingArrow = document.getElementById('compass-heading-arrow');
    function setHeadingCompass(degrees) {
        degrees = ((degrees % 360) + 360) % 360;
        compassHeadingArrow.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
    }
    setHeadingCompass(0);
    window.setHeadingCompass = setHeadingCompass;

    var websiteTelemetry = document.getElementById('website-telemetry');
    map.on("mousemove", (e) => { websiteTelemetry.innerText = `Lat: ${e.latlng.lat.toFixed(6)} Lng: ${e.latlng.lng.toFixed(6)}`; });

    
    var currentClickHandler = null;
    map.on("click", (e) => { if (currentClickHandler) { currentClickHandler(e); } });


    // WAYPOINTS -----------------------------------------------------------------------------------------------------------------------------------------------------------------
    var waypointPolyline = null;
    var waypointCircles = [];
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
    var buoyCircles = [];
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
    var restrictedLatlngs = [
        // 4 points that make a square around the world so we can cut a hole in it
        [[90, -180],
        [90, 180],
        [-90, 180],
        [-90, -180]],
        []
    ];
    var restrictedAreaPolygon = null;
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
    document.getElementById('export-button').addEventListener('click', () => {
        var objectToExport = {
            waypoints: waypointCircles.map(circle => ({
            lat: circle.getLatLng().lat,
            lng: circle.getLatLng().lng
            })),
            buoys: buoyCircles.map(circle => ({
            lat: circle.getLatLng().lat,
            lng: circle.getLatLng().lng
            })),
            restrictedArea: restrictedLatlngs[1].map(latlng => ({
                lat: latlng.lat,
                lng: latlng.lng
            }))
        };
        var data = JSON.stringify(objectToExport, null, 2);
        var blob = new Blob([data], { type: 'application/json' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = 'waypoints.json';
        a.click();
        URL.revokeObjectURL(url);
        a.remove();
        
        navigator.clipboard.writeText(data).catch(err => {
            console.error('Failed to copy: ', err);
            alert("Failed to copy waypoints to clipboard.");
        });
    });
    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('clear-waypoints-button').click();
        document.getElementById('clear-buoys-button').click();
        document.getElementById('clear-restricted-area-button').click();
        
        // Import from json file
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json';
        input.onchange = function(event) {
            var file = event.target.files[0];
            if (file) {
                var reader = new FileReader();
                reader.onload = function(e) {
                    try {
                        var data = JSON.parse(e.target.result);
                        if (data.waypoints) {
                            data.waypoints.forEach(wp => {
                                var latlng = L.latLng(wp.lat, wp.lng);
                                placeWaypoint({ latlng });
                            });
                        }
                        if (data.buoys) {
                            data.buoys.forEach(buoy => {
                                var latlng = L.latLng(buoy.lat, buoy.lng);
                                placeBuoy({ latlng });
                            });
                        }
                        if (data.restrictedArea) {
                            data.restrictedArea.forEach(point => {
                                var latlng = L.latLng(point.lat, point.lng);
                                placeRestrictedAreaPoint({ latlng });
                            });
                        }
                    } catch (e) {
                        alert("Failed to import waypoints: " + e.message);
                    }
                };
                reader.readAsText(file);
            }
            input.remove();
        };
        input.click();
    });
    document.getElementById('follow-boat-button').addEventListener('click', () => {
        isFollowingBoat = !isFollowingBoat;
        document.getElementById('follow-boat-button').innerText = isFollowingBoat ? "Stop Following Boat" : "Follow Boat";
        if (isFollowingBoat) { map.setView(boat.getLatLng()); }
    });

    document.getElementById('text-input').addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            var text = event.target.value.trim();
            if (text) {
                if (!confirm(`Are you sure you want to send the text: "${text}"?`)) {
                    event.target.value = '';
                    return;
                }
                socket.send(text);
                event.target.value = '';
            }
        }
    });

    document.getElementById('camera-button').addEventListener('click', () => {
        // Request the latest image from the server
        // { "type": "requestImage" }
        socket.send(JSON.stringify({ "type" : "requestImage" }));
    });
});