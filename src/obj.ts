function inRangeRandom(min, max) {
    return Math.random() * (max - min + 1) + min;
}

class Block {
    x: number;
    width: number;
    rightMargin: number;
    static minWidth = 100;
    static minRightMargin = 30;
    static maxRightMargin = 40;

    constructor(startX: number, holesLeft: number) {
        const blocksLeft = holesLeft; // no add 1
        const rightSideMinReq = (
            Block.minWidth * blocksLeft +
            Block.minRightMargin * holesLeft);

        this.x = startX;
        const maxWidth = canvas.width - rightSideMinReq - startX;
        const minWidth = Block.minWidth;

        this.width = holesLeft == 0 ? maxWidth : inRangeRandom(minWidth, maxWidth);
        //console.log(`${minWidth} ~ ${maxWidth} : ${this.width} : ${holesLeft}`);
        this.rightMargin = inRangeRandom(Block.minRightMargin, Block.maxRightMargin);
    }
}

class Ground {
    y: number;
    blockHeight: number = 20; // pixel
    topMargin: number = 100; // pixel
    blocks: Array<Block> = [];

    constructor(startY: number) {
        this.y = this.topMargin + startY;

        let holesCount = 1;
        let minP = 1;
        let r = Math.random();

        for (const count in groundHolesProbability) {
            const targetP = groundHolesProbability[count];
            if (targetP > r && targetP < minP) {
                holesCount = Number(count);
                minP = targetP;
            }
        }

        const blocksCount = holesCount + 1;
        let holesLeft = holesCount;
        let target: Block;
        let maxX = 0;

        for (let i = 0; i < blocksCount; i++, holesLeft--) {
            this.blocks.push(target = new Block(maxX, holesLeft));
            maxX += target.width + target.rightMargin;
        }
    }

    isYRange(ball: Ball) {
        return (this.y < ball.y + ball.radius && this.y + this.blockHeight > ball.y - ball.radius)
    }

    isXRange(ball: Ball) {
        var rtn = false;

        this.blocks.forEach(b => {
            if (rtn) return;

            //console.log(b.x + " ~ " + b.width + " : " + ball.x);
            if (ball.x + ball.radius > b.x && ball.x - ball.radius < b.x + b.width)
                rtn = true;
        });

        return rtn;
    }

    draw() {
        ctx.fillStyle = 'lightblue';
        this.blocks.forEach(b => ctx.fillRect(b.x, this.y, b.width, this.blockHeight));
    }
}

class Ball {
    x: number = 150;
    y: number = 100;
    radius: number = 10;

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, false);
        ctx.fillStyle = 'red';
        ctx.fill();
        ctx.lineWidth = 0;
        //ctx.strokeStyle = '#003300';
        ctx.stroke();
    }
}