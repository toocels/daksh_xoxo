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

var wss = new WebSocket.Server({ server })
var clients = []
var games = 0
var idd = 10;

wss.on('connection', (ws) => {
	console.log("[ WS ]   New connection")

	// add client to database
	var current_id = idd++; // Date.now()
	clients.push({ con: ws, stat: undefined, id: current_id })
	ws.send(current_id)

	// check if game available for client, if yes, give them stat
	var p1 = clients[clients.length - 1]
	var p2 = clients.find(client => client.stat == undefined && client.id != current_id)
	if (p2 != undefined) {
		console.log("[ GAME ] Match between:" + current_id + ' ' + p2.id + ' game:' + games)
		p1.stat = games;
		p2.stat = games;
		p1['con'].send(JSON.stringify({ "purpose": "game_found", "data": { "you_are": "X", "game": games } }))
		p2['con'].send(JSON.stringify({ "purpose": "game_found", "data": { "you_are": "O", "game": games } }))
		games++
	}

	ws.on('error', console.error)
	ws.on('message', (data) => {
		data = JSON.parse(data.toString())

		var p1 = clients.find(client => client.con == ws)
		var p2 = clients.find(client => client.stat == p1.stat && client.id != p1.id)
		switch (data['purpose']) {
			case "my_name":
				p2.con.send(JSON.stringify({ "purpose": "my_name", "data": { "name": data['data']['name'] } }))
				break;
			case "i_play":
				p2.con.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": data['data']['pos'] } }))
				break;
		}
	})

	ws.on('close', _ => {
		console.log("[ WS ]   A connection was closed")

		// remove connected client and parter
		var p1 = clients.find(client => client.con == ws)
		var p2 = clients.find(client => client.stat == p1['stat'] && client.id != p1.id)
		p1.con.send(JSON.stringify({ "purpose": "close" }))
		if (p2 != undefined)
			p2.con.close()

		console.log("[ GAME ] Game ended for", p1['id'])
		clients.splice(clients.indexOf(p1), 1);
	})
})