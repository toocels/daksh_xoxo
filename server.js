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

	// add client to database
	var uniq_id = Date.now()
	clients.push({ con: ws, stat: undefined, id: uniq_id })
	ws.send(uniq_id)
	// check if game available for client
	var a = findFriendFor(wss, uniq_id)
	if (a != undefined) {
		console.log("Match between:" + uniq_id + ' ' + a.id + ' game:' + games)
		getClient(uniq_id).stat = games
		getClient(a.id).stat = games
		games++
	}

	ws.on('error', console.error)
	ws.on('message', (data) => {
		console.log(data.toString())
	})

	ws.on('close', (ws) => {
		console.log("[ WS ] A connection was closed")
		removeAlonePlayer(ws)
		printAll()
	})
})

function removeAlonePlayer(a) {
	for (var i in clients) {
		console.log(clients[i].con == a)
		console.log(clients[i].isAlive)
		console.log(a.isAlive)
	}
	// for (var i in clients) {
	// 	if (clients[i + 1] != undefined)
	// 		if (clients[i].stat != clients[i + 1].stat) {
	// 			clients.pop(clients[i])
	// 			console.log(clients[i].id)
	// 		}
	// 	i++
	// }
}

function findFriendFor(wss, uniq_id) {
	// for (var i in clients)
	// 	if (clients[i].stat == undefined && clients[i].id != uniq_id)
	// 		return clients[i]
	// return undefined
	if (clients.length > 1 && clients[clients.length - 2].stat == undefined)
		return clients[clients.length - 2]
	return undefined
}

function getClient(uniq_id) {
	for (var i in clients)
		if (clients[i].id == uniq_id)
			return clients[i]
	return undefined
}

function printAll() {
	for (var i in clients) {
		console.log(clients[i].id, clients[i].stat)
	}
}