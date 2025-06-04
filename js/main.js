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
});
