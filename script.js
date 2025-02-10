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
    width: canvas.width * 0.1,  // Player size is 10% of the screen width
    height: canvas.width * 0.1, // Keep the same aspect ratio
    speed: canvas.width * 0.01, // Movement speed scales with screen size
    img: new Image()
};

// Position the player at the bottom center of the screen
function resetPlayerPosition() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height * 1.5;
}

// Call this function every time the canvas resizes
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// Set the image source to your uploaded GitHub image
player.img.src = "file-FWrM1XhM33DkDCipnCvQjg.webp"; // Replace with actual GitHub image URL

// Keyboard movement
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed;
    } else if (event.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed;
    }
});

// Touch movement for mobile (smooth dragging)
let isTouching = false;

canvas.addEventListener("touchstart", function(event) {
    isTouching = true;
    movePlayer(event.touches[0].clientX);
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

    player.x = canvasX - player.width / 2;

    // Prevent the player from moving off the screen
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Function to draw the player using the image
function drawPlayer() {
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
