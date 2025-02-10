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
    speed: canvas.width * 0.005, // Slower movement speed
    img: new Image()
};

// Set the new image source (Transparent PNG)
player.img.src = "1000084073-removebg-preview.png"; // Replace with the actual GitHub image URL

// Position the player at the bottom center of the screen
function resetPlayerPosition() {
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - player.height * 1.5;
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

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPlayer();
    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
