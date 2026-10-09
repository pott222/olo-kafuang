document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener("resize", () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    class Woodsprite {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.speedY = Math.random() * -0.5 - 0.1; // Медленно летят вверх
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
            // Цвета: белый центр, голубовато-зеленые края
            this.hue = Math.random() > 0.5 ? 180 : 150; 
        }

        update() {
            this.y += this.speedY;
            this.wobble += this.wobbleSpeed;
            this.x += Math.sin(this.wobble) * 0.5 + this.speedX;

            // Возврат вниз, если улетели за верхний край
            if (this.y < -10) {
                this.y = height + 10;
                this.x = Math.random() * width;
            }
            if (this.x > width + 10) this.x = -10;
            if (this.x < -10) this.x = width + 10;
        }

        draw() {
            ctx.beginPath();
            const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.size * 3);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(0.3, `hsla(${this.hue}, 100%, 70%, 0.8)`);
            gradient.addColorStop(1, `hsla(${this.hue}, 100%, 50%, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.arc(this.x, this.y, this.size * 3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    const sprites = Array.from({ length: 60 }, () => new Woodsprite());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        sprites.forEach(sprite => {
            sprite.update();
            sprite.draw();
        });
        requestAnimationFrame(animate);
    }

    animate();
});