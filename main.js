window.addEventListener('load', () => {
    const splashScreen = document.getElementById('splashScreen');

    setTimeout(() => {
        splashScreen.style.display = 'none';
    }, 3000);
});


const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

const gameOverPrompt = document.getElementById('gameOver');
const gameRestartButton = document.getElementById('restart');

const gameRestartButton2 = document.getElementById('restart2');

const gameFinish = document.getElementById('gameFinish');

let specialHeartExploded = false;
const messagePrompt = document.getElementById('specialMessage');
const messageText = document.getElementById('messageText');
const seenButton = document.getElementById('seen');

const leftButton = document.getElementById('left');
const rightButton = document.getElementById('right');
const pauseButton = document.getElementById('pause');


const pauseIcon = document.getElementById('pauseIcon');
const resumeIcon = document.getElementById('resumeIcon');
resumeIcon.style.display = 'none';

canvas.width = 400;
canvas.height = 625;

let rightPressed = false;
let leftPressed = false;

let paddleWidth = 70;
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

let paused = false;

let fireworks = []; 

const birthdayMessages = [
    "Happy birthday, Sabaa! You light up the world with your smile and brilliance. I hope your day is as beautiful as you are.",
    "Wishing the most amazing birthday to the most incredible person I know—Sabaa. May your day be filled with love, laughter, and endless joy.",
    "To my dearest Sabaa: May this year bring you all the happiness your heart can hold. You deserve the best, today and always.",
    "Happy birthday, Sabuu! You're the reason my days are brighter and my heart is fuller. Cheers to you, Sabaa!",
    "Sabaa, you make every day feel special. Today, I hope you feel as loved and cherished as you make everyone around you feel. Happy birthday!",
    "On your birthday, I just want to remind you how loved and appreciated you are. Have a birthday as wonderful as you, Sabaa!",
    "To the one who makes my heart skip a beat—happy birthday, Sabaa! You're my sunshine, now and forever.",
    "Sabaa, you deserve all the love, laughter, and cake today! Wishing you a day filled with everything that makes you happiest.",
    "Happy birthday, Sabuu! May this year be filled with beautiful moments and love that lasts a lifetime.",
    "Sabaa, you are a blessing to everyone who knows you. Wishing you a birthday filled with endless love and sweet surprises.",
    "To the most special person in my life—happy birthday, Sabaa! May all your dreams come true this year.",
    "Happy birthday to my favorite person, my rock, and my everything. I hope your day is as extraordinary as you are, Sabaa.",
    "Sabaa, on your special day, know that my heart is full of love and admiration for you. You deserve the world and more.",
    "Happy birthday to the girl who makes life sweeter. May your day be filled with everything that makes you smile, Sabaa.",
    "Sabaa, you light up my life in ways words can’t describe. Wishing you a birthday that’s as dazzling as your spirit.",
    "Your laughter is the best sound, and your happiness is my greatest wish. Happy birthday, Sabaa!",
    "Wishing you a birthday filled with sweet memories, new adventures, and all the love your heart can hold. You deserve it, Sabaa.",
    "Happy birthday, Sabuu! May this year be as bright and beautiful as you are. Always remember, you are cherished beyond words.",
    "To my sunshine on a rainy day—happy birthday, Sabaa! Your smile is worth a million dollars.",
    "Sabaa, you make the world a better place just by being you. Wishing you a birthday as wonderful as you are.",
    "Happy birthday to the person who stole my heart and never gave it back. I love you more than words can say, Sabaa.",
    "May your special day be filled with the joy you bring to others every day. Happy birthday, Sabaa!",
    "Sabaa, your mere existence makes this world a better place. Wishing you a birthday as amazing as you are.",
    "Happy birthday to my one and only, the love of my life. You make every moment so much more special, Sabaa.",
    "On this special day, I’m sending you hugs, kisses, and all the love in the world. Have a fantastic birthday, Sabaa!",
    "Happy birthday to the girl who makes life more beautiful with every smile. Wishing you love, joy, and laughter today and always.",
    "Sabaa, you're the reason I believe in love. Wishing you a birthday full of happiness and special memories.",
    "Happy birthday! May your day be filled with the same warmth and joy you bring to everyone around you, Sabaa."
];

let randomMessage = Math.floor(Math.random() * birthdayMessages.length);

const backgroundCanvas = document.getElementById('backgroundCanvas');
const backgroundCtx = backgroundCanvas.getContext('2d');
const backgroundImage = new Image();
backgroundImage.src = 'sabaa.jpg'; 

backgroundImage.onload = function() {
    backgroundCanvas.width = 400;
    backgroundCanvas.height = 625;
    backgroundCtx.drawImage(backgroundImage, 0, 0, 400, 625);
};

function drawPaddle() {
    ctx.beginPath();
    ctx.rect(paddleX, paddleY, paddleWidth, paddleHeight);
    ctx.fillStyle = "red";
    ctx.fill();
    
    
    ctx.shadowColor = "rgba(255, 0, 0, 0.6)"; 
    ctx.shadowBlur = 10; 
    ctx.shadowOffsetX = 0; 
    ctx.shadowOffsetY = 0; 
    
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    
    ctx.shadowColor = "transparent"; 
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.closePath();
}

