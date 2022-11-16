import TileMap from "./TileMap.js";

const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

const velocity = 2
const tileSize = 32
const tileMap = new TileMap(tileSize)
const pacman = tileMap.getPacman(velocity)
const enemies = tileMap.getEnemies(velocity)

let gameOver = false,
    gameWin = false
const GameOverSound = new Audio('../sounds/gameOver.wav')
const GameWinSound = new Audio('../sounds/gameWin.wav')


tileMap.setCanvasSize(canvas)

function gameLoop() {
    tileMap.draw(ctx)
    pacman.draw(ctx, pause(), enemies)
    enemies.forEach(enemy => enemy.draw(ctx, pause(), pacman))
    checkGameOver()
    checkGameWin()
    drawGameEnd()
}

function drawGameEnd() {
    if ( gameOver || gameWin) {
        let text = 'You Win'
        if (gameOver) {
            text = 'Game Over'

        }
        ctx.fillStyle = 'black'
        ctx.fillRect(0,canvas.height / 3.2,canvas.width,80)

        ctx.font = "80px 黑体"
        const gradient = ctx.createLinearGradient(0,0, canvas.width, 0)
        gradient.addColorStop(0,'magenta')
        gradient.addColorStop(0.5,'blue')
        gradient.addColorStop(1,'red')

        ctx.fillStyle = gradient
        ctx.fillText(text,10,canvas.height / 2)
    }
}

function checkGameWin() {
    if (!gameWin) {
        gameWin = tileMap.isGameWin()
        if (gameWin) {
            GameWinSound.play()
        }
    }
}

function checkGameOver() {
    if (!gameOver) {
        gameOver = isGameOver()
        if (gameOver) {
            GameOverSound.play()
        }
    }
}

function isGameOver() {
    return enemies.some(enemy => !pacman.powerDotActive && enemy.collideWith(pacman))
}

function pause() {
    return !pacman.madeFirstMove || gameOver || gameWin
}

setInterval(gameLoop, 1000 / 75)
