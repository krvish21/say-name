const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const gameOverPrompt = document.getElementById('gameOver');
const gameRestartButton = document.getElementById('restart');

const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

canvas.width = 400;
canvas.height = 625;

let rightPressed = false;
let leftPressed = false;

let paddleWidth = 50;
let paddleHeight = 15;
let paddleX = canvas.width / 2 - paddleWidth / 2;
let paddleY = canvas.height - paddleHeight;

let ballRadius = 10;
let initialDx = 2;
let initialDy = -2;
let dx = initialDx;
let dy = initialDy;
let ballX = paddleX;
let ballY = paddleY - 10;

let hearts = [];
const heartsInRow = 5;
const heartsInColoumn = 5;

let particles = [];

let gameStarted = false;
let gameEnded = false;

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function generateheartsPosition() {
    hearts = [];
    const heartSize = canvas.width / heartsInRow;

    for (let i = 0; i < heartsInRow; i++) {
        for (let j = 0; j < heartsInColoumn; j++) {
            hearts.push({
                x: i * heartSize,
                y: j * heartSize,
                destroyed: false
            });
        }
    }
}

function drawHearts() {
    for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];
        if (!heart.destroyed) {
            drawHeart(heart.x, heart.y);
        }
    }
}

function drawHeart(x, y) {
    const size = 60;
    x = x + size / 2 + 10;
    y = y + 5;

    ctx.beginPath();
    ctx.moveTo(x, y + size / 4);    
    ctx.bezierCurveTo(
        x - size / 2, y - size / 2,
        x - size, y + size / 2,    
        x, y + size               
    );
    ctx.bezierCurveTo(
        x + size, y + size / 2,   
        x + size / 2, y - size / 2,
        x, y + size / 4          
    );
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
}

function detectCollision() {
    for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];

        if (heart.destroyed) continue;

        if (
            ballX > heart.x &&
            ballX < heart.x + canvas.width / 5 &&
            ballY > heart.y &&
            ballY < heart.y + canvas.width / 5
        ) {
            dy = -dy;
            heart.destroyed = true;
            createExplosion(heart.x, heart.y);

            // Increase ball speed slightly
            const speedIncrease = 0.1; // Adjust the increment as needed
            const maxSpeed = 6; // Set a maximum speed limit

            // Calculate the current speed
            const currentSpeed = Math.sqrt(dx * dx + dy * dy);

            // Ensure the speed doesn't exceed the maximum limit
            if (currentSpeed + speedIncrease <= maxSpeed) {
                const speed = currentSpeed + speedIncrease;
                const angle = Math.atan2(dy, dx);

                dx = Math.cos(angle) * speed;
                dy = Math.sin(angle) * speed;
            }

            break;
        }
    }
}


function drawBall() {
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = "#8f1d6e";
    ctx.fill();
    ctx.closePath();
}

function moveBall() {
    ballX += dx;
    ballY += dy;

    if (ballX + dx > canvas.width - ballRadius || ballX + dx < ballRadius) {
        dx = -dx;
    }

    if (ballY + dy < ballRadius) {
        dy = -dy;
    } else if (
        ballY + dy > paddleY - ballRadius &&
        ballY + dy < paddleY + paddleHeight &&
        ballX > paddleX &&
        ballX < paddleX + paddleWidth
    ) {
        dy = -dy;

        const relativeHitPos = (ballX - (paddleX + paddleWidth / 2)) / (paddleWidth / 2);
        const maxBounceAngle = Math.PI / 3;
        const angle = relativeHitPos * maxBounceAngle;

        const newDx = 4 * Math.sin(angle);
        const newDy = -Math.abs(dy);

        // Normalize speed to maintain consistency
        const speed = Math.sqrt(newDx * newDx + newDy * newDy);
        const normalizedSpeed = Math.sqrt(dx * dx + dy * dy);

        dx = (newDx / speed) * normalizedSpeed;
        dy = (newDy / speed) * normalizedSpeed;
    } else if (ballY + dy > canvas.height - ballRadius) {
        gameEnded = true;
    }
}

