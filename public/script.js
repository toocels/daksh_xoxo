var my_turn = false;
var my_symbol = "X"
var socket;

function ready() {
	document.querySelector('.start_buttom').style.display = "none";
	document.querySelector('.loading-gif').style.display = "block";
	socket = new WebSocket("ws://" + window.location.hostname);
	socket.addEventListener("open", (event) => {});

	socket.addEventListener("message", (event) => {
		msg = JSON.parse(event.data)

		switch (msg['purpose']) {
			case "game_found":
				document.querySelector('.loading-gif').style.display = "none";
				document.querySelector('.you').style.display = "block";
				document.querySelector('.you').innerHTML = "You are playing:" + msg['data']['you_are']
				document.querySelector('.turn_stat').style.display = "block";

				my_symbol = msg['data']['you_are']
				my_turn = msg['data']['you_are'] == "X"
				if (msg['data']['you_are'] == "X")
					document.querySelector('.turn_stat').innerHTML = "Your turn"
				else {
					document.querySelector('.turn_stat').innerHTML = "Opponents turn"
					document.querySelector('.board').style.opacity = "0.5";
				}


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
				document.querySelector(".opponent").innerHTML = "opponent is" + msg['data']['name']
				break;
			case "i_play":
				if (my_symbol == "X")
					document.querySelectorAll(".cell")[msg['data']['pos']].innerHTML = "O"
				else
					document.querySelectorAll(".cell")[msg['data']['pos']].innerHTML = "X"
				my_turn = !my_turn
				document.querySelector('.board').style.opacity = "1";
				break;
		}
	});
}

function cell_click(id) {
	if (my_turn) {
		document.querySelector('.board').style.opacity = "0.5";
		document.querySelectorAll(".cell")[id].innerHTML = my_symbol
		socket.send(JSON.stringify({ "purpose": "i_play", "data": { "pos": id } }))
		console.log(id)
		my_turn = !my_turn;
	}
}