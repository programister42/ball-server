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
    const x = Math.floor(Math.random() * defaultSize)
    const y = Math.floor(Math.random() * defaultSize)
    return {x, y}
}

let currentApple = addApple()

io.on('connection', socket => {

    socket.on('updatePlayer', player => {
        if (
            player.segments[0].x === currentApple.x
            && player.segments[0].y === currentApple.y
        ) {
            currentApple = addApple()
            socket.emit('appleEaten', player.id)
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
