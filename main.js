const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const gameOverPrompt = document.getElementById('gameOver');
const gameRestartButton = document.getElementById('restart');

const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');

canvas.width = 300;
canvas.height = 425;

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

let bricks = [];

let gameStarted = false;
let gameEnded = false;

const img = new Image();

img.src = 'sabaa.jpg';

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "#8f1d6e";
    ctx.fill();
    ctx.closePath();
}

function generateBricksPosition() {
    bricks = [];
    const bricksInRow = 6;
    const bricksInColoumn = 5;
    const brickWidth = canvas.width / bricksInRow;
    const brickHeight = brickWidth;
    const offsetTop = 2;
    const offsetLeft = 2;

    for (let i = 0; i < bricksInRow; i++) {
        for (let j = 0; j < bricksInColoumn; j++) {
            const brickX = offsetLeft + i * (brickWidth);
            const brickY = offsetTop + j * (brickHeight);
            bricks.push({
                x: brickX,
                y: brickY,
                destroyed: false
            });
        }
    }
}

function drawBricks() {
    const bricksInRow = 5;
    const brickWidth = canvas.width / bricksInRow;
    const brickHeight = brickWidth;

    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];
        if (!brick.destroyed) {
            ctx.fillStyle = '#8f1d6e';
            ctx.fillRect(brick.x, brick.y, brickWidth, brickHeight);
        }
    }
}

function detectCollision() {
    for (let i = 0; i < bricks.length; i++) {
        const brick = bricks[i];

        if (brick.destroyed) continue;

        if (
            ballX > brick.x &&
            ballX < brick.x + canvas.width / 5 &&
            ballY > brick.y &&
            ballY < brick.y + canvas.width / 5
        ) {
            dy = -dy;
            brick.destroyed = true;
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

        const speed = Math.sqrt(newDx * newDx + newDy * newDy);
        const normalizedSpeed = 4;

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

function resetGame() {
    gameStarted = false;
    gameEnded = false;
    paddleX = canvas.width / 2 - paddleWidth / 2;
    paddleY = canvas.height - paddleHeight;
    ballX = paddleX;
    ballY = paddleY - 10;
    dx = initialDx;
    dy = initialDy;
    generateBricksPosition();
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


// Add touch event listeners
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

// Update button event listeners for mobile compatibility
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

generateBricksPosition();

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
    drawBricks();
    img.onload = function () {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    };

    requestAnimationFrame(gameLoop);
}

gameLoop();
