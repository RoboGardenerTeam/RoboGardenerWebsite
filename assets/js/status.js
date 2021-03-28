var ROBOT_PORT = 5000;
var robot_url = "http://localhost:" + ROBOT_PORT;

function batteryLevel() {
    var url = robot_url + "/batteryLevel";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var value = this.responseText + "%"
            document.getElementById("batteryLevelText").children[0].innerHTML = value;
            document.getElementById("batteryLevelProgressBar").style["width"] = value;
            document.getElementById("batteryLevelProgressBar").children.innerHTML = value;
            document.getElementById("batteryLevelProgressBar").setAttribute("aria-valuenow", value);
        }
    };
    xhttp.open("GET", url, true);
    xhttp.send();
}


function scanStatus() {
    var url = robot_url + "/scanStatus";
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
            if (this.status == 200) {
                var value = "Status: " + JSON.parse(this.response).statusMessage;
                document.getElementById("scanStatusText").children[0].innerHTML = value;
            } else {
                document.getElementById("scanStatusText").children[0].innerHTML = "Communication with the robot lost.";
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