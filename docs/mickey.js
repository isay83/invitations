// Mickey Mouse Snake Game
class MickeySnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Game settings
        this.gridSize = 20;
        this.tileCount = 20;


        // Responsive canvas size
        this.setupCanvas();

        // Game state
        this.mickey = [{ x: 10, y: 10 }];
        this.dx = 0;
        this.dy = 0;
        this.cheese = this.generateCheese();
        this.score = 0;
        this.gameRunning = false;
        this.gameStarted = false;
        this.paused = false;

        // Records
        this.personalRecord = parseInt(localStorage.getItem('mickeySnakeRecord') || '0');
        this.globalRecord = 0;
        this.recordHolder = '';
        this.lastUpdated = '';

        this.inputQueue = [];
        this.maxQueueSize = 2;
        this.lastDirectionChange = 0;
        this.minDirectionInterval = 100; // ms

        // Initialize
        this.initializeGame();
        this.setupEventListeners();
        this.initializeParticles();
        this.loadGlobalRecord();
    }

    setupCanvas() {
        const container = document.querySelector('.game-container');
        const maxWidth = Math.min(window.innerWidth - 40, 600);
        const maxHeight = Math.min(window.innerHeight - 200, 600);

        // Make canvas square and responsive
        const size = Math.min(maxWidth, maxHeight);
        this.canvas.width = size;
        this.canvas.height = size;

        // Adjust tile count based on canvas size
        this.tileCount = Math.floor(size / this.gridSize);
        this.gridSize = size / this.tileCount;
    }

    initializeGame() {
        // Reset game state
        this.mickey = [{ x: Math.floor(this.tileCount / 2), y: Math.floor(this.tileCount / 2) }];
        this.dx = 0;
        this.dy = 0;
        this.cheese = this.generateCheese();
        this.score = 0;
        this.gameRunning = false;

        // Update UI
        this.updateScore();
        this.updateRecords();

        // Draw initial state
        this.draw();
    }

    setupEventListeners() {
        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning) return;

            // 1) Atajos de pausa/reanuda
            if (['Escape', 'Enter', ' '].includes(e.key)) {
                e.preventDefault();          // evita scroll con barra espaciadora
                return this.togglePause();
            }

            // 2. Movimiento (solo si no está pausado)
            if (this.paused) return;

            const key = e.key.toLowerCase();
            const now = Date.now();

            // 3) Evitar cambios de dirección demasiado rápidos
            if (now - this.lastDirectionChange < this.minDirectionInterval) {
                return;
            }

            let newDirection = null;

            // Calculate new direction
            if ((key === 'w' || key === 'arrowup') && this.dy !== 1) {
                newDirection = { dx: 0, dy: -1 };
            } else if ((key === 's' || key === 'arrowdown') && this.dy !== -1) {
                newDirection = { dx: 0, dy: 1 };
            } else if ((key === 'a' || key === 'arrowleft') && this.dx !== 1) {
                newDirection = { dx: -1, dy: 0 };
            } else if ((key === 'd' || key === 'arrowright') && this.dx !== -1) {
                newDirection = { dx: 1, dy: 0 };
            }

            // Solo procesar si es una dirección válida y diferente
            if (newDirection && (newDirection.dx !== this.dx || newDirection.dy !== this.dy)) {
                this.addToInputQueue(newDirection);
                this.lastDirectionChange = now;
            }
        });


        // Mobile controls
        document.querySelectorAll('.control-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.gameRunning || this.paused) return;

                const direction = e.target.closest('.control-btn').dataset.direction;

                switch (direction) {
                    case 'up':
                        this.changeDirection(0, -1);
                        break;
                    case 'down':
                        this.changeDirection(0, 1);
                        break;
                    case 'left':
                        this.changeDirection(-1, 0);
                        break;
                    case 'right':
                        this.changeDirection(1, 0);
                        break;
                }
            });
        });

        // Botón de pausa/play
        document
            .getElementById('pauseBtn')
            .addEventListener('click', () => this.togglePause());

        // Botones del overlay de pausa
        document
            .getElementById('resumeBtn')
            .addEventListener('click', () => this.togglePause());

        document
            .getElementById('homeFromPauseBtn')
            .addEventListener('click', () => {
                document.getElementById('pauseOverlay').style.display = 'none';
                window.location.href = './'; // Redirigir a la página de inicio
            });
        // Home normal
        document
            .getElementById('homeBtn')
            .addEventListener('click', () => window.location.href = './');

        // Botones móviles adicionales
        document
            .getElementById('pauseBtnMobile')
            .addEventListener('click', () => this.togglePause());

        document
            .getElementById('homeBtnMobile')
            .addEventListener('click', () => window.location.href = './');

        // Window resize
        window.addEventListener('resize', () => {
            this.setupCanvas();
            this.draw();
        });
    }

    generateCheese() {
        let cheese;
        do {
            cheese = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.mickey.some(segment => segment.x === cheese.x && segment.y === cheese.y));

        return cheese;
    }

    update() {
        if (!this.gameRunning) return;

        // Procesar cola de inputs
        this.processInputQueue();

        // Move Mickey
        const head = { x: this.mickey[0].x + this.dx, y: this.mickey[0].y + this.dy };

        // Check wall collision
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }

        // Check self collision
        if (this.mickey.some(segment => segment.x === head.x && segment.y === head.y)) {
            this.gameOver();
            return;
        }

        this.mickey.unshift(head);

        // Check cheese collision
        if (head.x === this.cheese.x && head.y === this.cheese.y) {
            this.score += 10;
            this.updateScore();
            this.cheese = this.generateCheese();

            // Play sound effect (if audio is available)
            this.playEatSound();
        } else {
            this.mickey.pop();
        }

        this.draw();
    }

    draw() {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(26, 26, 46, 0.8)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid
        this.drawGrid();

        // Draw Mickey (snake)
        this.drawMickey();

        // Draw cheese
        this.drawCheese();
    }

    drawGrid() {
        this.ctx.strokeStyle = 'rgba(255, 215, 0, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= this.tileCount; i++) {
            // Vertical lines
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();

            // Horizontal lines
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
    }

    drawMickey() {
        this.mickey.forEach((segment, index) => {
            const x = segment.x * this.gridSize;
            const y = segment.y * this.gridSize;

            if (index === 0) {
                // Mickey's head (main circle)
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize * 0.4, 0, 2 * Math.PI);
                this.ctx.fill();

                // Mickey's ears
                const earSize = this.gridSize * 0.25;
                // Left ear
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.25, y + this.gridSize * 0.25, earSize, 0, 2 * Math.PI);
                this.ctx.fill();
                // Right ear
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.75, y + this.gridSize * 0.25, earSize, 0, 2 * Math.PI);
                this.ctx.fill();

                // Mickey's eyes
                this.ctx.fillStyle = '#FFFFFF';
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.4, y + this.gridSize * 0.45, this.gridSize * 0.05, 0, 2 * Math.PI);
                this.ctx.fill();
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.6, y + this.gridSize * 0.45, this.gridSize * 0.05, 0, 2 * Math.PI);
                this.ctx.fill();

                // Mickey's nose
                this.ctx.fillStyle = '#000000';
                this.ctx.beginPath();
                this.ctx.arc(x + this.gridSize * 0.5, y + this.gridSize * 0.6, this.gridSize * 0.03, 0, 2 * Math.PI);
                this.ctx.fill();
            } else {
                // Body segments (red with yellow outline like Mickey's outfit)
                this.ctx.fillStyle = '#FF0000';
                this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

                this.ctx.strokeStyle = '#FFD700';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
            }
        });
    }

    drawCheese() {
        const x = this.cheese.x * this.gridSize;
        const y = this.cheese.y * this.gridSize;

        // Cheese base (yellow)
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fillRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);

        // Cheese holes
        this.ctx.fillStyle = '#FFA500';
        const holeSize = this.gridSize * 0.1;
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize * 0.3, y + this.gridSize * 0.3, holeSize, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize * 0.7, y + this.gridSize * 0.4, holeSize, 0, 2 * Math.PI);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(x + this.gridSize * 0.5, y + this.gridSize * 0.7, holeSize, 0, 2 * Math.PI);
        this.ctx.fill();

        // Cheese border
        this.ctx.strokeStyle = '#FFB347';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x + 2, y + 2, this.gridSize - 4, this.gridSize - 4);
    }

    startGame() {
        this.dx = 1;
        this.dy = 0;
        this.gameRunning = true;
        this.gameStarted = true;
        document.getElementById('startScreen').style.display = 'none';
        this.gameLoop();
    }

    togglePause() {
        this.paused = !this.paused;
        const overlay = document.getElementById('pauseOverlay');
        const pauseBtn = document.getElementById('pauseBtn');
        const pauseBtnMobile = document.getElementById('pauseBtnMobile');

        if (this.paused) {
            overlay.style.display = 'flex';
            pauseBtn.innerHTML = '<i class="fa fa-play"></i> Reanudar';
            if (pauseBtnMobile) {
                pauseBtnMobile.innerHTML = '<i class="fa fa-play"></i>';
            }
        } else {
            overlay.style.display = 'none';
            pauseBtn.innerHTML = '<i class="fa fa-pause"></i> Pausar';
            if (pauseBtnMobile) {
                pauseBtnMobile.innerHTML = '<i class="fa fa-pause"></i>';
            }
            this.gameLoop();
        }
    }


    gameLoop() {
        if (!this.gameRunning || this.paused) return;

        this.update();
        if (this.gameRunning) {
            // Velocidad adaptativa
            const isMobile = window.innerWidth <= 768;
            const baseSpeed = 150; // Base speed in ms
            const mobileSpeedAdjustment = Math.max(1, this.canvas.width / 400); // Adjust speed based on canvas width
            const gameSpeed = isMobile ? baseSpeed * mobileSpeedAdjustment : baseSpeed;
            setTimeout(() => this.gameLoop(), gameSpeed); // Game speed
        }
    }

    gameOver() {
        this.gameRunning = false;

        // Update records
        if (this.score > this.personalRecord) {
            this.personalRecord = this.score;
            localStorage.setItem('mickeySnakeRecord', this.personalRecord.toString());
            this.updateRecords();
        }

        // Show game over screen
        document.getElementById('finalScore').textContent = this.score;

        let recordText = '';
        if (this.score > this.personalRecord - 10) {
            recordText = '<br>🎉 ¡Nuevo récord personal!';
        } else {
            recordText = `<br>Tu récord personal es: ${this.personalRecord}`;
        }

        if (this.globalRecord > 0) {
            recordText += `<br>Récord global: ${this.globalRecord}`;
        }

        document.getElementById('recordInfo').innerHTML = recordText;
        document.getElementById('gameOverScreen').style.display = 'flex';
    }

    restartGame() {
        document.getElementById('gameOverScreen').style.display = 'none';
        this.initializeGame();
        this.startGame();
    }

    updateScore() {
        document.getElementById('currentScore').textContent = this.score;
    }

    updateRecords() {
        document.getElementById('personalRecord').textContent = this.personalRecord;

        if (this.globalRecord > 0) {
            document.getElementById('globalRecord').textContent = this.globalRecord;
            document.getElementById('globalRecordDisplay').style.display = 'block';
        }
    }

    playEatSound() {
        // Simple audio feedback using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);

            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);

            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch (error) {
            // Audio not supported, continue silently
        }
    }

    initializeParticles() {
        const particlesContainer = document.getElementById('particles');
        for (let i = 0; i < 50; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 8 + 's';
            particle.style.animationDuration = (Math.random() * 4 + 4) + 's';
            particlesContainer.appendChild(particle);
        }
    }

    async loadGlobalRecord() {
        try {
            // Ruta local en vez de GitHub
            const resp = await fetch('./records.json');
            if (!resp.ok) throw new Error('HTTP ' + resp.status);

            const data = await resp.json();
            this.globalRecord = data.globalRecord;
            this.recordHolder = data.recordHolder;
            this.lastUpdated = data.lastUpdated;
            this.updateRecords();
        } catch (err) {
            console.log('No se pudo cargar el récord global', err);
        }
    }

    // Función para cambiar dirección de forma segura
    changeDirection(newDx, newDy) {
        // Verificar que no sea dirección opuesta
        if ((newDx === 1 && this.dx === -1) || (newDx === -1 && this.dx === 1) ||
            (newDy === 1 && this.dy === -1) || (newDy === -1 && this.dy === 1)) {
            return; // Ignorar cambio de dirección opuesta
        }

        // Aplicar nueva dirección
        this.dx = newDx;
        this.dy = newDy;
    }
    // Añadir dirección a la cola de inputs
    addToInputQueue(direction) {
        // Evitar direcciones duplicadas consecutivas
        const lastInput = this.inputQueue[this.inputQueue.length - 1];
        if (lastInput && lastInput.dx === direction.dx && lastInput.dy === direction.dy) {
            return;
        }

        // Mantener cola limitada
        if (this.inputQueue.length >= this.maxQueueSize) {
            this.inputQueue.shift();
        }

        this.inputQueue.push(direction);
    }
    // Procesar la cola de inputs
    processInputQueue() {
        if (this.inputQueue.length === 0) return;

        const nextInput = this.inputQueue[0];

        // Verificar si el input es válido (no dirección opuesta)
        if ((nextInput.dx === 1 && this.dx === -1) || (nextInput.dx === -1 && this.dx === 1) ||
            (nextInput.dy === 1 && this.dy === -1) || (nextInput.dy === -1 && this.dy === 1)) {
            // Remover input inválido
            this.inputQueue.shift();
            return;
        }

        // Aplicar dirección
        this.dx = nextInput.dx;
        this.dy = nextInput.dy;

        // Remover input procesado
        this.inputQueue.shift();
    }
}

// Global functions for HTML onclick events
function startGame() {
    if (window.mickeyGame) {
        window.mickeyGame.startGame();
    }
}

function restartGame() {
    if (window.mickeyGame) {
        window.mickeyGame.restartGame();
    }
}

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.mickeyGame = new MickeySnakeGame();
});