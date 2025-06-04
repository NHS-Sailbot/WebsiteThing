// Initialize the map
var map = L.map('map', {
    center: [42.27648680709905, -71.75747055885047],
    zoom: 18,
    zoomControl: false,
    attributionControl: false
});
L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}').addTo(map);

// Compass functionality
document.addEventListener('DOMContentLoaded', function() {
    const compassArrow = document.getElementById('compass-arrow');
    const headingInput = document.getElementById('heading-input');
    const setHeadingBtn = document.getElementById('set-heading-btn');
    
    // Set default heading (North - 0 degrees)
    setCompassHeading(0);
    
    // Set heading on button click
    if (setHeadingBtn) {
        setHeadingBtn.addEventListener('click', function() {
            let heading = parseInt(headingInput.value);
            if (isNaN(heading)) heading = 0;
            // Normalize to 0-359
            heading = ((heading % 360) + 360) % 360;
            headingInput.value = heading;
            setCompassHeading(heading);
        });
    }
    
    // Update heading when input changes
    if (headingInput) {
        headingInput.addEventListener('change', function() {
            let heading = parseInt(headingInput.value);
            if (isNaN(heading)) heading = 0;
            // Normalize to 0-359
            heading = ((heading % 360) + 360) % 360;
            headingInput.value = heading;
            setCompassHeading(heading);
        });
    }
    
    // Function to set the compass heading
    function setCompassHeading(degrees) {
        if (compassArrow) {
            compassArrow.style.transform = `translateX(-50%) rotate(${degrees}deg)`;
        }
    }
    
    // Function to update compass from external code
    window.updateCompass = function(degrees) {
        // Normalize to 0-359
        degrees = ((degrees % 360) + 360) % 360;
        if (headingInput) {
            headingInput.value = degrees;
        }
        setCompassHeading(degrees);
        return degrees; // Return the normalized value
    };
});
