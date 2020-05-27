// setting start
var targetFPS = 60;
var minGroundMovesPerSec = 50;
var maxGroundMovesPerSec = 215;
var ballOnGroundMovesPerSec = 200; //  1 move = move 1 pixel left or right
var ballFlyingMovesPerSec = 100;
var ballFlyingDownPerSec = 180;
var ballFlyingDownAccele = 5;
var groundHolesProbability = {
    // Holes: %
    1: 1,
    2: 0.2
};
// setting end
// calc const
var canvas;
var ctx;
// calc const end
// variable start
var nowGroundMovesPerSec = minGroundMovesPerSec; // 1 move = move 1 pixel up
var nowBallToLeft = false;
var nowBallToRight = false;
var nowBallOnGround = false;
var nowBallMovesPerSec = ballOnGroundMovesPerSec;
var nowBallDownPerSec = ballFlyingDownPerSec;
var nowLevel = 1;
var lastTickGroundMove = 0;
var lastTickBallMove = 0;
var grounds = [];
var ball = new Ball();
// vairable end
function updateEvent() {
    var now = new Date().getTime();
    var lapA = now - lastTickGroundMove;
    var mpsA = 1000 / nowGroundMovesPerSec;
    var boolA = lapA > mpsA;
    var lapB = now - lastTickBallMove;
    var mpsB = 1000 / Math.max(nowBallMovesPerSec, nowBallDownPerSec);
    var boolB = lapB > mpsB;
    if (boolA || boolB)
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (boolA) {
        updateGrounds(lapA);
        lastTickGroundMove = now;
    }
    if (boolB) {
        updateBall(lapB);
        lastTickBallMove = now;
    }
    // display
    grounds.forEach(function (g) { return g.draw(); });
    ball.draw();
    console.log("loop");
}
function updateGrounds(lap) {
    var upPixel = lap * nowGroundMovesPerSec / 1000; // TODO, improve with ball y
    var target;
    // add pixel
    grounds.forEach(function (g) { return g.y -= upPixel; });
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
    var lastGround = grounds[grounds.length - 1];
    var buildHeight = Math.max(canvas.height, ball.y + ball.radius);
    var maxHeight = lastGround ? lastGround.y + lastGround.blockHeight : 60; // 60 init height
    while (maxHeight < buildHeight) {
        grounds.push(target = new Ground(maxHeight));
        maxHeight += target.topMargin + target.blockHeight;
        //console.log(maxHeight);
    }
    // update ball
    ball.y -= upPixel;
    //console.log(lap);
}
function updateBall(lap) {
    if (ball.y - ball.radius < 0)
        alert("Game Over");
    // down move
    var DownPixel = lap * nowBallDownPerSec / 1000;
    var touchTheGround = false;
    var _loop_1 = function (i) {
        var ballUnder = ball.y + ball.radius;
        grounds.forEach(function (g) {
            if (touchTheGround)
                return;
            var gap = g.y - ballUnder;
            if (gap <= 1 && gap >= 0) {
                if (g.isXRange(ball))
                    touchTheGround = true;
            }
        });
        if (touchTheGround)
            return "break";
        ball.y++;
    };
    for (var i = 0; i <= DownPixel; i++) {
        var state_1 = _loop_1(i);
        if (state_1 === "break")
            break;
    }
    // hor move
    var HorPixel = lap * nowBallMovesPerSec / 1000;
    console.log(HorPixel);
    var touchTheWall = false;
    for (var i = 0; i <= HorPixel; i++) {
        if (!touchTheGround) {
            grounds.forEach(function (g) {
                if (touchTheWall)
                    return;
                if (g.isYRange(ball) && g.isXRange(ball))
                    touchTheWall = true;
            });
        }
        if ((ball.x - ball.radius <= 1 && nowBallToLeft) ||
            (ball.x + ball.radius >= canvas.width - 1 && nowBallToRight))
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
    canvas = document.getElementById("main");
    if (canvas == null)
        return;
    ctx = canvas.getContext("2d");
    document.body.addEventListener('keydown', function (e) {
        if (e.keyCode == 37)
            nowBallToLeft = true;
        else if (e.keyCode == 39)
            nowBallToRight = true;
    });
    document.body.addEventListener('keyup', function (e) {
        if (e.keyCode == 37)
            nowBallToLeft = false;
        else if (e.keyCode == 39)
            nowBallToRight = false;
    });
    // init
    var now = new Date().getTime();
    lastTickGroundMove = now;
    lastTickBallMove = now;
    setInterval(updateEvent, 1000 / targetFPS);
})();
