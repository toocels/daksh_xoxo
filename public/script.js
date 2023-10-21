const socket = new WebSocket("ws://" + window.location.hostname);
socket.addEventListener("open", (event) => {});

socket.addEventListener("message", (event) => {
	msg = JSON.parse(event.data)

	switch (msg['purpose']) {
		case "game_found":
			console.log("Playing game number:", msg['data']['game'])
			console.log("Playing symbol:", msg['data']['you_are'])

			socket.send(JSON.stringify({
				"purpose": "my_name",
				"data": {
					"name": Date.now()
				}
			}))
			break;
		case "my_name":
			console.log("Other player name:", msg['data']['name'])
			break;
	}
});