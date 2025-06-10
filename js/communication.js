socket = new WebSocket("ws://sailbot:5000/sailbot"); // change this to use the host name of the sailbox
var checkedLocalhost = false;
function timeoutFunction() {
    console.log("Checking if the Sailbot is online...");
    if (socket.readyState !== WebSocket.OPEN) {
        if (!checkedLocalhost) {
            console.log("Trying to connect to localhost as a fallback...");
            socket.close();
            checkedLocalhost = true;
            socket = new WebSocket("ws://localhost:5000/sailbot"); // Fallback to localhost

            var telemetryElement = document.getElementById("telemetry");
            telemetryElement.innerHTML = "Trying to connect to localhost...";

            setTimeout(timeoutFunction, 5000); // Retry after 5 seconds
        } else {
            alert("Failed to connect to the Sailbot. That's a pi-3 for ya.");
            var telemetryElement = document.getElementById("telemetry");
            telemetryElement.innerHTML = "Failed to connect to the Sailbot.";
        }
    }
}
setTimeout(timeoutFunction, 5000);

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

socket.addEventListener("close", (event) => {
    console.log("WebSocket connection closed lost??", event);

    var telemetryElement = document.getElementById("telemetry");
    telemetryElement.innerHTML = `LOST CONNECTION: ${event.reason}`;
});

socket.addEventListener("open", (event) => {
    console.log("WebSocket connection established");
    var telemetryElement = document.getElementById("telemetry");
    telemetryElement.innerHTML = "Connected to Sailbot!";
});

function handleImage(image) {
    /* Example image data structure
    {
    "type": "image",
    "imageData": "BASE64_ENCODED_IMAGE_DATA_HERE",
    "imageType": "jpeg"
    }
    */

    var base64 = image.imageData;
    var imageElement = document.getElementById("camera-image");
    imageElement.src = `data:image/${image.imageType};base64,${base64}`;
    imageElement.style.display = "block";
}

function handleTelemetry(telemetry) {
    /* Example telemetry data structure
    {
     "type": "telemetry",
     "gps": {
       "fix": 1,
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

    setWindCompass(telemetry.windSensor.direction);
    setHeadingCompass(telemetry.magnetometer.heading);
    moveBoat(telemetry.gps.latitude, telemetry.gps.longitude, telemetry.magnetometer.heading);

    var telemetryElement = document.getElementById("telemetry");
    var formattedTelemetry = `
        GPS Fix: ${telemetry.gps.fix} <br>
        Latitude: ${telemetry.gps.latitude} <br>
        Longitude: ${telemetry.gps.longitude} <br>
        Speed: ${telemetry.gps.speed} m/s <br>
        Heading: ${telemetry.gps.heading}° <br>
        Magnetometer Heading: ${telemetry.magnetometer.heading}° <br>
        Wind Direction: ${telemetry.windSensor.direction}° <br>
    `;
    telemetryElement.innerHTML = formattedTelemetry;
}

let callbacks   = {
    "telemetry": handleTelemetry,
    "image": handleImage,
};
