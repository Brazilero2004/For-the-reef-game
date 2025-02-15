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
    floatOffset: 0,  
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

// ✅ Position Player at Bottom
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; 
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; 
}
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// ✅ Floating Effect for Polar Bear
function updateFloatingBear() {
    player.floatOffset += player.floatDirection * 0.5;
    if (player.floatOffset > 5 || player.floatOffset < -5) {
        player.floatDirection *= -1;
    }
}

// ✅ Draw Reef
function drawReef() {
    let reefHeight = canvas.height * 0.3;
    let reefY = canvas.height - reefHeight;
    if (reefHealth > maxReefHealth * 0.5) {
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
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

// ✅ Auto-Shooting Bubbles (Fixed)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = powerUpActive ? 10 : 4; // 🔹 Power-up increases bubbles
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
    }, powerUpActive ? 100 : 200); // 🔹 Faster bubbles when power-up is active
}

// ✅ Move Bubbles (Fixed)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed; // 🔹 Move bubbles upward
        bubble.x += Math.sin(bubble.y * 0.05) * 2; // 🔹 Slight wave movement
        bubble.opacity -= 0.015; // 🔹 Bubbles fade slightly as they rise

        if (bubble.y < -50 || bubble.opacity <= 0) {
            bubbleArray.splice(i, 1); // 🔹 Remove bubbles off-screen
            i--;
        }
    }
}

// ✅ Draw Bubbles (Fixed)
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];
        ctx.fillStyle = `rgba(173, 216, 230, ${bubble.opacity})`; // 🔹 Light blue bubbles with fading
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Spawn & Move Starfish (Reef Now Takes Damage)
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

function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        let starfish = starfishArray[i];
        starfish.y += starfish.speed;

        if (starfish.y + starfish.size >= canvas.height - canvas.height * 0.3) {
            reefHealth--; // ✅ Now damages the reef
            starfishArray.splice(i, 1);
            i--; 
            if (reefHealth <= 0) gameOver();
        }
    }
}

// ✅ Draw Player & Starfish
function drawPlayer() {
    ctx.drawImage(player.img, player.x, player.y + player.floatOffset, player.width, player.height);
}

function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; 
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Draw Health Meter
function drawHealthMeter() {
    let healthPercent = reefHealth / maxReefHealth;
    let meterColor = healthPercent > 0.5 ? "green" : healthPercent > 0.2 ? "yellow" : "red";

    ctx.fillStyle = meterColor;
    ctx.fillRect(20, 20, 200 * healthPercent, 20);
}

// ✅ Game Over
function gameOver() {
    alert("The reef has been destroyed! Refresh to play again.");
}

// ✅ Game Loop (Fixed)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateFloatingBear();
    updateBubbles();
    drawBubbles();
    updateStarfish();
    drawStarfish();
    drawHealthMeter();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start Game (Fixed)
gameLoop();
startAutoShooting();
