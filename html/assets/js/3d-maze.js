const canvas_3d = document.getElementById('gameCanvas');
const ctx_3d = canvas_3d.getContext('2d');
canvas_3d.width = 1024;
canvas_3d.height = 512;
const width_3d = canvas_3d.width;
const height_3d = canvas_3d.height;


let mapName = 'circle';
let map = [];

let stop = false;

let STRETCH = 2;

ctx_3d.fillStyle = 'black';
ctx_3d.fillRect(0, 0, width_3d, height_3d);

const canvas_2d = document.getElementById('miniMap');
const ctx_2d = canvas_2d.getContext('2d');
const width_2d = canvas_2d.width;
const height_2d = canvas_2d.height;

ctx_2d.fillStyle = 'black';
ctx_2d.fillRect(0, 0, width_2d, height_2d);

class Character {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.angle = 0;
    }

}

let path = [];

let NUMLINES = 16;


function draw_rect(x, y, width, height, r, g, b, ctx) {
    ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.fillRect(x, y, width, height);
}

function draw_line(x1, y1, x2, y2, r, g, b, ctx) {
    ctx.strokeStyle = 'rgb(' + r + ',' + g + ',' + b + ')';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}

let player = new Character(0, 0, 50, 50);

async function click() {
    await new Promise(resolve => {
        document.addEventListener('keydown', function (event) {
            resolve();
        });
    // remove event listener
    document.removeEventListener('keydown', function (event) {
        resolve();
    });
});
}

function init() {
    fetch('assets/maps/'+mapName+'.json').then(response => response.json()).then(async data => {
        map = data;
        ctx_3d.fillStyle = 'black';
        ctx_3d.fillRect(0, 0, width_3d, height_3d);
        ctx_3d.fillStyle = 'white';
        ctx_3d.font = '10px Arial';
        ctx_3d.fillText('Press any key to start', width_3d / 2 - 50, height_3d / 2);
        await click();
        main();
    });
}

function draw_2d_map(map) {
    for (let i = 0; i < map.length; i++) {
        draw_rect(map[i][0], map[i][1], map[i][2], map[i][3], map[i][4], map[i][5], map[i][6], ctx_2d);
    }
}

function in_bounds(x, y) {
    return x >= 0 && x < width_3d && y >= 0 && y < height_3d;
}

function touching(x, y, map) {
    for (let i = 0; i < map.length; i++) {
        if (x >= map[i][0] && x <= map[i][0] + map[i][2] && y >= map[i][1] && y <= map[i][1] + map[i][3]) {
            return [map[i][4], map[i][5], map[i][6]];
        }
    }
}

function raycast(x, y, angle, map) {
    let count = 0;
    while (in_bounds(x, y) && count < 120) {
        let color = touching(x, y, map);
        if (color) {
            return [[x, y], color];
        }
        // move forward
        x += Math.cos(angle);
        y += Math.sin(angle) / STRETCH;
        count++;
    }
    return [[x, y], [255, 255, 255]];

}

function optimized_raycast(x, y, angle, map) {
    let count = 0;
    while (in_bounds(x, y) && count < 120) {
        let color = touching(x, y, map);
        if (color) {
            while (touching(x, y, map)) {
                // move backward slightly until not touching wall
                x -= Math.cos(angle) / 4;
                y -= Math.sin(angle) / (4 * STRETCH);
            }
            return [[x, y], color];
        }
        // move forward
        x += Math.cos(angle);
        y += Math.sin(angle) / STRETCH;
        count++;
    }
    return [[x, y], [255, 255, 255]];
}

function norm(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

function darken(color, distance) {
    let r = color[0] - distance * STRETCH * 2.5;
    let g = color[1] - distance * STRETCH * 2.5;
    let b = color[2] - distance * STRETCH * 2.5;
    if (r < 0) {
        r = 0;
    }
    if (g < 0) {
        g = 0
    }
    if (b < 0) {
        b = 0;
    }
    return [r, g, b];
}

function draw_vision(map) {
    let angle = player.angle - Math.PI / 4;
    for (let i = 0; i < NUMLINES; i++) {
        let [endpoint, color] = optimized_raycast(player.x, player.y, angle, map)
        draw_line(player.x, player.y, endpoint[0], endpoint[1], 255, 255, 255, ctx_2d)
        angle += Math.PI / (2 * NUMLINES);

        let distance = norm(player.x, player.y, endpoint[0], endpoint[1]);
        if (distance === 0) {
            distance = 1;
        }

        color = darken(color, distance);

        let height = height_3d / distance * 6;
        let width = Math.round(width_3d / NUMLINES)
        let x = i * width;
        let y = height_3d / 2 - height / 2

        draw_rect(x, y, width, height, color[0], color[1], color[2], ctx_3d);
    }
}
let keys = {};

document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
});

