const express = require('express')
const app = express()
const WebSocket = require('ws')

const PORT = 80
const ADDRESS = "localhost"
const URL = ADDRESS + ':' + PORT

app.use(express.static('public'))
const server = app.listen(PORT, ADDRESS, _ => {
	console.log("Server listening on " + URL)
})

let wss = new WebSocket.Server({ server })
let clients = []
let games = 0
let idd = 10;

wss.on('connection', (ws) => {
	console.log("[ WS ]   New connection")

	// add client to database
	let current_id = Date.now()
	let p1 = { con: ws, stat: undefined, id: current_id }
	let p2 = clients.find(client => client.stat == undefined)
	clients.push(p1)

	// check if game available for client, if yes, give them stat [ stat == undefined => not in a game, stat == number => in a game]
	if (p2 != undefined) {
		let r = Math.random() > 0.5;
		p1.stat = games;
		p2.stat = games;
		p1['con'].send(JSON.stringify({ "purpose": "game_found", "data": { "you_are": r ? "X" : "O", "game": games } }));
		p2['con'].send(JSON.stringify({ "purpose": "game_found", "data": { "you_are": r ? "O" : "X", "game": games } }));
		games++;
	}

	ws.on('error', console.error)
	ws.on('message', (data) => {
		data = JSON.parse(data.toString())
		let p1 = clients.find(client => client.con == ws)
		let p2 = clients.find(client => client.stat == p1.stat && client.id != p1.id)

		// mostly just forwarding data between p1 and p2
		switch (data['purpose']) {
			case "my_name":
				p2.con.send(JSON.stringify({ "purpose": "my_name", "data": { "name": data['data']['name'] } }));
				break;
			case "i_play":
				p2.con.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": data['data']['pos'] } }));
				break;
		}
	})

	ws.on('close', _ => {
		// remove connected client and parter
		let p1 = clients.find(client => client.con == ws)
		let p2 = clients.find(client => client.stat == p1.stat && client.id != p1.id)
		if (p2 != undefined) {
			p2.con.send(JSON.stringify({ "purpose": "game_over" }))
			p2.con.close()
		}
		clients.splice(clients.indexOf(p1), 1);
		console.log("[ WS ]   A connection was closed")
	})
})