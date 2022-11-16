import MovingDirection from "./MovingDirection.js";
import movingDirection from "./MovingDirection.js";

export default class Pacman {
    constructor(x, y, tileSize, velocity, tileMap) {
        this.x = x
        this.y = y
        this.tileSize = tileSize
        this.velocity = velocity
        this.tileMap = tileMap

        this.currentMovingDirection = null
        this.requestedMovingDirection = null

        this.pacmanAnimationTimerDefault = 10
        this.pacmanAnimationTimer = null

        window.addEventListener('keydown', this.#keydown)
        this.#loadPacmanImages()

        this.Rotation = {
            right: 0,
            down: 1,
            left: 2,
            up: 3
        }

        this.pacmanRotation = this.Rotation.right

        this.wakaSound = new Audio('../sounds/waka.wav')

        this.powerDotSound = new Audio('../sounds/power_dot.wav')
        this.powerDotActive = false
        this.powerDotAboutToExpire = false
        this.timers = []

        this.eatGhostSounds = new Audio('../sounds/eat_ghost.wav')

        this.madeFirstMove = false
    }

    draw(ctx, pause, enemies) {
        if (!pause) {
            this.#move()
            this.#animate()
        }
        this.#eatDot()
        this.#eatPowerDot()
        this.#eatGhost(enemies)

        const size = this.tileSize / 2

        ctx.save()
        ctx.translate(this.x + size, this.y + size)
        ctx.rotate((this.pacmanRotation * 90 * Math.PI) / 180)
        ctx.drawImage(this.pacmanImages[this.pacmanImageIndex], -size, -size, this.tileSize, this.tileSize)
        ctx.restore()
        // ctx.drawImage(this.pacmanImages[this.pacmanImageIndex], this.x, this.y, this.tileSize, this.tileSize)
    }

    #loadPacmanImages() {
        const pacmanImage1 = new Image()
        pacmanImage1.src = '../images/pac0.png'
        const pacmanImage2 = new Image()
        pacmanImage2.src = '../images/pac1.png'
        const pacmanImage3 = new Image()
        pacmanImage3.src = '../images/pac2.png'
        const pacmanImage4 = new Image()
        pacmanImage4.src = '../images/pac1.png'

        this.pacmanImages = [pacmanImage1, pacmanImage2, pacmanImage3, pacmanImage4]
        this.pacmanImageIndex = 0
    }

    #keydown = (e) => {
        // console.log(e.keyCode)
        // up 87
        if (e.keyCode === 87) {
            if (this.currentMovingDirection === MovingDirection.down)
                this.currentMovingDirection = movingDirection.up
            this.requestedMovingDirection = MovingDirection.up
            this.madeFirstMove = true
            // down
        } else if (e.keyCode === 83) {
            if (this.currentMovingDirection === MovingDirection.up)
                this.currentMovingDirection = movingDirection.down
            this.requestedMovingDirection = MovingDirection.down
            this.madeFirstMove = true
            // left
        } else if (e.keyCode === 65) {
            if (this.currentMovingDirection === MovingDirection.right)
                this.currentMovingDirection = movingDirection.left
            this.requestedMovingDirection = MovingDirection.left
            this.madeFirstMove = true
            // right
        } else if (e.keyCode === 68) {
            if (this.currentMovingDirection === MovingDirection.left)
                this.currentMovingDirection = movingDirection.right
            this.requestedMovingDirection = MovingDirection.right
            this.madeFirstMove = true
        }
    }

    #move() {
        // console.log(this.currentMovingDirection,this.requestedMovingDirection)
        if (this.currentMovingDirection !== this.requestedMovingDirection) {
            if (Number.isInteger(this.x / this.tileSize) && Number.isInteger(this.y / this.tileSize)) {
                if (!this.tileMap.didCollideWithEnvironment(this.x, this.y, this.requestedMovingDirection)) {
                    this.currentMovingDirection = this.requestedMovingDirection
                }
                // console.log(this.tileMap.didCollideWithEnvironment(this.x, this.y, this.requestedMovingDirection))
            }
        }
        // 撞墙
        if (this.tileMap.didCollideWithEnvironment(this.x, this.y, this.currentMovingDirection)) {
            this.pacmanImageIndex = 1
            this.pacmanAnimationTimer = null
            return false
        } else if (this.currentMovingDirection != null && this.pacmanAnimationTimer === null) {
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault
        }
        switch (this.currentMovingDirection) {
            case MovingDirection.up :
                this.y -= this.velocity
                this.pacmanRotation = this.Rotation.up
                break
            case MovingDirection.down :
                this.y += this.velocity
                this.pacmanRotation = this.Rotation.down
                break
            case MovingDirection.left :
                this.x -= this.velocity
                this.pacmanRotation = this.Rotation.left
                break
            case MovingDirection.right :
                this.x += this.velocity
                this.pacmanRotation = this.Rotation.right
                break
        }
    }

    #animate() {
        if (this.pacmanAnimationTimer === null) return false
        this.pacmanAnimationTimer--
        if (this.pacmanAnimationTimer === 0) {
            this.pacmanAnimationTimer = this.pacmanAnimationTimerDefault
            this.pacmanImageIndex++
            if (this.pacmanImageIndex === this.pacmanImages.length) {
                this.pacmanImageIndex = 0
            }
        }
    }

    #eatDot() {
        if (this.tileMap.eatDot(this.x, this.y) && this.madeFirstMove) {
            // 播放音乐
            this.wakaSound.play()
        }
    }

    #eatPowerDot() {
        if (this.tileMap.eatPowerDot(this.x, this.y) && this.madeFirstMove) {
            this.powerDotSound.play()
            this.powerDotActive = true
            this.powerDotAboutToExpire = false

            this.timers.forEach(timer => clearTimeout(timer))
            this.timers = []

            let powerDotTimer = setTimeout(() => {
                this.powerDotActive = false
                this.powerDotAboutToExpire = false
            }, 1000 * 6)

            this.timers.push(powerDotTimer)

            let powerDotAboutToExpireTimer = setTimeout(() => {
                this.powerDotAboutToExpire = true
            }, 1000 * 3)

            this.timers.push(powerDotAboutToExpireTimer)
        }

    }

    #eatGhost(enemies) {
        if (this.powerDotActive) {
            enemies.forEach((enemy, index) => {
                if (enemy.collideWith(this)) {
                    enemies.splice(index, 1)
                    this.eatGhostSounds.play()
                }
            })
            // const  size = this.tileSize / 2
            // enemies.forEach((enemy, index) => {
            //     if (
            //         this.x < enemy.x + size &&
            //         this.x + size > enemy.x &&
            //         this.y < enemy.y + size &&
            //         this.y + size > enemy.y
            //     ) {
            //         enemies.splice(index,1)
            //         this.eatGhostSounds.play()
            //     }
            // })
        }
    }
}