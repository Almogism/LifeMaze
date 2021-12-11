//Import screen height and width.
const SCREEN_WIDTH = window.innerWidth-5;
const SCREEN_HEIGHT = window.innerHeight-5;

//Create canvas.
const canvas = document.createElement("canvas");
canvas.setAttribute("width", SCREEN_WIDTH);
canvas.setAttribute("height", SCREEN_HEIGHT);
canvas.setAttribute("id","gameCanvas");
document.body.appendChild(canvas);
const context = canvas.getContext("2d");

//Counter for the game loop (in milliseconds).
const TICK = 30;

const CELL_SIZE = 64;

//Global boolean for map showcase.
let mapFlag = true;

//Global boolean for player movement.
let movementFlag = true;

//Global values for menu showcase.
let menuOpacity = 0;
let tintOpacity = 0;

const PLAYER_SIZE = 10;

//Field of view.
const FOV = toRadians(60);

//Colors.
const COLORS = {
    floor: "#949393",
    ceiling: "#383838",
    wall: "#3061E2",
    wallDark: "#1B43AF",
    rays: "red"
}

//Boolean representation of the map.
const map = [
    [1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
];

//Player info.
const player = {
    x: CELL_SIZE * 1.5,
    y: CELL_SIZE * 2,
    angle: 1.5,
    speed: 0
};

//Clear screen function.
function clearScreen() {
    context.fillStyle = "white";
    context.fillRect(0, 0, SCREEN_WIDTH, SCREEN_HEIGHT);
}

//Player moves function.
function movePlayer() {
    player.x += Math.cos(player.angle) * player.speed
    player.y += Math.sin(player.angle) * player.speed
}

//Function to indicate reaching out of the map bounds.
function outOfMapBounds(x, y) {
    return x < 0 || x >= map[0].length || y < 0 || y >= map.length;
}

//Function to calculate distance accoring to a distance formula.
function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

//Vertical collisions indicator.
function getVCollision(angle) {
    const right = Math.abs(Math.floor((angle - Math.PI / 2) / Math.PI) % 2)

    const firstX = right
        ? Math.floor(player.x / CELL_SIZE) * CELL_SIZE + CELL_SIZE
        : Math.floor(player.x / CELL_SIZE) * CELL_SIZE;

    const firstY = player.y + (firstX - player.x) * Math.tan(angle);

    const xA = right ? CELL_SIZE : -CELL_SIZE;
    const yA = xA * Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = right
            ? Math.floor(nextX / CELL_SIZE)
            : Math.floor(nextX / CELL_SIZE) - 1;
        const cellY = Math.floor(nextY / CELL_SIZE)

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX]
        if (!wall) {
            nextX += xA
            nextY += yA
        }
    }
    return {
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: true
    };
}

//Horizontal collisions indicator.
function getHCollision(angle) {
    const up = Math.abs(Math.floor(angle / Math.PI) % 2);
    const firstY = up
        ? Math.floor(player.y / CELL_SIZE) * CELL_SIZE
        : Math.floor(player.y / CELL_SIZE) * CELL_SIZE + CELL_SIZE;

    const firstX = player.x + (firstY - player.y) / Math.tan(angle);

    const yA = up ? -CELL_SIZE : CELL_SIZE;
    const xA = yA / Math.tan(angle);

    let wall;
    let nextX = firstX;
    let nextY = firstY;
    while (!wall) {
        const cellX = Math.floor(nextX / CELL_SIZE);
        const cellY = up
            ? Math.floor(nextY / CELL_SIZE) - 1
            : Math.floor(nextY / CELL_SIZE);

        if (outOfMapBounds(cellX, cellY)) {
            break;
        }
        wall = map[cellY][cellX]
        if (!wall) {
            nextX += xA
            nextY += yA
        }
    }
    return {
        angle,
        distance: distance(player.x, player.y, nextX, nextY),
        vertical: false
    };
}

//Casting rays from the player.
function castRay(angle) {
    const vCollision = getVCollision(angle)
    const hCollision = getHCollision(angle)

    return hCollision.distance >= vCollision.distance ? vCollision : hCollision
}

//Ray calculations from the player.
function getRays() {
    const initialAngle = player.angle - FOV / 2;
    const numberOfRays = SCREEN_WIDTH;
    const angleStep = FOV / numberOfRays;
    return Array.from({ length: numberOfRays }, (_, i) => {
        const angle = initialAngle + i * angleStep;
        const ray = castRay(angle);
        return ray;
    });
}

//Fix for the fixeye effect.
function fixFishEye(distance, angle, playerAngle) {
    const diff = angle - playerAngle;
    return distance * Math.cos(diff)
}

//Scene renderer according to the rays sent by the getRays function.
function renderScene(rays) {
    rays.forEach((ray, i) => {
        const distance = fixFishEye(ray.distance, ray.angle, player.angle);
        const wallHeight = ((CELL_SIZE * 5) / distance) * 280;
        context.fillStyle = ray.vertical ? COLORS.wallDark : COLORS.wall;
        context.fillRect(i, SCREEN_HEIGHT / 2 - wallHeight / 2, 1, wallHeight)
        context.fillStyle = COLORS.floor;
        context.fillRect(i, SCREEN_HEIGHT / 2 + wallHeight / 2, 1, SCREEN_HEIGHT / 2 - wallHeight / 2);
        context.fillStyle = COLORS.ceiling;
        context.fillRect(i, 0, 1, SCREEN_HEIGHT / 2 - wallHeight / 2)
    })
}

