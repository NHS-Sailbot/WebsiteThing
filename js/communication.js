const socket = new WebSocket("ws://localhost:5000/sailbot"); // change this to use the host name of the sailbox
setTimeout(() => {
    if (socket.readyState !== WebSocket.OPEN) { alert("Failed to connect to the Sailbot. Pester Chris to fix it!"); }
}, 5000);

socket.addEventListener("message", (event) => {
    var telemetryMessage = event.data.trim();

    if (telemetryMessage.startsWith('{') && telemetryMessage.endsWith('}')) {
        try {
            const data = JSON.parse(event.data);
            console.log("Parsed telemetry data: ", data); // Log the parsed telemetry data for debugging
            if (callbacks[data.type]) {
                callbacks[data.type](data); // Call the appropriate callback function based on the telemetry type
            }
        } catch (e) {
            console.error("Error parsing telemetry data: ", e);
        }
    } else {
        console.log(event.data);
    }
});

function handleImage(image) {
    /* Example image data structure
    {
    "type": "image",
    "imageData": "BASE64_ENCODED_IMAGE_DATA_HERE"
    }
    */

    var base64 = image.imageData;
    var imageElement = document.getElementById("camera-image").getElementsByTagName("img")[0];
    imageElement.src = "data:image/jpeg;base64," + base64;
}

function handleTelemetry(telemetry) {
    /* Example telemetry data structure
    {
     "type": "telemetry",
     "gps": {
       "fix": true,
       "latitude": 37.7749,
       "longitude": -122.4194,
       "speed": 5.2,
       "heading": 90.0
     },
     "magnetometer": {
       "heading": 85.3
     },
     "windSensor": {
       "direction": 45.0
     }
    }
    */

    setCompassHeading(telemetry.windSensor.direction);
}

let callbacks   = {
    "telemetry": handleTelemetry,
    "image": handleImage,
};