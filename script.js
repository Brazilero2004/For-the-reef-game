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

// ✅ Fix: Ensure the player image loads fully before starting the game
player.img.onload = function () {
    console.log("Polar bear image loaded successfully.");
};
player.img.onerror = function () {
    console.error("Error loading polar bear image!");
};
player.img.src = "1000084073-removebg-preview.png"; // Ensure this URL is correct

// Load updated ocean background image
let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; 

// Load reef images (healthy and damaged)
let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; 

let damagedReefBackground = new Image();
damagedReefBackground.src = "20250212_203814.png"; 

// Reef health system
let maxReefHealth = 10; 
let reefHealth = maxReefHealth; 

// Starfish variables
let starfishArray = []; 
let starfishSpeed = 1.5; 
let spawnRate = 3000; 

// ✅ Fix: Ensure game only starts after images load
let imagesLoaded = 0;
let totalImages = 4; 

function imageLoaded() {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
        console.log("All images loaded. Starting game...");
        gameLoop();
    }
}

// Ensure all images are fully loaded before game starts
oceanBackground.onload = imageLoaded;
reefBackground.onload = imageLoaded;
damagedReefBackground.onload = imageLoaded;
player.img.onload = imageLoaded;

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

// Function to draw the player
function drawPlayer() {
    if (!player.img.complete) {
        console.log("Waiting for player image to load...");
        return;
    }

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

// Function to draw the reef
function drawReef() {
    let reefHeight = canvas.height * 0.3;
    let reefY = canvas.height - reefHeight;

    if (reefHealth > 0) {
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
    }
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