//Minimap showcase (top left).
function renderMinimap(posX = 0, posY = 0, scale = 1, rays) {
    const cellSize = scale * CELL_SIZE;
    map.forEach((row, y) => {
        row.forEach((cell, x) => {
            if (cell) {
                context.fillStyle = "grey"
                context.fillRect(
                    posX + x * cellSize,
                    posY + y * cellSize,
                    cellSize,
                    cellSize
                );
            }
        });
    });
    context.strokeStyle=COLORS.rays;
    rays.forEach(ray => {
        context.beginPath()
        context.moveTo(player.x * scale + posX, player.y * scale + posY)
        context.lineTo(
            (player.x + Math.cos(ray.angle) * ray.distance) * scale,
            (player.y + Math.sin(ray.angle) * ray.distance) * scale,
        )
        context.closePath()
        context.stroke()
    })

    context.fillStyle = "white"
    context.fillRect(
        posX + player.x * scale - PLAYER_SIZE / 2,
        posY + player.y * scale - PLAYER_SIZE / 2,
        PLAYER_SIZE,
        PLAYER_SIZE
    )

    const rayLength = PLAYER_SIZE * 2;
    context.strokeStyle = "black"
    context.beginPath()
    context.moveTo(player.x * scale + posX, player.y * scale + posY)
    context.lineTo(
        (player.x + Math.cos(player.angle) * rayLength) * scale,
        (player.y + Math.sin(player.angle) * rayLength) * scale,
    )
    context.closePath()
    context.stroke()
}

//Pause menu function.
function pauseMenu() {
    const tintCanvas = document.getElementById('tint');
    tintCanvas.setAttribute("width", SCREEN_WIDTH);
    tintCanvas.setAttribute("height", SCREEN_HEIGHT);
    const pauseCanvas = document.getElementById('pauseCanvas');
    pauseCanvas.style.opacity = menuOpacity;
    tintCanvas.style.opacity = tintOpacity;
    const pauseText = document.getElementById('pauseText');
    pauseText.style.opacity = menuOpacity;
    const pauseAudio = document.getElementById('pauseAudio');
    pauseAudio.style.opacity = menuOpacity;
}

//Main game function!
function gameLoop() {
    clearScreen();
    if (movementFlag)
        movePlayer();
    const rays = getRays();
    renderScene(rays);
    pauseMenu();
    if (mapFlag)
        renderMinimap(0, 0, 0.375, rays);
}

//Loop for the game function that runs every "TICK" milliseconds.
setInterval(gameLoop, TICK);
//Basic degrees to radian converter.
function toRadians(deg) {
    return (deg * Math.PI) / 180
}

//forward and backward key downstroke.
document.addEventListener("keydown", (e) => {
    if (e.key == "ArrowUp")
        player.speed = 2
        if (e.key == "ArrowDown")
        player.speed = -2
})

//forward and backward key upstroke.
document.addEventListener("keyup", (e) => {
    if (e.key == "ArrowUp" || e.key == "ArrowDown")
        player.speed = 0
})

//Mouse move function (left to right).
document.addEventListener("mousemove", (e) => {
    if (movementFlag)
        player.angle += toRadians((e.movementX))
})

//Key press for minimap.
document.addEventListener("keypress", (e) => {
    if (e.key == "M" || e.key == "m" || e.key == "צ")
        //Invert the map flag to hide and show the map.
        mapFlag = !mapFlag;
})

//Key press for taking screenshots.
document.addEventListener("keypress", (e) => {
    if (e.key == "P" || e.key == "p" || e.key == "פ") {
        //Convert the game canvas to DataURL type.
        var tempImage = gameCanvas.toDataURL('image/jpeg');
        //Create a download function to simulate a mouse click event that triggers the download.
        function downloadImage(tempData) {
            //Temporary download element.
            var download = document.createElement('a');
            //Set fields.
            download.href = tempData;
            download.target = '_blank';
            download.download = "Screenshot.jpeg";
            //(evt = event)
            var evt = document.createEvent('MouseEvents');
            //Initialize mouse click.
            evt.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0,
                false, false, false, false, 0, null);
            download.dispatchEvent(evt);
        }
        downloadImage(tempImage);
    }
})

//Key press for menu.
document.onkeydown = function (evt) {
    //Specifying an event.
    evt = evt || window.event;
    //Escape pressed is false.
    var isEscape = false;
    //Escape press logic.
    if ("key" in evt) {
        isEscape = (evt.key === "Escape" || evt.key === "Esc");
    } else {
        isEscape = (evt.keyCode === 27);
    }
    //Change opacity and disable movement if escape is pressed.
    if (isEscape) {
        if (menuOpacity == 0) {
            menuOpacity = 1;
            tintOpacity = 0.7;
            movementFlag = !movementFlag;
        }
        else if (menuOpacity == 1) {
            menuOpacity = 0;
            tintOpacity = 0;
            movementFlag = !movementFlag;
        }
    }
};