function movePaddle() {
    if (rightPressed && paddleX < canvas.width - paddleWidth) {
        paddleX += 3;
    } else if (leftPressed && paddleX > 0) {
        paddleX -= 3;
    }
}

function createExplosion(x, y) {
    for (let i = 0; i < 100; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 5 + 2, 
            color: `hsl(${Math.random() * 360}, 100%, 50%)`, 
            speed: Math.random() * 4 + 1, 
            angle: Math.random() * Math.PI * 2, 
            alpha: 1 
        });
    }
}

function updateParticles() {
    particles.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.alpha -= 0.02; 

        if (particle.alpha <= 0) {
            particles.splice(index, 1);
        }
    });
}

function drawHeartParticles(x, y, size, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(size / 100, size / 100);
    ctx.beginPath();
    ctx.moveTo(0, 30);
    ctx.bezierCurveTo(-50, -50, -100, 50, 0, 100);
    ctx.bezierCurveTo(100, 50, 50, -50, 0, 30);
    ctx.fillStyle = `rgba(${hexToRgb(color)}, ${alpha})`;
    ctx.fill();
    ctx.restore();
}

function drawParticles() {
    particles.forEach(particle => {
        drawHeartParticles(particle.x, particle.y, particle.radius, particle.color, particle.alpha);
    });
}

function hexToRgb(color) {
    const div = document.createElement('div');
    div.style.color = color;
    document.body.appendChild(div);
    const rgb = getComputedStyle(div).color;
    document.body.removeChild(div);
    return rgb.match(/\d+/g).join(',');
}

function resetGame() {
    gameStarted = false;
    gameEnded = false;
    paddleX = canvas.width / 2 - paddleWidth / 2;
    paddleY = canvas.height - paddleHeight;
    ballX = paddleX;
    ballY = paddleY - 10;
    dx = initialDx;
    dy = initialDy;
    generateheartsPosition();
}

document.addEventListener("keydown", keyDownHandler);
document.addEventListener("keyup", keyUpHandler);

function keyDownHandler(e) {
    gameStarted = true;
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = true;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = true;
    }
}

function keyUpHandler(e) {
    if (e.key === "Right" || e.key === "ArrowRight") {
        rightPressed = false;
    } else if (e.key === "Left" || e.key === "ArrowLeft") {
        leftPressed = false;
    }
}

gameRestartButton.addEventListener('click', () => {
    gameOverPrompt.style.display = 'none';
    resetGame();
});



canvas.addEventListener("touchstart", handleTouchStart);
canvas.addEventListener("touchmove", handleTouchMove);

function handleTouchStart(e) {
    gameStarted = true;

    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        leftPressed = true;
        rightPressed = false;
    } else {
        rightPressed = true;
        leftPressed = false;
    }
}

function handleTouchMove(e) {
    const touchX = e.touches[0].clientX;
    if (touchX < canvas.width / 2) {
        leftPressed = true;
        rightPressed = false;
    } else {
        rightPressed = true;
        leftPressed = false;
    }
}

canvas.addEventListener("touchend", () => {
    leftPressed = false;
    rightPressed = false;
    gameStarted = true;
});

leftButton.addEventListener('touchstart', () => {
    leftPressed = true;
    rightPressed = false;
    gameStarted = true;
});

rightButton.addEventListener('touchstart', () => {
    rightPressed = true;
    leftPressed = false;
    gameStarted = true;
});

leftButton.addEventListener('touchend', () => {
    leftPressed = false;
    gameStarted = true;
});

rightButton.addEventListener('touchend', () => {
    rightPressed = false;
    gameStarted = true;
});

generateheartsPosition();

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();

    if (gameStarted) {
        gameOverPrompt.style.display = 'none';
        moveBall();
        detectCollision();
    }

    if (gameEnded) {
        gameOverPrompt.style.display = 'block';
    }

    movePaddle();
    drawHearts();
    updateParticles();
    drawParticles();

    requestAnimationFrame(gameLoop);
}

gameLoop();
