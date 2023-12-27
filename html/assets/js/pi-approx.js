

let canvas = document.getElementById("visualizationCanvas");
console.log(canvas);
let ctx = canvas.getContext("2d");
let width = canvas.width;
let height = canvas.height;
let radius = width / 2;
let centerX = width / 2;
let centerY = height / 2;

// Make canvas white
ctx.fillStyle = "white";
ctx.fillRect(0, 0, width, height);

// draw x and y axis in black
ctx.fillStyle = "black";
ctx.fillRect(0, centerY, width, 1);
ctx.fillRect(centerX, 0, 1, height);


// draw circle in red
ctx.beginPath();
ctx.strokeStyle = "red";
ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
ctx.stroke();


let TOTAL_POINTS = 0;
let POINTS_IN_CIRCLE = 0;

function drawPoint(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1, 1);
}
async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

let mask = [];

function standard_error() {
    let percent_in_circle = POINTS_IN_CIRCLE / TOTAL_POINTS;
    let sum = 0;
    for (let i = 0; i < mask.length; i++) {
        sum += Math.pow(mask[i] - percent_in_circle, 2);
    }
    return 4 * Math.sqrt(sum / ((TOTAL_POINTS - 1) * (TOTAL_POINTS)));
}

let pts_per_ms = 1;

let speedSlider = document.getElementById("speedSlider");

speedSlider.addEventListener("input", function() {
    pts_per_ms = speedSlider.value * 1/10;
    if (pts_per_ms === 20) {
        pts_per_ms = 200000000000000;
    }
})



// draw random points every 100ms and check if they are in the circle. Update the canvas accordingly
document.getElementById("actualPi").innerHTML = Math.round(Math.PI * 1000000) / 1000000;

async function main() {
    while (TOTAL_POINTS < 100000000) {
        let x = 2 * Math.random() - 1;
        let y = 2 * Math.random() - 1;
        let color = "green";
        TOTAL_POINTS++;
        if (Math.pow(x, 2) + Math.pow(y, 2) <= 1) {
            POINTS_IN_CIRCLE++;
            color = "blue";
            mask.push(1);
        }
        else {
            mask.push(0);
        }
        // draw point
        x = x * radius + centerX;
        y = y * radius + centerY;
        drawPoint(x, y, color);
        let pi = Math.round((4 * POINTS_IN_CIRCLE / TOTAL_POINTS) * 1000000) / 1000000;
        // convert to string and add leading zeros
        pi = pi.toString();
        if (pi.length === 1) {
            pi += ".000000";
        }
        while (pi.length < 7) {
            pi += "0";
        }
        console.log(pts_per_ms);
        document.getElementById("piEstimation").innerHTML = pi;
        document.getElementById("totalPoints").innerHTML = TOTAL_POINTS;
        document.getElementById("pointsInCircle").innerHTML = POINTS_IN_CIRCLE;
        document.getElementById("standardError").innerHTML = Math.round(standard_error() * 1000000) / 1000000;
        await sleep(1 / pts_per_ms * 1000);
    }
}

main();