const {Server} = require('socket.io')

const port = parseInt(process.env.PORT) || 3000

const io = new Server(port, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

const serverTick = 1000 / 60
const defaultSize = 51
const players = new Map()

const addApple = _ => {
    const blockedCoordinates = [...players.values()].map(player => player.segments).flat()
    const apple = { x: 0, y: 0 }

    do {
        apple.x = Math.floor(Math.random() * defaultSize)
        apple.y = Math.floor(Math.random() * defaultSize)
    } while (blockedCoordinates.some(({x, y}) => x === apple.x && y === apple.y))

    return apple
}

const checkCollision = (object, anotherObject) => object.x === anotherObject.x && object.y === anotherObject.y

let currentApple = addApple()

io.on('connection', socket => {

    socket.on('updatePlayer', player => {
        if (checkCollision(player.segments[0], currentApple)) {
            currentApple = addApple()
            socket.emit('appleEaten', player.id)
        }

        for (const [id, anotherPlayer] of players) {
            anotherPlayer.segments.forEach((segment, index) => {
                if (
                    index === 0 ||
                    !checkCollision(player.segments[0], segment)
                ) return

                socket.emit('playerDied', player.id)
            })
        }

        players.set(player.id, player)
    })

    setInterval(_ => {
        for (const [id, player] of players)
            if (Date.now() - player.lastUpdate > 60 * 1000)
                players.delete(id)

        if (!players.size) return

        socket.emit('serverUpdate', {
            players: [...players.values()],
            apple: currentApple,
        })
    }, serverTick)

})
