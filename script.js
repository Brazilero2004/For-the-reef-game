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
}); // ✅ Closing brace fixed

canvas.addEventListener("touchmove", function(event) {
    event.preventDefault();
    let touchX = event.touches[0].clientX;
    player.x = touchX - player.width / 2;
});

// ✅ Auto-Shooting Bubbles (Higher & Bigger)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = powerUpActive ? 10 : 4; 
        let spread = 10; 

        for (let i = 0; i < numBubbles; i++) {
            let bubbleSize = 25 + Math.random() * 10; 
            let bubbleX = player.x + player.width / 2 - bubbleSize / 2 + (Math.random() * spread - spread / 2);
            let bubbleY = player.y - 20; 
            let bubbleSpeedOffset = Math.random() * 2;

            bubbleArray.push({ 
                x: bubbleX, 
                y: bubbleY, 
                size: bubbleSize, 
                speed: bubbleSpeed * 1.5 + bubbleSpeedOffset, 
                opacity: 1.0 
            });
        }
    }, powerUpActive ? 80 : 160);
}

// ✅ Move Bubbles (Fixed)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed * 1.5;
        bubble.x += Math.sin(bubble.y * 0.02) * 3; 
        bubble.opacity -= 0.005;

        if (bubble.y < -300 || bubble.opacity <= 0) { 
            bubbleArray.splice(i, 1);
            i--;
        }
    } // ✅ Closing brace added
}

// ✅ Game Loop (Fixed)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateFloatingBear();
    updateBubbles();
    drawBubbles();
    checkBubbleCollisions();
    updateStarfish();
    drawStarfish();
    drawHealthMeter();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start Game (Fixed)
gameLoop();
startAutoShooting();
