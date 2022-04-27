const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext('2d');

class App {

    constructor() {
        // Get canvas 2d context
        this.canvas = document.querySelector('#canvas');
        this.ctx = canvas.getContext('2d');

        // Variables
        this.radius = 0;
        this.minSize = 0;
        this.middle = { x: 0, y: 0 }; 
        this.times = { seconds: 0, minutes: 0, hours: 0 };

        // Event listener
        window.addEventListener('resize', this.handleResize.bind(this));

        // Update date every seconds;
        setInterval(this.updateDate.bind(this), 1);
    }

    run() {
        // resize a first time
        this.handleResize();

        // run animation
        this.animate();
    }

    animate() {
        window.requestAnimationFrame(this.animate.bind(this));

        // Draw background
        this.ctx.fillStyle = 'whitesmoke';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
        this.ctx.fill();

        // Draw clock border
        this.ctx.beginPath();
        this.ctx.fillStyle = 'white';
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = this.minSize * 0.02;
        this.ctx.arc(
            this.middle.x, 
            this.middle.y, 
            this.minSize / 3, 
            0, 
            2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.stroke();

        // Draw seconds needle
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = this.minSize / 250;
        this.ctx.moveTo(this.middle.x, this.middle.y);
        const [x1, y1] = this.getNeedlePos(this.times.seconds, 60, 0.8);
        this.ctx.lineTo(x1, y1);
        this.ctx.stroke();

        // Draw minutes needle
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = this.minSize / 125;
        this.ctx.moveTo(this.middle.x, this.middle.y);
        const [x2, y2] = this.getNeedlePos(this.times.minutes, 60, 0.8);
        this.ctx.lineTo(x2, y2);
        this.ctx.stroke();

        // Draw hours needle
        this.ctx.beginPath();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = this.minSize / 125;
        this.ctx.moveTo(this.middle.x, this.middle.y);
        const [x3, y3] = this.getNeedlePos(this.times.hours, 24, 0.5);
        this.ctx.lineTo(x3, y3);
        this.ctx.stroke();

        // Draw clock middle dot
        this.ctx.beginPath();
        this.ctx.fillStyle = 'gray';
        this.ctx.strokeStyle = 'gray';
        this.ctx.arc(
            this.middle.x, 
            this.middle.y, 
            this.minSize * 0.01, 
            0, 
            2 * Math.PI
        );
        this.ctx.fill();
        this.ctx.stroke();
    }

    handleResize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.middle.x = this.canvas.width / 2;
        this.middle.y = this.canvas.height / 2;
        this.minSize = Math.min(this.canvas.width, this.canvas.height);
        this.radius = this.minSize / 3
    }

    updateDate() {
        let d = new Date()
        this.times.seconds = d.getSeconds();
        this.times.minutes = d.getMinutes();
        this.times.hours = d.getHours();
    }

    getNeedlePos(unit, max, size) {
        const needleSize = this.radius - this.radius * (1 - size);
        const angle = ((unit * (360/max)) * (Math.PI / 180)) - (Math.PI / 2);
        const x = this.middle.x + needleSize * Math.cos(angle);
        const y = this.middle.y + needleSize * Math.sin(angle);
        return [x, y];
    }
}

const app = new App();
app.run();