const {Server} = require('socket.io')

const port = process.env.PORT || 3000

const io = new Server(parseInt(port), {
    cors: {
        origin: '*',
		methods: ['GET', 'POST'],
    },
})

const serverTick = 1000 / 30;
const onlinePlayers = new Map()

io.on('connection', (socket) => {
    socket.emit('id', socket.id)

    socket.on('updatePlayer', (player) => {
        onlinePlayers.set(socket.id, player)
    });

    setInterval(_ => {
        const players = []

        for (const [id, player] of onlinePlayers) {
            if (id === socket.id) continue

            players.push(player)
        }

        if (!players.length) return
        socket.emit('onlinePlayersUpdate', players)
		console.log(onlinePlayers)
    }, serverTick)

    socket.on('disconnect', _ => {
        onlinePlayers.delete(socket.id)
    })
})
