let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

// ✅ Load Player
let player = {
    width: canvas.width * 0.15,  
    height: canvas.width * 0.15,  
    speed: canvas.width * 0.007, 
    floatOffset: 0,  // 🔹 Floating effect
    floatDirection: 1,
    img: new Image()
};
player.img.src = "1000084073-removebg-preview.png"; 

// ✅ Load Backgrounds
let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; 

let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; 

let damagedReefBackground = new Image();
damagedReefBackground.src = "20250212_203814.png"; 

// ✅ Reef Health
let maxReefHealth = 10; 
let reefHealth = maxReefHealth;

// ✅ Starfish & Bubbles
let starfishArray = []; 
let starfishSpeed = 1.5; 
let spawnRate = 2000;

let bubbleArray = []; 
let bubbleSpeed = 10; 

// ✅ Power-Up Variables
let powerUp = null;
let powerUpActive = false;
let powerUpDuration = 10000;
let lastPowerUpTime = 0;
let gameStartTime = Date.now();

// ✅ Position Player at Bottom
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; 
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; 
}
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// ✅ Draw Reef (Switches When Health < 50%)
function drawReef() {
    let reefHeight = canvas.height * 0.3;
    let reefY = canvas.height - reefHeight;
    if (reefHealth > maxReefHealth * 0.5) {
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
    }
}

// ✅ Floating Effect for Polar Bear
function updateFloatingBear() {
    player.floatOffset += player.floatDirection * 0.5;
    if (player.floatOffset > 5 || player.floatOffset < -5) {
        player.floatDirection *= -1;
    }
}

// ✅ Player Movement (Keyboard & Touch)
document.addEventListener("keydown", function(event) {
    if (event.key === "ArrowLeft" && player.x > 0) {
        player.x -= player.speed * 10;
    } else if (event.key === "ArrowRight" && player.x + player.width < canvas.width) {
        player.x += player.speed * 10;
    }
});

canvas.addEventListener("touchmove", function(event) {
    event.preventDefault();
    let touchX = event.touches[0].clientX;
    player.x = touchX - player.width / 2;
});

// ✅ Power-Up Spawning
function spawnPowerUp() {
    if (Date.now() - lastPowerUpTime > 30000 && !powerUp) {
        powerUp = { x: Math.random() * canvas.width, y: canvas.height * 0.2, size: 40 };
        lastPowerUpTime = Date.now();
    }
}

// ✅ Power-Up Collection
function checkPowerUpCollision() {
    if (powerUp) {
        let dx = player.x + player.width / 2 - powerUp.x;
        let dy = player.y - powerUp.y;
        let distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 40) {
            powerUp = null;
            powerUpActive = true;
            setTimeout(() => powerUpActive = false, powerUpDuration);
        }
    }
}

// ✅ Auto-Shooting Bubbles (Power-Up Enabled)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = powerUpActive ? 10 : 4;
        let spread = 15; 

        for (let i = 0; i < numBubbles; i++) {
            let bubbleSize = 10 + Math.random() * 6;
            let bubbleX = player.x + player.width / 2 - bubbleSize / 2 + (Math.random() * spread - spread / 2);
            let bubbleY = player.y; 
            let bubbleSpeedOffset = Math.random() * 2; 

            bubbleArray.push({ 
                x: bubbleX, 
                y: bubbleY, 
                size: bubbleSize, 
                speed: bubbleSpeed + bubbleSpeedOffset, 
                opacity: 1.0 
            });
        }
    }, 150);
}

// ✅ Spawn Different Starfish Types
function spawnStarfish() {
    let starfishType = Math.random();
    let size = 30;
    let speed = starfishSpeed;

    if (starfishType < 0.3) { 
        size = 20; 
        speed *= 2; 
    } else if (starfishType > 0.7) { 
        size = 50; 
        speed *= 0.7;
    }

    starfishArray.push({ x: Math.random() * (canvas.width - size), y: -50, size, speed });
}
setInterval(spawnStarfish, spawnRate);

// ✅ Updated: Starfish Movement & Collision
function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        let starfish = starfishArray[i];
        starfish.y += starfish.speed;

        for (let j = 0; j < bubbleArray.length; j++) {
            let bubble = bubbleArray[j];

            let dx = bubble.x - starfish.x;
            let dy = bubble.y - starfish.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < starfish.size / 2 + bubble.size / 2) {
                starfishArray.splice(i, 1);
                bubbleArray.splice(j, 1);
                i--;
                break;
            }
        }

        if (starfish.y + starfish.size >= canvas.height - canvas.height * 0.3) {
            reefHealth--;
            starfishArray.splice(i, 1);
            i--; 
            if (reefHealth <= 0) gameOver();
        }
    }
}

// ✅ Draw Power-Up
function drawPowerUp() {
    if (powerUp) {
        ctx.fillStyle = "gold";
        ctx.beginPath();
        ctx.arc(powerUp.x, powerUp.y, powerUp.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateFloatingBear();
    drawPowerUp();
    checkPowerUpCollision();
    updateStarfish();
    drawStarfish();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start Game
gameLoop();
startAutoShooting();
