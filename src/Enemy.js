import MovingDirection from "./MovingDirection.js";
import movingDirection from "./MovingDirection.js";

export default class Enemy {
    constructor(x, y, tileSize, velocity, tileMap) {
        this.x = x
        this.y = y
        this.tileSize = tileSize
        this.velocity = velocity - 1
        this.tileMap = tileMap

        this.#loadImages()

        this.movingDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length)

        this.directionTimerDefault = this.#random(10, 50)
        this.directionTimer = this.directionTimerDefault

        this.scaredAboutToExpireTimerDefault = 10
        this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault
    }

    draw(ctx, pause, pacman) {
        if (!pause) {
            this.#move()
            this.#changeDirection()
        }
        this.#setImage(ctx, pacman)
        ctx.drawImage(this.image, this.x, this.y)
    }

    #setImage(ctx, pacman) {
        if (pacman.powerDotActive) {
            this.#setImageWhenPowerDotIsActive(pacman)
        } else {
            this.image = this.normalGhost
        }
        ctx.drawImage(this.image, this.x, this.y)
    }

    #setImageWhenPowerDotIsActive(pacman) {
        if (pacman.powerDotAboutToExpire) {
            this.scaredAboutToExpireTimer--
            if (this.scaredAboutToExpireTimer === 0) {
                this.scaredAboutToExpireTimer = this.scaredAboutToExpireTimerDefault
                if (this.image === this.scaredGhost1) {
                    this.image = this.scaredGhost2
                } else {
                    this.image = this.scaredGhost1
                }
            }
        } else {
            this.image = this.scaredGhost1
        }
    }

    #move() {
        // 如果下一步不是墙
        if (!this.tileMap.didCollideWithEnvironment(this.x, this.y, this.movingDirection)) {
            switch (this.movingDirection) {
                case MovingDirection.up:
                    this.y -= this.velocity
                    break
                case MovingDirection.down:
                    this.y += this.velocity
                    break
                case MovingDirection.left:
                    this.x -= this.velocity
                    break
                case MovingDirection.right:
                    this.x += this.velocity
                    break
            }
        } else {
        }
    }

    #changeDirection() {
        // this.movingDirection = Math.floor(Math.random() * Object.keys(MovingDirection).length)
        this.directionTimer--
        let newMoveDirection = null
        if (this.directionTimer === 0) {
            this.directionTimer = this.directionTimerDefault
            newMoveDirection = Math.floor(Math.random() * Object.keys(movingDirection).length)
        }
        if (newMoveDirection !== null && this.movingDirection !== newMoveDirection) {
            if (Number.isInteger(this.x / this.tileSize) && Number.isInteger(this.y / this.tileSize)) {
                if (!this.tileMap.didCollideWithEnvironment(this.x, this.y, newMoveDirection)) {
                    this.movingDirection = newMoveDirection
                }
            }
        }
    }

    #loadImages() {
        this.normalGhost = new Image()
        this.normalGhost.src = '../images/ghost.png'
        this.scaredGhost1 = new Image()
        this.scaredGhost1.src = '../images/scaredGhost.png'
        this.scaredGhost2 = new Image()
        this.scaredGhost2.src = '../images/scaredGhost2.png'

        this.image = this.normalGhost
        this.emenyImages = [this.normalGhost, this.scaredGhost1, this.scaredGhost2]
        this.enemyIndex = 0
    }

    #random(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    collideWith(pacman) {
        const size = this.tileSize / 2
        if (
            pacman.x < this.x + size &&
            pacman.x + size > this.x &&
            pacman.y < this.y + size &&
            pacman.y + size > this.y
        ) {
            return true
        } else {
            return false
        }
    }
}