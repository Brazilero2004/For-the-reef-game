let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// Resize the canvas when the page loads & when the window resizes
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let player = {
    width: canvas.width * 0.2,  // Increased to 20% of screen width
    height: canvas.width * 0.2, // Keep the same aspect ratio
    speed: canvas.width * 0.007, // Adjusted speed for new size
    img: new Image()
};

// Set the new image source (Transparent PNG)
player.img.src = "1000084073-removebg-preview.png"; // Replace with actual GitHub image URL

// Load updated ocean background image
let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; // Replace with actual GitHub image URL

// Load reef images (healthy and damaged)
let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; // Replace with actual GitHub image URL

let damagedReefBackground = new Image();
damagedReefBackground.src = "20250212_203814.png"; // Replace with actual GitHub image URL

// Reef health system
let reefHealth = 3; // Reef starts with full health

// Starfish variables
let starfishArray = []; // Array to store starfish
let starfishSpeed = 1.5; // Starfish movement speed
let spawnRate = 3000; // Spawn a new starfish every 3 seconds

// Position the player at the bottom center of the screen
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; // Match reef height
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; // Adjusted position above the reef
}

// Call this function every time the canvas resizes
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// Floating animation variables
let floatOffset = 0;
let floatDirection = 1;
let tiltAngle = 0;
let targetTilt = 0;

// Keyboard movement
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed * 10;
        targetTilt = -10; // Tilt slightly left
    } else if (event.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed * 10;
        targetTilt = 10; // Tilt slightly right
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        targetTilt = 0; // Reset tilt when not moving
    }
});

// Touch movement for mobile (smooth dragging)
let isTouching = false;

canvas.addEventListener("touchstart", function(event) {
    isTouching = true;
});

canvas.addEventListener("touchmove", function(event) {
    if (isTouching) {
        movePlayer(event.touches[0].clientX);
    }
});

canvas.addEventListener("touchend", function() {
    isTouching = false;
});

function movePlayer(touchX) {
    let canvasRect = canvas.getBoundingClientRect();
    let canvasX = touchX - canvasRect.left;

    let moveSpeed = player.speed * 15;

    if (canvasX < player.x) {
        player.x -= moveSpeed;
        targetTilt = -10; // Tilt left
    } else if (canvasX > player.x + player.width) {
        player.x += moveSpeed;
        targetTilt = 10; // Tilt right
    } else {
        targetTilt = 0; // Reset tilt if not moving
    }

    // Prevent the player from moving off the screen
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Function to draw the background ocean, stopping where the reef begins
function drawBackground() {
    let reefHeight = canvas.height * 0.3; // Reef takes up 30% of the screen height
    let backgroundHeight = canvas.height - reefHeight; // Limit background height

    ctx.drawImage(oceanBackground, 0, 0, canvas.width, backgroundHeight);
}

// Function to draw the reef, changing when health is low
function drawReef() {
    let reefHeight = canvas.height * 0.3; // Reef size
    let reefY = canvas.height - reefHeight; // Position at the bottom

    if (reefHealth > 0) {
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
    }
}

// Function to draw the player with bobbing and tilt animation
function drawPlayer() {
    // Make the bear float up and down slightly
    floatOffset += floatDirection * 0.3;
    if (floatOffset > 5 || floatOffset < -5) {
        floatDirection *= -1;
    }

    // Smooth tilt animation
    tiltAngle += (targetTilt - tiltAngle) * 0.1;

    ctx.save(); // Save the current drawing state
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2 + floatOffset);
    ctx.rotate(tiltAngle * Math.PI / 180); // Apply tilt rotation
    ctx.drawImage(player.img, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore(); // Restore original state
}

// Function to spawn starfish at random positions
function spawnStarfish() {
    let starfishSize = 30; // Size of starfish
    let xPosition = Math.random() * (canvas.width - starfishSize); // Random X position

    starfishArray.push({ x: xPosition, y: 0, size: starfishSize });
}
setInterval(spawnStarfish, spawnRate); // Spawn starfish every few seconds

// Function to update starfish movement
function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        starfishArray[i].y += starfishSpeed; // Move down

        // If starfish reaches the reef, it damages the reef
        if (starfishArray[i].y + starfishArray[i].size >= canvas.height - canvas.height * 0.3) {
            reefHealth--; // Reduce reef health
            starfishArray.splice(i, 1); // Remove the starfish
            i--; // Adjust index after removal
        }
    }
}

// Function to draw starfish
function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; // Temporary color (replace with image later)
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawBackground();
    drawReef();
    updateStarfish();
    drawStarfish();
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
