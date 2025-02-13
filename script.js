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
    width: canvas.width * 0.2,  
    height: canvas.width * 0.2,  
    speed: canvas.width * 0.007, 
    img: new Image()
};

// Ensure the player image loads before starting
player.img.src = "1000084073-removebg-preview.png"; 

// Load background images
let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; 

let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; 

let damagedReefBackground = new Image();
damagedReefBackground.onload = function() {
    console.log("Damaged reef image loaded successfully.");
};
damagedReefBackground.onerror = function() {
    console.error("Error loading damaged reef image!");
};
damagedReefBackground.src = "20250212_203814.png"; 

// Reef health system
let maxReefHealth = 10; 
let reefHealth = maxReefHealth; 

// Starfish variables
let starfishArray = []; 
let starfishSpeed = 1.5; 
let spawnRate = 3000; 

// Position the player at the bottom center of the screen
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; 
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; 
}

// Resize event to reposition the player
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// Floating animation variables
let floatOffset = 0;
let floatDirection = 1;
let tiltAngle = 0;
let targetTilt = 0;

// ✅ Fix: Reef switches to damaged when health is 50% or lower
function drawReef() {
    let reefHeight = canvas.height * 0.3;
    let reefY = canvas.height - reefHeight;

    console.log("Reef Health:", reefHealth); // Debug log

    if (reefHealth > maxReefHealth * 0.5) {
        console.log("Displaying healthy reef.");
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        console.log("Displaying damaged reef.");
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
    }
}

// ✅ Fix: Re-enable player movement (Keyboard)
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed * 10;
        targetTilt = -10; 
    } else if (event.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed * 10;
        targetTilt = 10; 
    }
});

document.addEventListener("keyup", function(event) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        targetTilt = 0; 
    }
});

// ✅ Fix: Enable smooth touch movement for mobile
canvas.addEventListener("touchstart", function(event) {
    event.preventDefault(); 
    movePlayer(event.touches[0].clientX);
});

canvas.addEventListener("touchmove", function(event) {
    event.preventDefault();
    movePlayer(event.touches[0].clientX);
});

// Function to move the player smoothly based on touch position
function movePlayer(touchX) {
    let canvasRect = canvas.getBoundingClientRect();
    let canvasX = touchX - canvasRect.left;

    player.x = canvasX - player.width / 2;

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}

// Function to draw the player
function drawPlayer() {
    floatOffset += floatDirection * 0.3;
    if (floatOffset > 5 || floatOffset < -5) {
        floatDirection *= -1;
    }

    tiltAngle += (targetTilt - tiltAngle) * 0.1;

    ctx.save();
    ctx.translate(player.x + player.width / 2, player.y + player.height / 2 + floatOffset);
    ctx.rotate(tiltAngle * Math.PI / 180);
    ctx.drawImage(player.img, -player.width / 2, -player.height / 2, player.width, player.height);
    ctx.restore();
}

// Function to draw the health meter
function drawHealthMeter() {
    let meterWidth = 200;
    let meterHeight = 20;
    let meterX = 20;
    let meterY = 20;
    
    let healthPercent = reefHealth / maxReefHealth;
    let meterColor = "green";
    if (healthPercent <= 0.6) meterColor = "yellow";
    if (healthPercent <= 0.3) meterColor = "red";

    ctx.fillStyle = "gray";
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    ctx.fillStyle = meterColor;
    ctx.fillRect(meterX, meterY, meterWidth * healthPercent, meterHeight);

    ctx.strokeStyle = "black";
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
}

// Function to handle game over
function gameOver() {
    cancelAnimationFrame(gameLoop);
    setTimeout(() => {
        let playAgain = confirm("The reef has been destroyed! Play again?");
        if (playAgain) resetGame();
    }, 500);
}

// Function to reset the game
function resetGame() {
    reefHealth = maxReefHealth;
    starfishArray = [];
    gameLoop();
}

// Function to update starfish movement
function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        starfishArray[i].y += starfishSpeed;

        if (starfishArray[i].y + starfishArray[i].size >= canvas.height - canvas.height * 0.3) {
            reefHealth--;
            starfishArray.splice(i, 1);
            i--;

            if (reefHealth <= 0) {
                reefHealth = 0;
                gameOver();
            }
        }
    }
}

// Function to spawn starfish
function spawnStarfish() {
    let starfishSize = 30;
    let xPosition = Math.random() * (canvas.width - starfishSize);
    starfishArray.push({ x: xPosition, y: 0, size: starfishSize });
}
setInterval(spawnStarfish, spawnRate);

// Function to draw starfish
function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; 
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateStarfish();
    drawStarfish();
    drawPlayer();
    drawHealthMeter();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
