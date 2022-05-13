class App {
    constructor() {
        this.canvas = document.querySelector('#canvas');
        this.ctx = this.canvas.getContext('2d');
        this.maxFps = 60;
        this.columnWidth = 0;
        this.rectangles = [];
    }


    start() {
        this.getFPS()
            .then((fps) => {
                this.maxFps = fps;
                this.setup();
                window.requestAnimationFrame(this.render.bind(this));
            });
    }

    setup() {
        // Style
        this.canvas.style.background = 'whitesmoke';
        this.canvas.style.margin = '50px';
        this.canvas.width = window.innerWidth - 100;
        this.canvas.height = window.innerHeight - 105;
    
        // Rectangles
        const nbRect = Math.floor(this.maxFps / 10);
        this.columnWidth = (this.canvas.width / nbRect);
        for (let i = 0; i < nbRect; i++) {
            this.rectangles.push(new Rectangle((this.columnWidth * i) + ((this.columnWidth/2) - 25), 1, (i+1) * 10));
        }
    }

    render(now) {
        // Next frame
        window.requestAnimationFrame(this.render.bind(this));

        // Iterate rectangles
        for (const rectangle of this.rectangles) {
            const elasped = now - rectangle.time;
            if (elasped > rectangle.frameDelay) {
                rectangle.time = now - (elasped % rectangle.frameDelay);
                this.ctx.clearRect(rectangle.x, 0, this.columnWidth, this.canvas.height);
                rectangle.y += rectangle.speed * (60 / rectangle.frameRate);
                rectangle.render(this.ctx);
            }
        }
    }

    getFPS = () =>
        new Promise(resolve =>
        requestAnimationFrame(t1 => {
            requestAnimationFrame(t2 => resolve(Math.round(1000 / (t2 - t1))));
        })
    )


}

class Rectangle {
    constructor(x, speed, frameRate) {
        this.frameRate = frameRate;
        this.frameDelay = 1000 / this.frameRate;
        this.time = 0;
        this.speed = speed; // 1px per sec
        this.x = x;
        this.y = 0;
    }

    render(ctx) {
        ctx.fillStyle = 'blue';
        ctx.fillRect(this.x, this.y, 50, 50);
        ctx.fill();
    }
}


const app = new App();
// app.rectangles.push(new Rectangle(10, 1, 54));
// app.rectangles.push(new Rectangle(70, 1, 55));
// app.rectangles.push(new Rectangle(140, 1, 56));
// app.rectangles.push(new Rectangle(200, 1, 57));
// app.rectangles.push(new Rectangle(260, 1, 58));
// app.rectangles.push(new Rectangle(320, 1, 59));
// app.rectangles.push(new Rectangle(380, 1, 60));

app.start();
