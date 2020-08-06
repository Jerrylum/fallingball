// setting start

const targetFPS = 60;
const minGroundMovesPerSec = 50;
const maxGroundMovesPerSec = 217;
const ballOnGroundMovesPerSec = 200; //  1 move = move 1 pixel left or right
const ballFlyingMovesPerSec = 100;
const ballFlyingDownPerSec = 180;
const ballFlyingDownAccele = 5;
const groundHolesProbability = { // how many holes
    // Holes: %
    1: 1,
    2: 0.2,
};

// setting end
// calc const

let isDarkMode : boolean;
let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;
let level_num : HTMLElement;
let highest_level_num : HTMLElement;
let restartBtn : HTMLElement;

// calc const end
// variable start

let nowGroundMovesPerSec : number; // 1 move = move 1 pixel up
let nowBallToLeft : boolean;
let nowBallToRight : boolean;
let nowBallOnGround : boolean;
let nowBallMovesPerSec : number;
let nowBallDownPerSec : number;
let nowLevel : number;
let lastTickGroundMove : number;
let lastTickBallMove : number;

let grounds: Array<Ground> = [];
let ball: Ball = new Ball();
let gameLoop;

let highestLevel : number;

// vairable end

function updateEvent() {
    const now: number = new Date().getTime();

    const lapA = now - lastTickGroundMove;
    const mpsA = 1000 / nowGroundMovesPerSec;
    const boolA = lapA > mpsA;

    const lapB = now - lastTickBallMove;
    const mpsB = 1000 / Math.max(nowBallMovesPerSec, nowBallDownPerSec);
    const boolB = lapB > mpsB;

    if (boolA || boolB) ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (boolA) {
        updateGrounds(lapA);
        lastTickGroundMove = now;
    }

    if (boolB) {
        updateBall(lapB);
        lastTickBallMove = now;
    }



    // display

    grounds.forEach(g => g.draw());

    ball.draw();

    level_num.innerText = nowLevel + '';
    highest_level_num.innerText = highestLevel + '';

    console.log("loop");
}

function updateGrounds(lap: number) {
    const upPixel = lap * nowGroundMovesPerSec / 1000; // TODO, improve with ball y

    let target: Ground;

    // add pixel

    grounds.forEach(g => g.y -= upPixel);

    // remove invisable ground

    while ((target = grounds[0]) != undefined) {
        if (target.y + target.blockHeight < 0) {
            nowLevel++;
            highestLevel = Math.max(nowLevel, highestLevel)
            grounds.shift();
        }
        else
            break;
    }

    // add visable ground

    const lastGround = grounds[grounds.length - 1];
    const buildHeight = Math.max(canvas.height, ball.y + ball.radius);
    let maxHeight = lastGround ? lastGround.y + lastGround.blockHeight : 60; // 60 init height

    while (maxHeight < buildHeight) {
        grounds.push(target = new Ground(maxHeight));
        maxHeight += target.topMargin + target.blockHeight;
        //console.log(maxHeight);
    }

    // update ball

    ball.y -= upPixel;

    //console.log(lap);

}

function updateBall(lap: number) {
    if (ball.y - ball.radius < 0) {
        endGame();

        return;
    }

    // down move

    const DownPixel = lap * nowBallDownPerSec / 1000;

    let touchTheGround = false;
    for (let i = 0; i <= DownPixel; i++) {
        const ballUnder = ball.y + ball.radius;

        grounds.forEach(g => {
            if (touchTheGround)
                return;

            const gap = g.y - ballUnder;

            if (gap <= 1 && gap >= 0) {
                if (g.isXRange(ball))
                    touchTheGround = true;
            }
        });

        if (touchTheGround)
            break;

        ball.y++;
    }

    // hor move

    const HorPixel = lap * nowBallMovesPerSec / 1000;

    console.log(HorPixel);
    let touchTheWall = false;
    for (let i = 0; i <= HorPixel; i++) {
        if (!touchTheGround) {
            grounds.forEach(g => {
                if (touchTheWall)
                    return;

                if (g.isYRange(ball) && g.isXRange(ball))
                    touchTheWall = true;
            });
        }

        if ((ball.x - ball.radius <= 1 && nowBallToLeft) ||
            (ball.x + ball.radius >= canvas.width-1 && nowBallToRight))
            touchTheWall = true;

        if (touchTheWall)
            break;

        ball.x += (Number(nowBallToRight) - Number(nowBallToLeft));
    }

    updateBallSpeed(touchTheGround);

}

function updateBallSpeed(isTouch) {
    if (!isTouch) // if flying, increase down speed
        nowBallDownPerSec += ballFlyingDownAccele;

    if (nowBallOnGround != isTouch) {
        if (isTouch) {
            nowGroundMovesPerSec = Math.min(nowGroundMovesPerSec + 5, maxGroundMovesPerSec);
        }
        nowBallDownPerSec = ballFlyingDownPerSec;

    }

    nowBallOnGround = isTouch;
}

function endGame() {
    clearInterval(gameLoop);
    console.log('Game over');

    ctx.textAlign = "center";
    ctx.fillStyle = isDarkMode ? '#DDD' : "#333";
    ctx.font = '40px sans-serif';
    let textString = "GAME OVER";
    ctx.fillText(textString , canvas.width/2, canvas.height/2);

    
    restartBtn.style.display = 'block';

    document.cookie = "highest=" + highestLevel;
}

function restartGame() {
    restartBtn.style.display = '';
    startGame();
}

function startGame() {
    const now: number = new Date().getTime();

    lastTickGroundMove = now;
    lastTickBallMove = now;

    nowGroundMovesPerSec = minGroundMovesPerSec; // 1 move = move 1 pixel up
    nowBallToLeft = false;
    nowBallToRight = false;
    nowBallOnGround = false;
    nowBallMovesPerSec = ballOnGroundMovesPerSec;
    nowBallDownPerSec = ballFlyingDownPerSec;
    nowLevel = 1;

    grounds = [];
    ball = new Ball();

    gameLoop = setInterval(updateEvent, 1000 / targetFPS);
}

function tryRestartGame() {
    if (restartBtn.style.display != '')
        restartGame()
}

(function () {
    isDarkMode = document.body.classList.contains('dark');
    canvas = <HTMLCanvasElement>document.getElementById("main");
    level_num = document.querySelector('#level-num');
    highest_level_num = document.querySelector('#highest-num');
    restartBtn = document.querySelector('#middle-btn');

    highestLevel = parseInt(document.cookie.split('=')[1]) || 0;

    console.log(document.cookie)

    if (canvas == null) return;

    ctx = canvas.getContext("2d");

    document.body.addEventListener('keydown', e => {
        if (e.keyCode == 37 || e.keyCode == 65) nowBallToLeft = true;
        else if (e.keyCode == 39 || e.keyCode == 68) nowBallToRight = true;
    });

    document.body.addEventListener('keyup', e => {
        if (e.keyCode == 37 || e.keyCode == 65) nowBallToLeft = false;
        else if (e.keyCode == 39 || e.keyCode == 68) nowBallToRight = false;
        else if (e.keyCode == 13) tryRestartGame();
    });

    // init

    startGame()
})();