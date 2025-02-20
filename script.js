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

// ✅ Difficulty Scaling (Increased Intensity)
let gameStartTime = Date.now();
let level = 1;
let starfishDefeated = 0;

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
    }, 150); // 🔹 Faster bubble shooting
}

// ✅ Move Bubbles (Higher Reach)
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];

        bubble.y -= bubble.speed;
        bubble.x += Math.sin(bubble.y * 0.05) * 2;
        bubble.opacity -= 0.015;

        if (bubble.y < -50 || bubble.opacity <= 0) {
            bubbleArray.splice(i, 1);
            i--;
        }
    }
}

// ✅ Draw Bubbles
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        let bubble = bubbleArray[i];
        ctx.fillStyle = "lightblue";
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function spawnStarfish() {
    let elapsedTime = Date.now() - gameStartTime;

    // 🔹 Adjust spawn rate over time (minimum 300ms)
    let adjustedSpawnRate = Math.max(300, spawnRate - Math.floor(elapsedTime / 2000));

    // 🔹 Randomly determine starfish size and speed
    let starfishSize = 30 + Math.min(15, Math.floor(elapsedTime / 10000));
    let xPosition = Math.random() * (canvas.width - starfishSize);
    let speed = starfishSpeed + Math.min(3, elapsedTime / 20000); // 🔹 Gradually increase speed over time

    // ✅ Ensure new starfish are added to the game
    starfishArray.push({ x: xPosition, y: -50, size: starfishSize, speed: speed });

    // ✅ Schedule next starfish spawn
    setTimeout(spawnStarfish, adjustedSpawnRate);
}

// ✅ Ensure spawning starts when the game begins
setTimeout(spawnStarfish, spawnRate);

function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        let starfish = starfishArray[i];
        starfish.y += starfish.speed;

        // 🔹 Check for collision with bubbles
        for (let j = 0; j < bubbleArray.length; j++) {
            let bubble = bubbleArray[j];

            let dx = bubble.x - starfish.x;
            let dy = bubble.y - starfish.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < starfish.size / 2 + bubble.size / 2) {
                bubbleArray.splice(j, 1); // ✅ Remove bubble first
                starfishArray.splice(i, 1); // ✅ Then remove starfish
                starfishDefeated++; // ✅ Only update starfishDefeated after removal
                checkLevelUp(); // ✅ Check if level needs to increase
                i--; 
                break;
            }
        }

        // 🔹 Check if starfish reaches reef
        if (starfish.y + starfish.size >= canvas.height - canvas.height * 0.3) {
            reefHealth--; 
            starfishArray.splice(i, 1);
            i--; 

            if (reefHealth <= 0) gameOver(); 
        }
    }
}

// ✅ Draw Starfish
function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; 
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Draw Player & Health Meter
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

// ✅ Game Loop
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
