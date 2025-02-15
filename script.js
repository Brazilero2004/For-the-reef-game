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

// ✅ Auto-Shooting Bubbles (Bigger & Higher)
function startAutoShooting() {
    setInterval(() => {
        let numBubbles = powerUpActive ? 10 : 4; // 🔹 More bubbles when power-up is active
        let spread = 10; 

        for (let i = 0; i < numBubbles; i++) {
            let bubbleSize = 20 + Math.random() * 10; // 🔹 Larger bubbles
            let bubbleX = player.x + player.width / 2 - bubbleSize / 2 + (Math.random() * spread - spread / 2);
            let bubbleY = player.y - 20; // 🔹 Starts above the player
            let bubbleSpeedOffset = Math.random() * 2; 

            bubbleArray.push({ 
                x: bubbleX, 
                y: bubbleY, 
                width: bubbleSize * 1.2, // 🔹 Slightly oval
                height: bubbleSize, 
                speed: bubbleSpeed + bubbleSpeedOffset, 
                opacity: 1.0 // 🔹 Stronger visibility
            });
        }
    }, powerUpActive ? 70 : 160); // 🔹 Faster bubbles when power-up is active
}

// ✅ Move Bubbles (Higher & More Visible)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed; // 🔹 Move bubbles higher
        bubble.x += Math.sin(bubble.y * 0.04) * 2; // 🔹 Wavy motion
        bubble.opacity -= 0.005; // 🔹 Slower fade effect

        if (bubble.y < -150 || bubble.opacity <= 0) { // 🔹 Bubbles reach higher before disappearing
            bubbleArray.splice(i, 1);
            i--;
        }
    }
}

// ✅ Draw Bubbles (Brighter & Oval Shaped)
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        // 🔹 Outer glow effect
        ctx.fillStyle = `rgba(135, 206, 250, ${bubble.opacity * 0.6})`;
        ctx.beginPath();
        ctx.ellipse(bubble.x, bubble.y, bubble.width * 1.2, bubble.height * 1.2, 0, 0, Math.PI * 2);
        ctx.fill();

        // 🔹 Inner brighter core
        ctx.fillStyle = `rgba(173, 216, 230, ${bubble.opacity})`;
        ctx.beginPath();
        ctx.ellipse(bubble.x, bubble.y, bubble.width, bubble.height, 0, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Bubble-Starfish Collision Fix
function checkBubbleCollisions() {
    for (let i = 0; i < bubbleArray.length; i++) {
        for (let j = 0; j < starfishArray.length; j++) {
            let bubble = bubbleArray[i];
            let starfish = starfishArray[j];

            let dx = bubble.x - starfish.x;
            let dy = bubble.y - starfish.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < bubble.width / 2 + starfish.size / 2) {
                bubbleArray.splice(i, 1); // 🔹 Remove bubble
                starfishArray.splice(j, 1); // 🔹 Remove starfish
                i--; // 🔹 Prevent skipping next bubble
                break;
            }
        }
    }
}

// ✅ Game Loop (Fixed)
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateFloatingBear();
    updateBubbles();
    drawBubbles();
    checkBubbleCollisions(); // 🔹 Ensures starfish are removed by bubbles
    updateStarfish();
    drawStarfish();
    drawHealthMeter();
    drawPlayer();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start Game (Fixed)
gameLoop();
startAutoShooting();
