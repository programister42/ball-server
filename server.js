const { Server } = require("socket.io");

const serverTick = 1000 / 30;
const usersCoordinates = new Map();

const io = new Server(3000, {
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
});

io.on("connection", (socket) => {
	socket.emit("id", socket.id);

	socket.on("user coordinates", ({ id, coordinates }) => {
		usersCoordinates.set(id, coordinates);
	});

	setInterval(() => {
		let users = [];
		for (const [id, coordinates] of usersCoordinates) {
			users.push({ id, coordinates });
		}
		socket.emit("users coordinates", users);
		console.log(users);
	}, serverTick);

	socket.on("disconnect", () => {
		usersCoordinates.delete(socket.id);
	});
});
