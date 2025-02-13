let canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();

let player = {
    width: canvas.width * 0.15,  
    height: canvas.width * 0.15,  
    speed: canvas.width * 0.007, 
    img: new Image()
};

// ✅ Load player image
player.img.src = "1000084073-removebg-preview.png"; 
player.img.onload = () => console.log("✅ Player image loaded.");
player.img.onerror = () => console.error("❌ Error loading player image!");

// ✅ Backgrounds
let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; 

let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; 

let damagedReefBackground = new Image();
damagedReefBackground.src = "20250212_203814.png"; 

damagedReefBackground.onload = () => console.log("✅ Damaged reef image loaded.");
damagedReefBackground.onerror = () => console.error("❌ Error loading damaged reef image!");

// ✅ Reef Health System
let maxReefHealth = 10; 
let reefHealth = maxReefHealth;

// ✅ Starfish & Bubbles
let starfishArray = []; 
let starfishSpeed = 1.5; 
let spawnRate = 3000; 

let bubbleArray = []; 
let bubbleSpeed = 4; 

// ✅ Position the player at the bottom
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; 
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; 
}
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// ✅ Draw Reef (switches when health < 50%)
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
    let canvasRect = canvas.getBoundingClientRect();
    let touchX = event.touches[0].clientX - canvasRect.left;
    player.x = touchX - player.width / 2;
});

// ✅ Auto-Shooting Bubbles (Continuous Stream)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = 5; // Shoots 5 bubbles at a time
        let spread = 20; // Wider spread

        for (let i = 0; i < numBubbles; i++) {
            let bubbleSize = 12 + Math.random() * 8; // Randomized size
            let bubbleX = player.x + player.width / 2 - bubbleSize / 2 + (Math.random() * spread - spread / 2);
            let bubbleY = player.y; 
            let bubbleSpeedOffset = Math.random() * 2; // Different speeds

            bubbleArray.push({ 
                x: bubbleX, 
                y: bubbleY, 
                size: bubbleSize, 
                speed: bubbleSpeed + bubbleSpeedOffset,
                opacity: 1.0 // Full opacity at first
            });
        }
    }, 150); // Fires much faster (every 0.15s)
}

// ✅ Move Bubbles (Wobble & Pop Effect)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed; // Move upward
        bubble.x += Math.sin(bubble.y * 0.08) * 2; // Increased side wobble effect
        bubble.size *= 0.995; // Slightly shrink over time
        bubble.opacity -= 0.01; // Fade out slightly

        if (bubble.y < 0 || bubble.size < 6 || bubble.opacity <= 0) { // "Pop" effect
            bubbleArray.splice(i, 1);
            i--;
        }
    }
}

// ✅ Draw Bubbles (Glowing Effect)
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];
        let gradient = ctx.createRadialGradient(
            bubble.x, bubble.y, bubble.size * 0.1,
            bubble.x, bubble.y, bubble.size
        );

        gradient.addColorStop(0, `rgba(173, 216, 230, ${bubble.opacity})`); // Light blue center
        gradient.addColorStop(0.5, `rgba(135, 206, 250, ${bubble.opacity * 0.8})`); // Softer blue
        gradient.addColorStop(1, `rgba(255, 255, 255, ${bubble.opacity * 0.5})`); // White outer glow

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Draw Player
function drawPlayer() {
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}

// ✅ Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateBubbles();
    drawBubbles();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start the game
gameLoop();
startAutoShooting();
