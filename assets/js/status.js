var ROBOT_PORT = 5000;
var robot_url = "http://localhost:" + ROBOT_PORT;


function controlCall(endpoint) {
    var url = robot_url + "/" + endpoint;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                scanStatus();
            } else {
                document.getElementById("scanStatusText").children[0].innerHTML = "ERROR IN SENDING THE REQUEST";
            }
        } else if (this.readyState == 1) {
            document.getElementById("scanStatusText").children[0].innerHTML = "Sending the request...";
        }
    }
    xhttp.open("GET", url, true);
    xhttp.send();
};


function batteryLevel() {
    var url = robot_url + "/batteryLevel";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var value = this.responseText + "%"
                document.getElementById("batteryLevelText").children[0].innerHTML = value;
                document.getElementById("batteryLevelProgressBar").style["width"] = value;
                document.getElementById("batteryLevelProgressBar").children.innerHTML = value;
                document.getElementById("batteryLevelProgressBar").setAttribute("aria-valuenow", value);
            } else {
                document.getElementById("batteryLevelText").children[0].innerHTML = "Couldn't connect";
            }

        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

function scanStatus() {
    var url = robot_url + "/scanStatus";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        var startButton = document.getElementById("startButton")
        var pauseButton = document.getElementById("pauseButton")
        var continueButton = document.getElementById("continueButton")
        var endButton = document.getElementById("endButton")
        if (this.readyState == 4) {
            if (this.status == 200) {
                var response = JSON.parse(this.response)
                var value = response.statusMessage;
                document.getElementById("scanStatusText").children[0].innerHTML = value;

                switch (response.status) {
                    case 'AT_BASE':
                        startButton.style.display = "block"
                        pauseButton.style.display = "none"
                        continueButton.style.display = "none"
                        endButton.style.display = "none"
                        break;
                    case 'MOVE_OFF_BASE':
                    case 'NAVIGATION':
                        startButton.style.display = "none"
                        pauseButton.style.display = "block"
                        continueButton.style.display = "none"
                        endButton.style.display = "block"
                        break;
                    case 'RETURN_TO_BASE':
                    case 'DRIVE_UP_BASE':
                        startButton.style.display = "none"
                        pauseButton.style.display = "none"
                        continueButton.style.display = "none"
                        endButton.style.display = "none"
                        break;
                    case 'PAUSE':
                        startButton.style.display = "none"
                        pauseButton.style.display = "none"
                        continueButton.style.display = "block"
                        endButton.style.display = "block"
                        break;
                }
            } else {
                document.getElementById("scanStatusText").children[0].innerHTML = "Communication with the robot lost.";
                startButton.style.display = "none"
                pauseButton.style.display = "none"
                continueButton.style.display = "none"
                endButton.style.display = "none"
            }
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}

window.onload = batteryLevel()
setInterval(batteryLevel, 5000)
window.onload = scanStatus()
setInterval(scanStatus, 5000)
setInterval(scanStatus, 5000)