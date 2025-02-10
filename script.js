let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

canvas.width = 800;
canvas.height = 600;

let player = {
    x: canvas.width / 2 - 25,
    y: canvas.height - 60,
    width: 50, // Adjust as needed
    height: 50,
    speed: 5,
    img: new Image()
};

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

// Touch movement for mobile
canvas.addEventListener("touchstart", function(event) {
    let touchX = event.touches[0].clientX;
    let canvasRect = canvas.getBoundingClientRect();
    let canvasX = touchX - canvasRect.left;

    if (canvasX < player.x) {
        player.x -= player.speed * 2; // Move left
    } else if (canvasX > player.x + player.width) {
        player.x += player.speed * 2; // Move right
    }
});

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
