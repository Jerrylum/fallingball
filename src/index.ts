// setting start

const targetFPS = 60;
const minGroundMovesPerSec = 50;
const maxGroundMovesPerSec = 215;
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

let canvas: HTMLCanvasElement;
let ctx: CanvasRenderingContext2D;

// calc const end
// variable start

let nowGroundMovesPerSec = minGroundMovesPerSec; // 1 move = move 1 pixel up
let nowBallToLeft = false;
let nowBallToRight = false;
let nowBallOnGround = false;
let nowBallMovesPerSec = ballOnGroundMovesPerSec;
let nowBallDownPerSec = ballFlyingDownPerSec;
let nowLevel = 1;
let lastTickGroundMove = 0;
let lastTickBallMove = 0;

let grounds: Array<Ground> = [];
let ball: Ball = new Ball();

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
    if (ball.y - ball.radius < 0)
        alert("Game Over");

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

(function () {
    canvas = <HTMLCanvasElement>document.getElementById("main");

    if (canvas == null) return;

    ctx = canvas.getContext("2d");

    document.body.addEventListener('keydown', e => {
        if (e.keyCode == 37) nowBallToLeft = true;
        else if (e.keyCode == 39) nowBallToRight = true;
    });

    document.body.addEventListener('keyup', e => {
        if (e.keyCode == 37) nowBallToLeft = false;
        else if (e.keyCode == 39) nowBallToRight = false;
    });

    // init

    const now: number = new Date().getTime();

    lastTickGroundMove = now;
    lastTickBallMove = now;

    setInterval(updateEvent, 1000 / targetFPS);
})();