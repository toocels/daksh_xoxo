const express = require('express');
const app = express();
const WebSocket = require('ws');
const PORT = 80;
const ADDRESS = "localhost";
const URL = ADDRESS + ':' + PORT;

app.use(express.static('public'));
const server = app.listen(PORT, ADDRESS, _ => {
	console.log("Server listening on " + URL);
});

var wss = new WebSocket.Server({ server })

wss.on('connection', (ws) => {
	console.log("New client!")
	ws.send('something');

	ws.on('error', console.error);

	ws.on('message', (data) => {
		console.log('received: %s', data);
		ws.send('somethingelse');
	});
});