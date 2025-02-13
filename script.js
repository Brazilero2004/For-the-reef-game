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
    img: new Image()
};
player.img.src = "1000084073-removebg-preview.png"; 
player.img.onload = () => console.log("✅ Player image loaded.");
player.img.onerror = () => console.error("❌ Error loading player image!");

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
let spawnRate = 2000; // 🔹 Starfish now spawn every 2 seconds

let bubbleArray = []; 
let bubbleSpeed = 10; // 🔹 Increased speed so bubbles travel higher

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

// ✅ Auto-Shooting Bubbles (Continuous Stream)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = 4;
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
    }, 200);
}

// ✅ Move Bubbles (Higher Reach)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed; // Move upward faster
        bubble.x += Math.sin(bubble.y * 0.05) * 2; // Wobble effect
        bubble.opacity -= 0.015; // Slower fade-out

        if (bubble.y < -50 || bubble.opacity <= 0) { // 🔹 Lifespan extended to allow higher reach
            bubbleArray.splice(i, 1);
            i--;
        }
    }
}

// ✅ Draw Bubbles
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];
        let gradient = ctx.createRadialGradient(
            bubble.x, bubble.y, bubble.size * 0.2,
            bubble.x, bubble.y, bubble.size
        );

        gradient.addColorStop(0, `rgba(173, 216, 230, ${bubble.opacity})`); 
        gradient.addColorStop(0.5, `rgba(135, 206, 250, ${bubble.opacity * 0.8})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${bubble.opacity * 0.5})`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Spawn & Move Starfish
function spawnStarfish() {
    let starfishSize = 30;
    let xPosition = Math.random() * (canvas.width - starfishSize);
    starfishArray.push({ x: xPosition, y: -50, size: starfishSize }); // 🔹 Start slightly off-screen
}
setInterval(spawnStarfish, spawnRate);

function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        let starfish = starfishArray[i];
        starfish.y += starfishSpeed; 

        // 🔹 Check if starfish reaches reef
        if (starfish.y + starfish.size >= canvas.height - canvas.height * 0.3) {
            reefHealth--;
            starfishArray.splice(i, 1);
            i--;
            if (reefHealth <= 0) gameOver();
        }
    }
}

function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; // 🔹 Temporary color until images are used
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Draw Player, Starfish & Health Meter
function drawPlayer() {
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}

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

// ✅ Game Loop (Ensures Auto Start)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateBubbles();
    drawBubbles();
    updateStarfish();
    drawStarfish();
    drawHealthMeter();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start Game
gameLoop();
startAutoShooting();
