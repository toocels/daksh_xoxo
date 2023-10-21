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
	// var uniq_id = Date.now()
	var uniq_id = idd++;
	clients.push({ con: ws, stat: undefined, id: uniq_id })
	ws.send(uniq_id)

	// check if game available for client
	// if yes, give them stat
	var p1 = clients.find(client => client.stat == undefined && client.id != uniq_id)
	if (p1 != undefined) {
		console.log("[ GAME ] Match between:" + uniq_id + ' ' + p1.id + ' game:' + games)
		var p2 = clients[clients.length - 1]
		p1.stat = games;
		p2.stat = games;
		p1['con'].send(JSON.stringify({ "you_are": 'X' }))
		p2['con'].send(JSON.stringify({ "you_are": 'O' }))
		games++
	}

	ws.on('error', console.error)
	ws.on('message', (data) => {
		data = JSON.parse(data.toString())
		if (data['i_play'] != undefined) {

		}
	})

	ws.on('close', _ => {
		console.log("[ WS ]   A connection was closed")

		// remove connected client and partnet
		var p1 = clients.find(client => client.con == ws)
		console.log("[ GAME ] game ended for", p1['id'])

		var p2 = clients.find(client => client.stat == p1['stat'])
		if (p2 != undefined)
			p2.con.close()

		clients.splice(clients.indexOf(p1), 1);
	})
})

function findFriendFor(wss, uniq_id) {
	if (clients.length > 1 && clients[clients.length - 2].stat == undefined)
		return clients[clients.length - 2]
	return undefined
}

function getClient(ident, parm = "id") {
	for (var i in clients) {
		if (clients[i][parm] == ident) {
			return clients[i]
		}
	}
	return undefined
}

function printAll() {
	for (var i in clients)
		console.log(clients[i].id, clients[i].stat)
}