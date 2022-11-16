import Pacman from './Pacman.js'
import Enemy from './Enemy.js'
import MovingDirection from "./MovingDirection.js";

export default class TileMap {

    constructor(tileSize) {
        this.tileSize = tileSize
        this.yellowDot = new Image()
        this.yellowDot.src = '../images/yellowDot.png'

        this.wall = new Image()
        this.wall.src = '../images/wall.png'

        this.pinkDot = new Image()
        this.pinkDot.src = '../images/pinkDot.png'

        this.powerDot = this.pinkDot
        this.powerDotAnmationTimerDefault = 60
        this.powerDotAnmationTimer = this.powerDotAnmationTimerDefault

        // 1 - wall
        // 0 - dot
        // 4 - pacman
        // 5 - empty space
        // 6 - enemy
        // 7 - power dot
        this.map = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 7, 0, 0, 4, 0, 0, 0, 0, 0, 0, 7, 1],
            [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
            [1, 0, 1, 6, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 1, 7, 1, 1, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 6, 0, 0, 0, 0, 0, 0, 0, 0, 0, 6, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ]
    }

    draw(ctx) {
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const tile = this.map[row][col]
                if (tile === 1) {
                    this.#drawWall(ctx, col, row, this.tileSize)
                } else if (tile === 0) {
                    this.#drawDot(ctx, col, row, this.tileSize)
                } else if (tile === 7) {
                    this.#drawPowerDot(ctx, col, row, this.tileSize)
                    // this.#drawDot(ctx, col, row, this.tileSize)
                } else {
                    this.#drawBlank(ctx, col, row, this.tileSize)
                }
            }
        }
    }

    #drawWall(ctx, col, row, size) {
        ctx.drawImage(this.wall, col * size, row * size)
    }

    #drawDot(ctx, col, row, size) {
        ctx.drawImage(this.yellowDot, col * size, row * size)
    }

    #drawBlank(ctx, column, row, size) {
        ctx.fillStyle = "black";
        ctx.fillRect(column * this.tileSize, row * this.tileSize, size, size);
    }

    #drawPowerDot(ctx, column, row, size) {
        this.powerDotAnmationTimer--
        if (this.powerDotAnmationTimer === 0) {
            this.powerDotAnmationTimer = this.powerDotAnmationTimerDefault
            if (this.powerDot === this.pinkDot) {
                this.powerDot = this.yellowDot
            } else {
                this.powerDot = this.pinkDot
            }
        }
        ctx.drawImage(this.powerDot, column * this.tileSize, row * this.tileSize, size, size)
    }

    getPacman(velocity) {
        for (let row = 0; row < this.map.length; row++) {
            for (let col = 0; col < this.map[row].length; col++) {
                const tile = this.map[row][col]
                if (tile === 4) {
                    // this.map[row][col] = 0
                    return new Pacman(col * this.tileSize, row * this.tileSize, this.tileSize, velocity, this)
                }
            }
        }
    }

    getEnemies(velocity) {
        const enemies = []
        for (let i = 0; i < this.map.length; i++) {
            for (let j = 0; j < this.map[i].length; j++) {
                const tile = this.map[i][j]
                if (tile === 6) {
                    this.map[i][j] = 0
                    enemies.push(new Enemy(j * this.tileSize, i * this.tileSize, this.tileSize, velocity, this))
                }
            }
        }
        // console.log(enemies)
        return enemies
    }

    setCanvasSize(canvas) {
        canvas.width = this.map[0].length * this.tileSize
        canvas.height = this.map.length * this.tileSize
    }

    // 豆人检测下一步是否是墙
    didCollideWithEnvironment(x, y, direction) {
        if (direction === null) return
        if (Number.isInteger(x / this.tileSize) && Number.isInteger(y / this.tileSize)) {
            let col = 0, row = 0, nextCol = 0, nextRow = 0
            switch (direction) {
                case MovingDirection.up:
                    nextRow = y - this.tileSize
                    row = nextRow / this.tileSize
                    col = x / this.tileSize
                    break
                case MovingDirection.down:
                    nextRow = y + this.tileSize
                    row = nextRow / this.tileSize
                    col = x / this.tileSize
                    break
                case MovingDirection.left:
                    nextCol = x - this.tileSize
                    col = nextCol / this.tileSize
                    row = y / this.tileSize
                    break
                case MovingDirection.right:
                    nextCol = x + this.tileSize
                    col = nextCol / this.tileSize
                    row = y / this.tileSize
                    break
            }
            const tile = this.map[row][col]
            return tile === 1;
        }
    }

    eatDot(x, y) {
        const row = y / this.tileSize
        const col = x / this.tileSize
        if (Number.isInteger(row) && Number.isInteger(col)) {
            if (this.map[row][col] === 0) {
                this.map[row][col] = 5
                return true
            }
        }
        return false
    }

    eatPowerDot(x, y) {
        const row = y / this.tileSize
        const col = x / this.tileSize
        if (Number.isInteger(row) && Number.isInteger(col)) {
            if (this.map[row][col] === 7) {
                this.map[row][col] = 5
                return true
            }
        }
        return false
    }

    isGameWin() {
        let gameWin = true
        let flatArray = this.map.flat()
        for (let i = 0; i < flatArray.length; i++) {
            if (flatArray[i] === 0) {
                gameWin = false
            }
        }

        // for (let i = 0; i <this.map.length; i++) {
        //     for (let j = 0; j < this.map[i].length; j++) {
        //         const tile = this.map[i][j]
        //         if (tile === 0) {
        //             gameWin = false
        //         }
        //     }
        // }
        return gameWin
    }
}