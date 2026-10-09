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

    // 1. Мелкая светящаяся пыль на фоне (создает объем)
    class Spore {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedY = -(Math.random() * 0.5 + 0.1);
            this.speedX = (Math.random() - 0.5) * 0.5;
            this.pulse = Math.random() * Math.PI * 2;
        }
        update() {
            this.pulse += 0.02;
            this.y += this.speedY;
            this.x += this.speedX + Math.sin(this.pulse) * 0.2;
            if (this.y < -10) this.y = height + 10;
            if (this.x < -10) this.x = width + 10;
            if (this.x > width + 10) this.x = -10;
        }
        draw() {
            ctx.beginPath();
            ctx.fillStyle = `rgba(150, 240, 255, ${0.2 + 0.3 * Math.sin(this.pulse)})`;
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 2. Семена Древа Душ (Атокирина) - точная копия по фото
    class Atokirina {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height + height; // Появляются снизу
            this.scale = Math.random() * 0.4 + 0.3; // Разный размер
            this.speedY = -(Math.random() * 0.5 + 0.2); // Медленно плывут вверх
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.sway = Math.random() * Math.PI * 2;
            
            this.numTendrils = 18; // Количество длинных усиков
            this.numInnerWings = 6; // Внутренние лепестки
            this.tendrilOffsets = Array.from({length: this.numTendrils}, () => Math.random() * Math.PI * 2);
        }

        update() {
            this.y += this.speedY;
            this.sway += 0.015; // Скорость покачивания щупалец
            this.x += Math.sin(this.sway) * 0.4 + this.speedX; // Легкий дрейф влево-вправо

            // Если улетели за верхний край - возвращаем вниз
            if (this.y < -150) {
                this.y = height + 150;
                this.x = Math.random() * width;
            }
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            // Легкий наклон всего семени в зависимости от движения
            ctx.rotate(Math.sin(this.sway) * 0.05);
            ctx.scale(this.scale, this.scale);

            // --- 1. Длинные спадающие нити (Купол) ---
            ctx.beginPath();
            for (let i = 0; i < this.numTendrils; i++) {
                let t = i / (this.numTendrils - 1);
                let spread = (t - 0.5) * 140; // Ширина купола
                let wave = Math.sin(this.sway * 1.5 + this.tendrilOffsets[i]) * 10;
                
                ctx.moveTo(0, -10); // Растут чуть выше центра

                // Кривые Безье создают форму арки, падающей вниз
                let cp1x = spread * 0.7;
                let cp1y = -90 - Math.sin(t * Math.PI) * 30; // Выгиб вверх

                let cp2x = spread * 1.2 + wave;
                let cp2y = -10; // Начинают падать

                let endX = spread * 1.1 + wave * 1.5;
                let endY = 100 + Math.abs(spread) * 0.6; // Концы нитей внизу

                ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, endX, endY);
            }
            
            // Градиент нитей: сверху яркие, снизу растворяются
            let gradTendrils = ctx.createLinearGradient(0, -90, 0, 100);
            gradTendrils.addColorStop(0, "rgba(255, 255, 255, 0.9)");
            gradTendrils.addColorStop(0.4, "rgba(220, 245, 255, 0.4)");
            gradTendrils.addColorStop(1, "rgba(255, 255, 255, 0)");
            
            ctx.strokeStyle = gradTendrils;
            ctx.lineWidth = 1;
            ctx.stroke();

            // --- 2. Внутренние лепестки (Крылышки у ядра) ---
            ctx.beginPath();
            for (let i = 0; i < this.numInnerWings; i++) {
                let t = i / (this.numInnerWings - 1);
                let spread = (t - 0.5) * 60;
                let wave = Math.sin(this.sway * 2 + i) * 4;
                
                ctx.moveTo(0, 0);
                ctx.bezierCurveTo(
                    spread * 1.1, -40, 
                    spread * 1.4 + wave, 10, 
                    spread + wave, 45
                );
            }
            ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            ctx.lineWidth = 1.5;
            ctx.stroke();

            // --- 3. Ядро (Светящееся сердце семени) ---
            let coreGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, 18);
            coreGlow.addColorStop(0, "rgba(255, 255, 255, 1)");
            coreGlow.addColorStop(0.3, "rgba(200, 230, 255, 0.6)");
            coreGlow.addColorStop(0.7, "rgba(150, 100, 255, 0.2)"); // Легкий фиолетовый оттенок как в фильме
            coreGlow.addColorStop(1, "rgba(0, 0, 0, 0)");
            
            ctx.beginPath();
            ctx.fillStyle = coreGlow;
            ctx.arc(0, 0, 18, 0, Math.PI * 2);
            ctx.fill();

            // Сама центральная точка
            ctx.beginPath();
            ctx.fillStyle = "#ffffff";
            ctx.arc(0, 0, 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        }
    }

    // Создаем массивы (Пылинки на фоне и сами большие Семена)
    const spores = Array.from({length: 60}, () => new Spore());
    // 12 штук достаточно, чтобы они смотрелись эпично и не тормозили телефон
    const seeds = Array.from({length: 12}, () => {
        let s = new Atokirina();
        s.y = Math.random() * height; // Чтобы при старте они были распределены по экрану
        return s;
    });

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        spores.forEach(s => { s.update(); s.draw(); });
        seeds.forEach(s => { s.update(); s.draw(); });
        
        requestAnimationFrame(animate);
    }

    animate();
});
