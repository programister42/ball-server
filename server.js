const {Server} = require('socket.io')

const port = parseInt(process.env.PORT) || 3000

const io = new Server(port, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
})

const serverTick = 1000 / 60;
const players = new Map()

io.on('connection', (socket) => {

    socket.on('updatePlayer', (player) => {
        players.set(player.id, player)
    });

    setInterval(_ => {
        for (const [id, player] of players)
            if (Date.now() - player.lastUpdate > 60 * 1000)
                players.delete(id)

        if (!players.size) return

        socket.emit('onlinePlayersUpdate', [...players.values()])
    }, serverTick)
})
