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
let starfishImg = new Image();
starfishImg.src = "file-LUk3xAn3XcchstDVmhyxWE.png";
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
let levelUpMessageTime = 0;

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
    
function drawHealthMeter() {
    let healthPercent = reefHealth / maxReefHealth;
    let meterColor = healthPercent > 0.5 ? "green" : healthPercent > 0.2 ? "yellow" : "red";

    // 🔹 Draw the Health Bar
    ctx.fillStyle = "black";  
    ctx.fillRect(20, 20, 204, 24); // Background for visibility

    ctx.fillStyle = meterColor;  
    ctx.fillRect(22, 22, 200 * healthPercent, 20); // Actual health meter

    // 🔹 Add Text for Health Indicator
    ctx.fillStyle = "white";
    ctx.font = "bold 16px Arial";
    ctx.fillText("Reef Health", 30, 37);

    // 🔹 Display Starfish Defeated & Level Tracker (Make sure this is inside this function)
    ctx.fillStyle = "white";
    ctx.font = "bold 20px Arial";
    ctx.fillText(`Level: ${level}`, canvas.width - 120, 40); // Top-right level display
    ctx.fillText(`Starfish: ${starfishDefeated} / ${level * 30}`, canvas.width - 120, 70); // Starfish counter
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
    }, 150);
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
// ✅ Draw Starfish
function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.drawImage(starfishImg, starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, starfishArray[i].size);
    }
}

function spawnStarfish() {
    let elapsedTime = Date.now() - gameStartTime;
    console.log("Starfish spawned!");

    // 🔹 Increase spawn rate every 2 seconds (minimum 200ms)
let adjustedSpawnRate = Math.max(700, spawnRate - level * 100); // Slower scaling
    // 🔹 Adjust speed and size based on the level
    let starfishSize = 60 + Math.min(20, level * 3); // Bigger base size & scales more with levels
    let starfishSpeedAdjusted = starfishSpeed + Math.min(5, level * 0.7); // Faster every level

    // 🔹 Spawn multiple starfish based on level
    let numStarfish = Math.min(3 + Math.floor(level / 2), 6); // Up to 6 at once
    for (let i = 0; i < numStarfish; i++) {
        let xPosition = Math.random() * (canvas.width - starfishSize);
        starfishArray.push({ x: xPosition, y: -50, size: starfishSize, speed: starfishSpeedAdjusted });
    }

    setTimeout(spawnStarfish, adjustedSpawnRate);
}

function updateStarfish() {
    for (let i = starfishArray.length - 1; i >= 0; i--) {
        let starfish = starfishArray[i];
        starfish.y += starfish.speed;

        for (let j = bubbleArray.length - 1; j >= 0; j--) {
            let bubble = bubbleArray[j];

            let dx = bubble.x - starfish.x;
            let dy = bubble.y - starfish.y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < starfish.size / 2 + bubble.size / 2) {
                starfishArray.splice(i, 1);
                bubbleArray.splice(j, 1);
                i = Math.max(i - 1, 0);
                starfishDefeated++;

                checkLevelUp(); 
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

function checkLevelUp() {
    if (starfishDefeated >= level * 30) {
        level++;
        starfishDefeated = 0;
        console.log(`Level Up! Now at Level ${level}`);
        levelUpMessageTime = 200;

        starfishSpeed += 0.3;
        spawnRate = Math.max(500, spawnRate - 200);
    }
}
function drawPlayer() {
    ctx.drawImage(player.img, player.x, player.y, player.width, player.height);
}
// ✅ Game Loop
function gameLoop() {
// ✅ Display Level-Up Message
if (levelUpMessageTime > 0) {
    ctx.fillStyle = "rgba(0, 0, 0, 0.8)"; // 🔹 Dark overlay
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 🔹 Covers the whole screen

    ctx.fillStyle = "white";  // 🔹 Text color
    ctx.font = "bold 60px Arial";  // 🔹 Large font
    ctx.textAlign = "center";
    ctx.fillText(`LEVEL ${level}!`, canvas.width / 2, canvas.height / 2);

    levelUpMessageTime--;
}
    
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
spawnStarfish();