document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
});
function magnitude(x, y) {
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

function handle_keys() {
    //  if left arrow is pressed, rotate left
    if (keys['ArrowLeft']) {
        player.angle -= Math.PI / 128;
    }
    // if right arrow is pressed, rotate right
    if (keys['ArrowRight']) {
        player.angle += Math.PI / 128;
    }
    let dx = 0;
    let dy = 0;

    if (keys['w']) {
        dx += Math.cos(player.angle);
        dy += Math.sin(player.angle);
    }
    // if s is pressed, move backward
    if (keys['s']) {
        dx -= Math.cos(player.angle);
        dy -= Math.sin(player.angle);
    }
    // if a is pressed, move left
    if (keys['a']) {
        dx += Math.cos(player.angle - Math.PI / 2);
        dy += Math.sin(player.angle - Math.PI / 2);
    }
    // if d is pressed, move right
    if (keys['d']) {
        dx += Math.cos(player.angle + Math.PI / 2);
        dy += Math.sin(player.angle + Math.PI / 2);
    }

    for (let i = 0; i < map.length; i++) {
        // if check if touching wall on the left
        if (touching(player.x + dx, player.y, map)) {
            dx = 0;
        }
        // if check if touching wall on the right
        if (touching(player.x, player.y + dy, map)) {
            dy = 0;
        }
    }

    if (!in_bounds(player.x + dx, player.y)) {
        dx = 0;
    }
    if (!in_bounds(player.x, player.y + dy)) {
        dy = 0;
    }


    // Normalize the movement vector
    let m = magnitude(dx, dy);
    if (m === 0) {
        m = 1;
    }

    player.x += (dx / m) / 2;
    player.y += ((dy / m) / 2) / STRETCH;

}

function draw_path(path) {
    for (let i = 0; i < path.length; i++) {
        draw_rect(path[i][0], path[i][1], 1, 1, 255, 255, 255, ctx_2d);
    }
}


function step() {
    if (stop || map.length === 0) {
        return;
    }
    // clear canvas
    ctx_2d.clearRect(0, 0, canvas_2d.width, canvas_2d.height);
    ctx_3d.clearRect(0, 0, canvas_3d.width, canvas_3d.height);
    // fill background black
    ctx_2d.fillStyle = 'black';
    ctx_2d.fillRect(0, 0, width_2d, height_2d);
    ctx_3d.fillStyle = 'black';
    ctx_3d.fillRect(0, 0, width_3d, height_3d);


    // move player
    handle_keys();

    // draw map
    draw_2d_map(map);
    // draw vision
    draw_vision(map);

    // add position to path
    path.push([player.x, player.y]);

    draw_path(path);

    if (stop) {
        return;
    }
    window.requestAnimationFrame(step);
}

function main() {
    if (stop || map.length === 0) {
        return;
    }
    // set player position
    [player.x, player.y] = map[0];
    player.x = player.x / 2;
    player.y = player.y / 4;
    map.shift();
    // scale map
    for (let i = 0; i < map.length; i++)
        map[i] = [map[i][0] / 2, map[i][1] / 4, map[i][2]/ 2, map[i][3] / 4, map[i][4], map[i][5], map[i][6]];

    window.requestAnimationFrame(step);


}

init();


// implement hide mini map

hideMiniMap = () => {
    mm = document.getElementById('miniMap');
    btn = document.getElementById('hideMap');
    slider = document.getElementById('slider-container');
    if (mm.style.display === 'none') {
        mm.style.display = 'block';
        btn.innerHTML = 'Hide 2D Map';
        slider.right = '20vw';
    } else {
        mm.style.display = 'none';
        btn.innerHTML = 'Show 2D Map';
        slider.right = '2vw';
    }
}

function changeMap() {
    let mapSelect = document.getElementById('mapSelect');
    let newMapName = mapSelect.options[mapSelect.selectedIndex].innerHTML;
    if (newMapName === mapName) {
        return;
    }
    mapName = newMapName;
    stop = true;

    map = [];
    ctx_2d.fillStyle = 'black';
    ctx_2d.fillRect(0, 0, width_2d, height_2d);
    ctx_3d.fillStyle = 'black';
    ctx_3d.fillRect(0, 0, width_3d, height_3d);

    // clear path
    path = [];

    fetch('assets/maps/' + mapName + '.json').then(response => response.json()).then(async data => {
        map = data;
        ctx_3d.fillStyle = 'white';
        ctx_3d.font = '10px Arial';
        ctx_3d.fillText('Press any key to start', width_3d / 2 - 50, height_3d / 2);
        await click();
        stop = false;
        main();
    });
}

function changeLabel(val) {
    let label = document.getElementById('numLinesLabel');
    label.innerHTML = "Number of Rays: " + val;
}

function toggleFullScreen() {
    let elem = document.getElementById('gameCanvas');
    if (!document.fullscreenElement) {
        elem.requestFullscreen().catch(err => {
            alert(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
        });
    } else {
        document.exitFullscreen();
    }
}


