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

// ✅ Ensure the player image loads properly
player.img.src = "1000084073-removebg-preview.png"; 

let oceanBackground = new Image();
oceanBackground.src = "Screenshot_20250212_201625_Gallery.png"; 

let reefBackground = new Image();
reefBackground.src = "Screenshot_20250212_120847_Chrome.png"; 

let damagedReefBackground = new Image();
damagedReefBackground.src = "20250212_203814.png"; 

// ✅ Reef health system
let maxReefHealth = 10; 
let reefHealth = maxReefHealth; 

// ✅ Starfish and Bubble variables
let starfishArray = []; 
let starfishSpeed = 1.5; 
let spawnRate = 3000; 

let bubbleArray = []; 
let bubbleSpeed = 4; 

// ✅ Position the player at the bottom center of the screen
function resetPlayerPosition() {
    let reefHeight = canvas.height * 0.3; 
    player.x = canvas.width / 2 - player.width / 2;
    player.y = canvas.height - reefHeight - player.height * 1.5; 
}
window.addEventListener("resize", resetPlayerPosition);
resetPlayerPosition();

// ✅ Draw the reef (switches when health < 50%)
function drawReef() {
    let reefHeight = canvas.height * 0.3;
    let reefY = canvas.height - reefHeight;

    if (reefHealth > maxReefHealth * 0.5) {
        ctx.drawImage(reefBackground, 0, reefY, canvas.width, reefHeight);
    } else {
        ctx.drawImage(damagedReefBackground, 0, reefY, canvas.width, reefHeight);
    }
}

// ✅ Player Movement (Keyboard & Touchscreen)
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

    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
});

// ✅ Auto-Shooting Bubbles
function startAutoShooting() {
    setInterval(() => {
        let bubbleSize = 15; 
        let bubbleX = player.x + player.width / 2 - bubbleSize / 2; 
        let bubbleY = player.y; 

        bubbleArray.push({ x: bubbleX, y: bubbleY, size: bubbleSize });
    }, 500);
}

// ✅ Move bubbles upward
function updateBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        bubbleArray[i].y -= bubbleSpeed; 

        if (bubbleArray[i].y < 0) {
            bubbleArray.splice(i, 1);
            i--;
        }
    }
}

// ✅ Draw bubbles
function drawBubbles() {
    for (let i = 0; i < bubbleArray.length; i++) {
        ctx.fillStyle = "lightblue"; 
        ctx.beginPath();
        ctx.arc(bubbleArray[i].x, bubbleArray[i].y, bubbleArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Starfish movement and collision with bubbles
function updateStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        starfishArray[i].y += starfishSpeed;

        for (let j = 0; j < bubbleArray.length; j++) {
            let dx = bubbleArray[j].x - starfishArray[i].x;
            let dy = bubbleArray[j].y - starfishArray[i].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < starfishArray[i].size / 2 + bubbleArray[j].size / 2) {
                starfishArray.splice(i, 1);
                bubbleArray.splice(j, 1);
                i--; 
                j--;
                break;
            }
        }

        if (starfishArray[i]?.y + starfishArray[i]?.size >= canvas.height - canvas.height * 0.3) {
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

// ✅ Draw starfish
function drawStarfish() {
    for (let i = 0; i < starfishArray.length; i++) {
        ctx.fillStyle = "red"; 
        ctx.beginPath();
        ctx.arc(starfishArray[i].x, starfishArray[i].y, starfishArray[i].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// ✅ Health Bar
function drawHealthMeter() {
    let meterWidth = 200;
    let meterHeight = 20;
    let meterX = 20;
    let meterY = 20;
    
    let healthPercent = reefHealth / maxReefHealth;
    let meterColor = healthPercent > 0.5 ? "green" : healthPercent > 0.2 ? "yellow" : "red";

    ctx.fillStyle = "gray";
    ctx.fillRect(meterX, meterY, meterWidth, meterHeight);
    
    ctx.fillStyle = meterColor;
    ctx.fillRect(meterX, meterY, meterWidth * healthPercent, meterHeight);

    ctx.strokeStyle = "black";
    ctx.strokeRect(meterX, meterY, meterWidth, meterHeight);
}

// ✅ Game Over
function gameOver() {
    cancelAnimationFrame(gameLoop);
    setTimeout(() => {
        alert("The reef has been destroyed! Refresh to play again.");
    }, 500);
}

// ✅ Game Loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(oceanBackground, 0, 0, canvas.width, canvas.height - canvas.height * 0.3);
    drawReef();
    updateStarfish();
    updateBubbles();
    drawBubbles();
    drawStarfish();
    drawPlayer();
    drawHealthMeter();
    if (reefHealth > 0) requestAnimationFrame(gameLoop);
}

// ✅ Start the game
setInterval(() => {
    let starfishSize = 30;
    let xPosition = Math.random() * (canvas.width - starfishSize);
    starfishArray.push({ x: xPosition, y: 0, size: starfishSize });
}, spawnRate);

gameLoop();
startAutoShooting();
