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

    // Ambient floating spores (bioluminescent dust)
    class Spore {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + 10;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = -(Math.random() * 0.4 + 0.1);
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.alpha = Math.random() * 0.6 + 0.2;
            this.pulse = Math.random() * Math.PI * 2;
        }

        update() {
            this.pulse += 0.03;
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.pulse) * 0.2;

            if (this.y < -10 || this.x < -10 || this.x > width + 10) {
                this.reset();
            }
        }

        draw() {
            const glowAlpha = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
            ctx.beginPath();
            ctx.fillStyle = `rgba(124, 245, 179, ${glowAlpha})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Woodsprite (Tree of Souls seed with jellyfish-like pulsing & tendrils)
    class Woodsprite {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + 60;
            this.baseRadius = Math.random() * 8 + 8; // Bell size
            this.tendrilCount = Math.floor(Math.random() * 3) + 5; // 5 to 7 tendrils
            this.tendrilLength = this.baseRadius * (Math.random() * 1.8 + 2.2);

            // Pulse dynamics (mimicking medusa / jellyfish swimming)
            this.pulseTime = Math.random() * Math.PI * 2;
            this.pulseSpeed = Math.random() * 0.03 + 0.025;
            this.thrust = 0;
            this.driftX = (Math.random() - 0.5) * 0.4;
            this.tilt = 0;
            
            // Hue variation: turquoise to soft glowing green
            this.hue = Math.random() > 0.4 ? 175 : 155;
        }

        update() {
            this.pulseTime += this.pulseSpeed;

            // Jellyfish stroke cycle: rapid contraction, slow glide
            const pulseCycle = Math.sin(this.pulseTime);
            if (pulseCycle > 0.7) {
                this.thrust += 0.08; // upward burst
            }
            this.thrust *= 0.94; // water-like resistance damping

            const vy = -(0.35 + this.thrust * 1.6);
            this.y += vy;

            // Slight lateral wobble based on pulse and drift
            this.tilt = Math.sin(this.pulseTime * 0.5) * 0.15;
            this.x += this.driftX + Math.sin(this.pulseTime) * 0.5;

            // Respawn above canvas
            if (this.y < -80) {
                this.reset(false);
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(this.tilt);

            const expansion = 1 + Math.sin(this.pulseTime) * 0.22;
            const contractionY = 1 - Math.sin(this.pulseTime) * 0.18;
            const r = this.baseRadius * expansion;

            // 1. Ambient outer glow
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3.5);
            outerGlow.addColorStop(0, `hsla(${this.hue}, 100%, 75%, 0.35)`);
            outerGlow.addColorStop(0.5, `hsla(${this.hue}, 100%, 65%, 0.1)`);
            outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2);
            ctx.fill();

            // 2. Trailing Tendrils (Bézier curves)
            for (let i = 0; i < this.tendrilCount; i++) {
                const spread = (i / (this.tendrilCount - 1) - 0.5) * (r * 1.4);
                const startX = spread;
                const startY = 2;

                const wave = Math.sin(this.pulseTime * 1.5 + i * 0.8);
                const cp1x = startX + wave * (r * 0.6);
                const cp1y = startY + this.tendrilLength * 0.45;
                const cp2x = startX - wave * (r * 0.8);
                const cp2y = startY + this.tendrilLength * 0.75;
                const endX = startX + wave * (r * 0.4);
                const endY = startY + this.tendrilLength;

                ctx.beginPath();
                ctx.moveTo(startX, startY);
                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);

                const grad = ctx.createLinearGradient(startX, startY, endX, endY);
                grad.addColorStop(0, `hsla(${this.hue}, 100%, 85%, 0.8)`);
                grad.addColorStop(0.5, `hsla(${this.hue}, 100%, 70%, 0.4)`);
                grad.addColorStop(1, 'hsla(180, 100%, 90%, 0)');

                ctx.strokeStyle = grad;
                ctx.lineWidth = 1;
                ctx.stroke();

                // Tendril terminal tip spore
                ctx.beginPath();
                ctx.fillStyle = `hsla(${this.hue}, 100%, 80%, ${0.3 + 0.3 * Math.sin(this.pulseTime + i)})`;
                ctx.arc(endX, endY, 1.2, 0, Math.PI * 2);
                ctx.fill();
            }

            // 3. Bell / Umbrella Dome
            ctx.save();
            ctx.scale(1, contractionY);
            ctx.beginPath();
            ctx.moveTo(-r, 0);
            ctx.bezierCurveTo(-r, -r * 1.4, r, -r * 1.4, r, 0);
            ctx.bezierCurveTo(r * 0.5, r * 0.2, -r * 0.5, r * 0.2, -r, 0);
            ctx.closePath();

            const bellGrad = ctx.createRadialGradient(0, -r * 0.4, 0, 0, -r * 0.2, r);
            bellGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            bellGrad.addColorStop(0.4, `hsla(${this.hue}, 100%, 75%, 0.6)`);
            bellGrad.addColorStop(0.8, `hsla(${this.hue}, 90%, 55%, 0.25)`);
            bellGrad.addColorStop(1, `hsla(${this.hue}, 100%, 70%, 0.05)`);

            ctx.fillStyle = bellGrad;
            ctx.fill();

            ctx.strokeStyle = `hsla(${this.hue}, 100%, 90%, 0.5)`;
            ctx.lineWidth = 0.8;
            ctx.stroke();
            ctx.restore();

            // 4. Central Sacred Core (Glowing seed nucleus)
            ctx.beginPath();
            const coreGrad = ctx.createRadialGradient(0, -r * 0.3, 0, 0, -r * 0.3, r * 0.5);
            coreGrad.addColorStop(0, '#ffffff');
            coreGrad.addColorStop(0.6, `hsla(${this.hue}, 100%, 85%, 0.9)`);
            coreGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = coreGrad;
            ctx.arc(0, -r * 0.3, r * 0.4, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // Population density balanced for aesthetics and performance
    const spriteCount = Math.min(Math.floor(width / 50), 32);
    const sprites = Array.from({ length: spriteCount }, () => new Woodsprite());
    const spores = Array.from({ length: 45 }, () => new Spore());

    function animate() {
        ctx.clearRect(0, 0, width, height);

        // Render ambient background spores first
        spores.forEach(spore => {
            spore.update();
            spore.draw();
        });

        // Render animated woodsprites
        sprites.forEach(sprite => {
            sprite.update();
            sprite.draw();
        });

        requestAnimationFrame(animate);
    }

    animate();
});