function generateheartsPosition() {
    hearts = [];
    const heartSize = canvas.width / heartsInRow;
    let specialIndices = [];

    for (let i = 0; i < heartsInRow; i++) {
        for (let j = 0; j < heartsInColoumn; j++) {
            hearts.push({
                x: i * heartSize,
                y: j * heartSize,
                destroyed: false,
                special: false
            });
        }
    }

    
    while (specialIndices.length < 2) {
        let index = Math.floor(Math.random() * hearts.length);
        if (!specialIndices.includes(index)) {
            specialIndices.push(index);
        }
    }

    
    specialIndices.forEach(index => {
        hearts[index].special = true;
    });
}

function drawHearts() {
    for (let i = 0; i < hearts.length; i++) {
        const heart = hearts[i];
        if (!heart.destroyed) {
            drawHeart(heart.x, heart.y, heart.special);
        }
    }
}

function drawHeart(x, y, isSpecial) {
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
    ctx.fillStyle = isSpecial ? "gold" : "red";
    ctx.shadowColor = isSpecial ? "gold" : "transparent";
    ctx.shadowBlur = isSpecial ? 20 : 0;
    ctx.fill();
    ctx.strokeStyle = "black";
    ctx.stroke();
    ctx.shadowBlur = 0; 
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
            if(heart.special) {
                randomMessage = Math.floor(Math.random() * birthdayMessages.length);
                specialHeartExploded = true;
            }

            const speedIncrease = 0.1;
            const maxSpeed = 6;           
            const currentSpeed = Math.sqrt(dx * dx + dy * dy);

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
    ctx.fillStyle = "yellow";
    
    
    ctx.shadowColor = "rgba(255, 255, 0, 0.8)"; 
    ctx.shadowBlur = 15; 
    ctx.shadowOffsetX = 0; 
    ctx.shadowOffsetY = 0; 
    
    ctx.fill();
    ctx.strokeStyle = "#000000";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
    
    
    ctx.shadowColor = "rgba(0, 0, 0, 0)"; 
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
    
    for (let i = 0; i < 20; i++) {
        particles.push({
            x: x,
            y: y,
            radius: Math.random() * 8 + 4, 
            color: `hsl(${Math.random() * 360}, 100%, 50%)`,
            speed: Math.random() * 3 + 1,
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
    gameFinish.style.display = 'none';
    resetGame();
});

gameRestartButton2.addEventListener('click', () => {
    gameOverPrompt.style.display = 'none';
    gameFinish.style.display = 'none';
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

canvas.addEventListener("touchend", (e) => {
    e.preventDefault();
    leftPressed = false;
    rightPressed = false;
    gameStarted = true;
});

leftButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    leftPressed = true;
    rightPressed = false;
    gameStarted = true;
});

rightButton.addEventListener('touchstart', (e) => {
    e.preventDefault();
    rightPressed = true;
    leftPressed = false;
    gameStarted = true;
});

leftButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    leftPressed = false;
    gameStarted = true;
});

rightButton.addEventListener('touchend', (e) => {
    e.preventDefault();
    rightPressed = false;
    gameStarted = true;
});

seenButton.addEventListener('click', () => {
    specialHeartExploded = false;
    messagePrompt.style.display = 'none';
    paused = false;
})

pauseButton.addEventListener('click', () => {
    paused = !paused; // Toggle the paused state    
    if(paused) {
        pauseIcon.style.display = 'none';
        resumeIcon.style.display = 'block';
    } else {
        pauseIcon.style.display = 'block';
        resumeIcon.style.display = 'none';
    }
});

generateheartsPosition();

function createFireworks(x, y) {
    for (let i = 0; i < 50; i++) { 
        fireworks.push({
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

function updateFireworks() {
    fireworks.forEach((particle, index) => {
        particle.x += Math.cos(particle.angle) * particle.speed;
        particle.y += Math.sin(particle.angle) * particle.speed;
        particle.alpha -= 0.02; 

        if (particle.alpha <= 0) {
            fireworks.splice(index, 1); 
        }
    });
}

function drawFireworks() {
    fireworks.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${hexToRgb(particle.color)}, ${particle.alpha})`;
        ctx.fill();
        ctx.closePath();
    });
}


function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPaddle();
    drawBall();

    if (!paused && !gameEnded) { 
        if (gameStarted) {
            gameOverPrompt.style.display = 'none';
            moveBall();
            detectCollision();
        }

        if (specialHeartExploded && !gameEnded) { // Prevent special heart popup after game finish
            messagePrompt.style.display = 'block';
            messageText.innerText = birthdayMessages[randomMessage];
            paused = true; 
        }

        const gameOver = hearts.filter(h => h.destroyed === true).length === (heartsInColoumn * heartsInRow);
        if (gameOver) {
            gameFinish.style.display = 'block';
            gameEnded = true; // Ensure no other actions occur post-game finish
            if (fireworks.length === 0) { 
                for (let i = 0; i < 5; i++) { 
                    createFireworks(
                        Math.random() * canvas.width, 
                        Math.random() * (canvas.height / 2) 
                    );
                }
            }
            drawFireworks();
            updateFireworks();
        }

        movePaddle();
        drawHearts();
        updateParticles();
        drawParticles();
    }

    if(gameEnded) {
        gameOverPrompt.style.display = 'block';
    }

    requestAnimationFrame(gameLoop);
}

gameLoop();
