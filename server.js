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
	console.log("[ WS ] New connection")

	// add client to database
	// var uniq_id = Date.now()
	var uniq_id = idd++;
	clients.push({ con: ws, stat: undefined, id: uniq_id })
	ws.send(uniq_id)

	// check if game available for client
	var a = findFriendFor(ws)
	if (a != undefined) {
		console.log("Match between:" + uniq_id + ' ' + a.id + ' game:' + games)
		getClient(uniq_id).stat = games
		getClient(a.id).stat = games
		games++
	}

	ws.on('error', console.error)
	ws.on('message', (data) => {
		// console.log(data.toString())
	})

	ws.on('close', _ => {
		console.log("[ WS ] A connection was closed")

		// remove connected client and partnet
		var a = getClient(ws, "con")
		console.log("game ended for", a['id'])
		var st = a['stat'];
		clients.splice(clients.indexOf(a), 1);
		var b = getClient(st, "stat")
		if (b != undefined)
			b.con.close()

	})
})

function findFriendFor(wss, uniq_id) {
	if (clients.length > 1 && clients[clients.length - 2].stat == undefined)
		return clients[clients.length - 2]
	return undefined
}

function getClient(ident, parm = "id") {
	for (var i in clients)
		if (clients[i][parm] == ident)
			return clients[i]
	return undefined
}

function printAll() {
	for (var i in clients)
		console.log(clients[i].id, clients[i].stat)
}