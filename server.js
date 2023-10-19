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

wss.on('connection', (ws) => {
	console.log("[ WS ] New connection")
	clients.push({ "con": ws, "stat": undefined })
	// undefined means waiting
	// if a number means game number

	a = findGamePartners(ws)
	console.log(ws.id)
	if (a != undefined)
		console.log(a[0], a[1], a[2])

	// ws.on('error', console.error)
	// ws.on('message', (data) => {
	// 	ws.send('somethingelse')
	// })

	ws.on('close', (ws) => {
		console.log("[ WS ] A connection closed")

		for (var client in clients) { // remove client
			if (client.con == ws) {
				if (client.stat != undefined)
					delete clients[getGamePartner()]
				delete clients[client]
			}
		}
		findGamePartners()
	})
})

function findGamePartners(ws = undefined) {
	var pair = []
	if (ws != undefined)
		pair.push(ws)

	for (var client in clients) {
		if (client.stat == undefined && client != ws) {
			if (pair.length < 2)
				pair.push(client)
			else {
				pair.push(games++)
				return pair
			}
		}
	}
}

function getGamePartner(client) {
	for (var i in clients) {
		if (client.stat == i.stat)
			return i
	}
	return undefined
}